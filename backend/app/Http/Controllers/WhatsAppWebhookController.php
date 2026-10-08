<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use App\Models\WhatsAppReply;
use App\Services\WhatsAppBusiness;
use Carbon\Carbon;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WhatsAppWebhookController extends Controller
{
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode', $request->query('hub.mode'));
        $token = $request->query('hub_verify_token', $request->query('hub.verify_token'));
        $challenge = $request->query('hub_challenge', $request->query('hub.challenge'));
        abort_unless($mode === 'subscribe' && is_string($token) && config('whatsapp.verify_token') && hash_equals((string) config('whatsapp.verify_token'), $token) && is_string($challenge) && preg_match('/^[0-9]{1,100}$/D', $challenge), 403);

        return response($challenge, 200)->header('Content-Type', 'text/plain')->header('Cache-Control', 'no-store');
    }

    public function receive(Request $request)
    {
        $raw = $request->getContent();
        abort_if(strlen($raw) > 1048576, 413);
        $secret = config('whatsapp.app_secret');
        abort_unless($secret && hash_equals('sha256='.hash_hmac('sha256', $raw, $secret), (string) $request->header('X-Hub-Signature-256')), 401);
        $payload = json_decode($raw, true);
        abort_unless(is_array($payload), 400);
        if (($payload['object'] ?? '') !== 'whatsapp_business_account') {
            return response()->json(['received' => true]);
        }
        foreach (($payload['entry'] ?? []) as $entry) {
            foreach (($entry['changes'] ?? []) as $change) {
                $value = $change['value'] ?? [];
                if ((string) ($value['metadata']['phone_number_id'] ?? '') !== (string) config('whatsapp.phone_number_id') || ! config('whatsapp.phone_number_id')) {
                    continue;
                }
                foreach (($value['statuses'] ?? []) as $event) {
                    $id = $event['id'] ?? null;
                    $status = $event['status'] ?? null;
                    $timestamp = $event['timestamp'] ?? null;
                    if (! is_string($id) || strlen($id) === 0 || strlen($id) > 255 || ! in_array($status, ['sent', 'delivered', 'read', 'failed']) || ! ctype_digit((string) $timestamp) || (int) $timestamp < 1577836800 || (int) $timestamp > now()->addDay()->timestamp) {
                        continue;
                    }
                    $code = $event['errors'][0]['code'] ?? null;
                    $code = is_numeric($code) ? (string) (int) $code : null;
                    DB::table('whatsapp_status_events')->insertOrIgnore(['event_key' => hash('sha256', $id.'|'.$status.'|'.$timestamp.'|'.$code), 'provider_message_id' => $id, 'status' => $status, 'occurred_at' => Carbon::createFromTimestampUTC((int) $timestamp), 'error_code' => $code, 'created_at' => now(), 'updated_at' => now()]);
                    app(WhatsAppBusiness::class)->applyEvents($id);
                }
                foreach (($value['messages'] ?? []) as $message) {
                    $id = $message['id'] ?? null;
                    $from = $message['from'] ?? null;
                    $timestamp = $message['timestamp'] ?? null;
                    if (! is_string($id) || strlen($id) === 0 || strlen($id) > 255 || ! is_string($from) || ! preg_match('/^[1-9][0-9]{7,14}$/D', $from) || ! ctype_digit((string) $timestamp) || (int) $timestamp < 1577836800 || (int) $timestamp > now()->addDay()->timestamp) {
                        continue;
                    }
                    $phone = '+'.$from;
                    $kind = substr((string) ($message['type'] ?? 'unknown'), 0, 40);
                    $text = $kind === 'text' ? mb_substr((string) ($message['text']['body'] ?? ''), 0, 4000) : null;
                    DB::transaction(function () use ($id, $phone, $kind, $text, $timestamp) {
                        $leads = Lead::where('phone', $phone)->orderByDesc('id')->lockForUpdate()->get();
                        $reply = WhatsAppReply::firstOrCreate(['provider_message_id' => $id], ['lead_id' => $leads->first()?->id, 'phone' => $phone, 'kind' => $kind, 'message' => $text, 'received_at' => Carbon::createFromTimestampUTC((int) $timestamp)]);
                        if (! $reply->wasRecentlyCreated) {
                            return;
                        }
                        foreach ($leads as $lead) {
                            $lead->update(['last_whatsapp_reply_at' => now(), 'follow_up_on' => null, 'status' => $lead->status === 'new' ? 'contacted' : $lead->status]);
                        }
                        foreach (User::where('role', 'admin')->get() as $admin) {
                            $admin->notifyNow(Notification::make()->title('New WhatsApp reply')->body('A client replied. Automatic follow-ups for this number have stopped.')->actions([Action::make('replies')->label('View replies')->url('/manage/whatsapp-replies')])->toDatabase());
                        }
                    }, 5);
                }
            }
        }

        return response()->json(['received' => true]);
    }
}
