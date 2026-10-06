<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class BusinessSetting extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['tax_percent'];

    protected function casts(): array
    {
        return ['tax_basis_points' => 'integer'];
    }

    protected static function booted(): void
    {
        static::saving(function (self $setting) {
            if ($setting->tax_basis_points > 10000) {
                throw ValidationException::withMessages(['tax_percent' => 'Tax cannot exceed 100%.']);
            }
            if ($setting->tax_mode !== 'vat') {
                $setting->tax_basis_points = 0;
            }
        });
    }

    public static function current(): self
    {
        return static::findOrFail(1);
    }

    public function getTaxPercentAttribute(): string
    {
        return Money::decimal($this->tax_basis_points);
    }

    public function setTaxPercentAttribute($value): void
    {
        $this->attributes['tax_basis_points'] = Money::scaled($value);
    }
}
