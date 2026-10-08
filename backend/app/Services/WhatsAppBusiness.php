<?php

namespace App\Services;

use App\Models\AuditEvent;
use App\Models\Lead;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppSetting;
use App\Support\WhatsAppPhone;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class WhatsAppBusiness
{
    public function enqueue(Lead $original, string $kind = 'confirmation', bool $automatic = true): ?WhatsAppMessage
    {
        if (! $automatic) {
            Gate::authorize('manage-business');
        }
        $settings = WhatsAppSetting::current();
        if (! $settings->enabled || WhatsAppSetting::missingConfiguration() || ! $settings->templateFor($kind)) {
            return null;
        }
        if (! in_array($kind, ['confirmation', 'followup'])) {
            throw new \InvalidArgumentException('Invalid message kind');
        }
        if ($automatic && ! (($kind === 'confirmation' && $settings->confirmations) || ($kind === 'followup' && $settings->followups))) {
            return null;
        }

        return DB::transaction(function () use ($original, $kind, $automatic, $settings) {
            $lead = Lead::lockForUpdate()->findOrFail($original->id);
            if (! $lead->whatsappReady() || ($kind === 'followup' && in_array($lead->status, ['accepted', 'in_progress', 'completed', 'lost']))) {
                return null;
            }
            if ($automatic && $kind === 'followup' && ! WhatsAppMessage::where('lead_id', $lead->id)->where('kind', 'confirmation')->whereNotNull('submitted_at')->exists()) {
                return null;
            }
            if ($automatic && $kind === 'followup' && (! $lead->follow_up_on || $lead->follow_up_on->toDateString() > now('Africa/Casablanca')->toDateString() || WhatsAppMessage::where('lead_id', $lead->id)->where('kind', 'followup')->where('automatic', true)->count() >= 2)) {
                return null;
            }
            $key = $automatic ? $lead->id.':'.$kind.($kind === 'followup' ? ':'.$lead->follow_up_on->toDateString() : '') : 'manual:'.Str::uuid();
            $parameters = [$lead->name, sprintf('REQ-%06d', $lead->id), $lead->service ?: 'Consultation'];
            if ($kind === 'confirmation') {
                $parameters[] = $lead->preferred_at ? $lead->preferred_display : ($settings->language === 'fr' ? 'À convenir' : 'To be arranged');
            }
            $parameters = array_map(fn ($value) => mb_substr(trim(preg_replace('/\s+/u', ' ', (string) $value)), 0, 1024), $parameters);

            return WhatsAppMessage::firstOrCreate(['dedupe_key' => $key], ['lead_id' => $lead->id, 'phone' => WhatsAppPhone::normalize($lead->phone), 'kind' => $kind, 'automatic' => $automatic, 'template' => $settings->templateFor($kind), 'language' => $settings->language, 'parameters' => $parameters, 'available_at' => now(), 'expires_at' => now()->addHours(24)]);
        }, 5);
    }

    public function send(int $id): string
    {
        $message = DB::transaction(function () use ($id) {
            $m = WhatsAppMessage::lockForUpdate()->findOrFail($id);
            $s = WhatsAppSetting::current();
            if ($m->status !== 'queued' || $m->available_at->isFuture() || ! $s->enabled || WhatsAppSetting::missingConfiguration()) {
                return null;
            }
            $lead = $m->lead;
            if ($m->expires_at->isPast() || ! $lead->whatsappReady() || WhatsAppPhone::normalize($lead->phone) !== $m->phone || ($m->kind === 'followup' && (in_array($lead->status, ['accepted', 'in_progress', 'completed', 'lost']) || ($m->automatic && (! $lead->follow_up_on || ($lead->last_whatsapp_reply_at && $lead->last_whatsapp_reply_at->gte($m->created_at))))))) {
                $m->update(['status' => 'cancelled', 'last_error' => 'The request expired, contact permission changed, or follow-up is no longer needed.']);

                return null;
            }
            $m->update(['status' => 'sending', 'claimed_at' => now(), 'attempts' => $m->attempts + 1]);

            return $m;
        }, 5);
        if (! $message) {
            return WhatsAppMessage::findOrFail($id)->status;
        }
        try {
            $response = Http::withToken(config('whatsapp.access_token'))->acceptJson()->connectTimeout(5)->timeout(15)->post('https://graph.facebook.com/'.config('whatsapp.graph_version').'/'.config('whatsapp.phone_number_id').'/messages', [
                'messaging_product' => 'whatsapp', 'recipient_type' => 'individual', 'to' => ltrim($message->phone, '+'), 'type' => 'template',
                'template' => ['name' => $message->template, 'language' => ['code' => $message->language], 'components' => [['type' => 'body', 'parameters' => array_map(fn ($value) => ['type' => 'text', 'text' => $value], $message->parameters)]]],
            ]);
            $providerId = $response->json('messages.0.id');
            if ($response->successful() && is_string($providerId) && strlen($providerId) > 0 && strlen($providerId) <= 255) {
                DB::transaction(function () use ($message, $providerId) {
                    $m = WhatsAppMessage::lockForUpdate()->findOrFail($message->id);
                    $m->update(['status' => 'accepted', 'provider_message_id' => $providerId, 'submitted_at' => now(), 'last_error' => null]);
                    $lead = Lead::lockForUpdate()->findOrFail($m->lead_id);
                    $update = ['last_whatsapp_follow_up_at' => now()];
                    if ($m->automatic && $m->kind === 'confirmation' && $lead->status === 'new' && (! $lead->last_whatsapp_reply_at || $lead->last_whatsapp_reply_at->lt($m->created_at))) {
                        $update['follow_up_on'] = now('Africa/Casablanca')->addDays(3)->toDateString();
                    }
                    if ($m->automatic && $m->kind === 'followup' && $lead->follow_up_on && (! $lead->last_whatsapp_reply_at || $lead->last_whatsapp_reply_at->lt($m->created_at))) {
                        $update['follow_up_on'] = now('Africa/Casablanca')->addDays(7)->toDateString();
                    }
                    $lead->update($update);
                    AuditEvent::record('whatsapp.api_accepted', $m, ['lead_id' => $lead->id]);
                }, 5);
                $this->applyEvents($providerId);
            } elseif ($response->status() === 429 && $message->attempts < 3) {
                $message->update(['status' => 'queued', 'available_at' => now()->addMinutes(15), 'last_error' => 'Meta rate limited this request. A later retry is scheduled.']);
            } elseif ($response->status() >= 400 && $response->status() < 500) {
                $code = $response->json('error.code');
                $message->update(['status' => 'failed', 'last_error' => 'Meta rejected this request'.(is_numeric($code) ? ' (code '.(int) $code.')' : '').'. Check credentials, template approval and recipient eligibility.']);
            } else {
                $message->update(['status' => 'unknown', 'last_error' => 'Meta did not confirm acceptance. Check delivery in Meta before sending another message.']);
            }
        } catch (\Throwable $e) {
            $message->update(['status' => 'unknown', 'last_error' => 'The API response was interrupted. Check delivery in Meta before sending another message.']);
        }

        return $message->fresh()->status;
    }

    public function applyEvents(string $providerId): void
    {
        DB::transaction(function () use ($providerId) {
            $m = WhatsAppMessage::where('provider_message_id', $providerId)->lockForUpdate()->first();
            if (! $m) {
                return;
            }
            $ranks = ['accepted' => 0, 'sent' => 1, 'delivered' => 2, 'read' => 3];
            foreach (DB::table('whatsapp_status_events')->where('provider_message_id', $providerId)->orderBy('occurred_at')->orderBy('id')->get() as $event) {
                if ($event->status === 'failed') {
                    if (! in_array($m->status, ['delivered', 'read'])) {
                        $m->fill(['status' => 'failed', 'last_error' => 'Meta reported delivery failure'.($event->error_code ? ' (code '.$event->error_code.')' : '').'.']);
                    }
                } elseif (isset($ranks[$event->status]) && $ranks[$event->status] > ($ranks[$m->status] ?? -1)) {
                    $m->status = $event->status;
                    $m->last_error = null;
                    if (in_array($event->status, ['delivered', 'read'])) {
                        $m->delivered_at ??= $event->occurred_at;
                    }
                    if ($event->status === 'read') {
                        $m->read_at = $event->occurred_at;
                    }
                }
            }
            $m->save();
        }, 5);
    }

    public function run(): array
    {
        $settings = WhatsAppSetting::current();
        $queued = 0;
        $processed = 0;
        if (! $settings->enabled || WhatsAppSetting::missingConfiguration()) {
            return compact('queued', 'processed');
        }
        WhatsAppMessage::where('status', 'sending')->where('claimed_at', '<', now()->subMinutes(10))->update(['status' => 'unknown', 'last_error' => 'The sender stopped before recording its response. Check Meta before resending.']);
        if ($settings->followups) {
            foreach (Lead::where('id', '>', $settings->started_after_lead_id)->whereNotIn('status', ['accepted', 'in_progress', 'completed', 'lost'])->whereNotNull('follow_up_on')->whereDate('follow_up_on', '<=', now('Africa/Casablanca')->toDateString())->whereNotNull('whatsapp_consent_at')->limit(100)->get() as $lead) {
                $m = $this->enqueue($lead, 'followup');
                if ($m?->wasRecentlyCreated) {
                    $queued++;
                }
            }
        }
        foreach (WhatsAppMessage::where('status', 'queued')->where('available_at', '<=', now())->orderBy('id')->limit(60)->pluck('id') as $id) {
            $this->send($id);
            $processed++;
        }

        return compact('queued', 'processed');
    }
}
