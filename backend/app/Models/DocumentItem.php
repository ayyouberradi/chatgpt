<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class DocumentItem extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['unit_price', 'quantity'];

    protected static function booted(): void
    {
        $guard = function (self $item) {
            if (BusinessDocument::whereIn('id', array_filter([$item->business_document_id, $item->getOriginal('business_document_id')]))->whereNotNull('issued_at')->exists()) {
                throw ValidationException::withMessages(['items' => 'Issued line items cannot be changed.']);
            }
        };
        static::saving($guard);
        static::deleting($guard);
    }

    public function document()
    {
        return $this->belongsTo(BusinessDocument::class, 'business_document_id');
    }

    public function service()
    {
        return $this->belongsTo(CatalogueService::class, 'catalogue_service_id');
    }

    public function getUnitPriceAttribute(): string
    {
        return Money::decimal($this->unit_amount);
    }

    public function setUnitPriceAttribute($value): void
    {
        $this->attributes['unit_amount'] = Money::scaled($value);
    }

    public function getQuantityAttribute(): string
    {
        return Money::decimal($this->quantity_milli, 3);
    }

    public function setQuantityAttribute($value): void
    {
        $quantity = Money::scaled($value, 3);
        if ($quantity < 1 || $quantity > 10000000) {
            throw ValidationException::withMessages(['quantity' => 'Quantity must be greater than zero and at most 10,000.']);
        }
        $this->attributes['quantity_milli'] = $quantity;
    }

    public function lineAmount(): int
    {
        return Money::rounded($this->quantity_milli * $this->unit_amount, 1000);
    }
}
