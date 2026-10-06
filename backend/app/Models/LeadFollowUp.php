<?php

namespace App\Models;

use App\Support\WhatsAppPhone;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class LeadFollowUp extends Model
{
    protected $guarded = ['id'];

    protected $attributes = ['status' => 'draft'];

    protected function casts(): array
    {
        return ['sent_at' => 'datetime'];
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    protected static function booted(): void
    {
        static::updating(function (self $record) {
            if ($record->getOriginal('sent_at') && $record->isDirty(['lead_id', 'phone', 'message', 'status', 'sent_at'])) {
                throw ValidationException::withMessages(['message' => 'Sent follow-ups cannot be edited.']);
            }
        });
        static::deleting(fn () => throw ValidationException::withMessages(['message' => 'Follow-up history cannot be deleted.']));
    }

    public function canOpen(): bool
    {
        return $this->lead->whatsappReady() && WhatsAppPhone::normalize($this->lead->phone) === $this->phone;
    }

    public function whatsappUrl(): string
    {
        if (! $this->canOpen()) {
            throw ValidationException::withMessages(['phone' => 'Confirm the current phone number and permission before contacting this lead.']);
        }

        return 'https://wa.me/'.substr($this->phone, 1).'?text='.rawurlencode($this->message);
    }
}
