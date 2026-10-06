<?php

namespace App\Services;

use App\Models\AuditEvent;
use App\Models\Lead;
use App\Models\LeadFollowUp;
use App\Support\WhatsAppPhone;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class LeadFollowUpWorkflow
{
    public function prepare(Lead $lead, string $message): LeadFollowUp
    {
        return DB::transaction(function () use ($lead, $message) {
            $lead = Lead::lockForUpdate()->findOrFail($lead->id);
            if (! $lead->whatsappReady()) {
                throw ValidationException::withMessages(['phone' => 'Add a valid phone number and confirm WhatsApp contact permission.']);
            }
            validator(['message' => $message], ['message' => 'required|string|min:10|max:3000'])->validate();
            $draft = $lead->followUps()->create(['phone' => WhatsAppPhone::normalize($lead->phone), 'message' => $message, 'created_by' => auth()->id()]);
            AuditEvent::record('whatsapp.draft_prepared', $lead, ['follow_up_id' => $draft->id]);

            return $draft;
        });
    }

    public function recordSent(LeadFollowUp $original, ?string $nextDate): void
    {
        DB::transaction(function () use ($original, $nextDate) {
            $lead = Lead::lockForUpdate()->findOrFail($original->lead_id);
            $record = LeadFollowUp::lockForUpdate()->findOrFail($original->id);
            if ($record->status !== 'draft' || ! $record->canOpen()) {
                throw ValidationException::withMessages(['message' => 'Only a current draft with WhatsApp permission can be recorded as sent.']);
            }
            validator(['next' => $nextDate], ['next' => 'nullable|date|after_or_equal:today'])->validate();
            $record->update(['status' => 'sent', 'sent_at' => now()]);
            $lead->update(['last_whatsapp_follow_up_at' => now(), 'status' => $lead->status === 'new' ? 'contacted' : $lead->status, 'follow_up_on' => $nextDate]);
            AuditEvent::record('whatsapp.sent_recorded_manually', $lead, ['follow_up_id' => $record->id]);
        });
    }
}
