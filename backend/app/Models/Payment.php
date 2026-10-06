<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class Payment extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['paid_on' => 'date', 'voided_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::updating(function (self $payment) {
            if ($payment->isDirty(['business_document_id', 'amount', 'paid_on', 'method', 'reference', 'notes', 'recorded_by'])) {
                throw ValidationException::withMessages(['payment' => 'Recorded payments cannot be edited. Void the entry and record a replacement.']);
            }
        });
        static::deleting(fn () => throw ValidationException::withMessages(['payment' => 'Payments cannot be deleted; void incorrect entries.']));
    }

    public function document()
    {
        return $this->belongsTo(BusinessDocument::class, 'business_document_id');
    }

    public function getDisplayAmountAttribute(): string
    {
        return Money::decimal($this->amount).' '.$this->document->currency;
    }
}
