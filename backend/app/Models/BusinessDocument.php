<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class BusinessDocument extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['discount', 'tax_percent'];

    protected function casts(): array
    {
        return ['issuer_snapshot' => 'array', 'client_snapshot' => 'array', 'issued_at' => 'datetime', 'accepted_at' => 'datetime', 'signed_at' => 'datetime', 'due_on' => 'date', 'discount_amount' => 'integer', 'tax_basis_points' => 'integer', 'subtotal_amount' => 'integer', 'tax_amount' => 'integer', 'total_amount' => 'integer'];
    }

    protected static function booted(): void
    {
        static::updating(function (self $document) {
            if ($document->getOriginal('issued_at') && $document->isDirty(['type', 'number', 'business_client_id', 'source_document_id', 'contract_template_id', 'title', 'currency', 'language', 'billing_period', 'due_on', 'discount_amount', 'tax_basis_points', 'subtotal_amount', 'tax_amount', 'total_amount', 'terms', 'notes', 'issuer_snapshot', 'client_snapshot', 'issued_at'])) {
                throw ValidationException::withMessages(['document' => 'Issued documents cannot be edited. Create a new draft revision.']);
            }
        });
        static::deleting(function (self $document) {
            if ($document->issued_at) {
                throw ValidationException::withMessages(['document' => 'Issued documents cannot be deleted.']);
            }
        });
    }

    public function client()
    {
        return $this->belongsTo(BusinessClient::class, 'business_client_id');
    }

    public function source()
    {
        return $this->belongsTo(self::class, 'source_document_id');
    }

    public function template()
    {
        return $this->belongsTo(ContractTemplate::class, 'contract_template_id');
    }

    public function items()
    {
        return $this->hasMany(DocumentItem::class)->orderBy('position');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getDiscountAttribute(): string
    {
        return Money::decimal($this->discount_amount);
    }

    public function setDiscountAttribute($value): void
    {
        $this->attributes['discount_amount'] = Money::scaled($value);
    }

    public function getTaxPercentAttribute(): string
    {
        return Money::decimal($this->tax_basis_points);
    }

    public function setTaxPercentAttribute($value): void
    {
        $this->attributes['tax_basis_points'] = Money::scaled($value);
    }

    public function totals(): array
    {
        $subtotal = 0;
        foreach ($this->items as $item) {
            $line = $item->lineAmount();
            if ($line > 99999999999 - $subtotal) {
                throw ValidationException::withMessages(['items' => 'Document amounts cannot exceed 999,999,999.99.']);
            }
            $subtotal += $line;
        }
        if ($this->discount_amount > $subtotal) {
            throw ValidationException::withMessages(['discount' => 'Discount cannot exceed the subtotal.']);
        }
        if ($this->tax_basis_points > 10000) {
            throw ValidationException::withMessages(['tax_percent' => 'Tax must be between 0 and 100%.']);
        }
        $tax = Money::rounded(($subtotal - $this->discount_amount) * $this->tax_basis_points, 10000);

        $total = $subtotal - $this->discount_amount + $tax;
        if ($total > 99999999999) {
            throw ValidationException::withMessages(['items' => 'Document total cannot exceed 999,999,999.99.']);
        }

        return ['subtotal_amount' => $subtotal, 'tax_amount' => $tax, 'total_amount' => $total];
    }

    public function paidAmount(): int
    {
        return (int) $this->payments()->whereNull('voided_at')->sum('amount');
    }

    public function creditAmount(): int
    {
        return (int) static::where('source_document_id', $this->id)->where('type', 'credit_note')->whereNotNull('issued_at')->sum('total_amount');
    }

    public function balanceAmount(): int
    {
        return max(0, $this->total_amount - $this->paidAmount() - $this->creditAmount());
    }

    public function getDisplayNumberAttribute(): string
    {
        return $this->number ?? 'Draft #'.$this->id;
    }

    public function getDisplayTotalAttribute(): string
    {
        try {
            $total = $this->issued_at ? $this->total_amount : $this->totals()['total_amount'];
        } catch (ValidationException) {
            return 'Check amounts';
        }

        return Money::decimal($total).' '.$this->currency;
    }

    public function getDisplayStatusAttribute(): string
    {
        if ($this->type === 'invoice' && $this->issued_at) {
            if ($this->balanceAmount() === 0) {
                return $this->paidAmount() > 0 ? 'paid' : 'credited';
            }
            if ($this->due_on?->endOfDay()->isPast()) {
                return 'overdue';
            }
            if ($this->paidAmount() > 0) {
                return 'partially_paid';
            }
        }

        return $this->status;
    }
}
