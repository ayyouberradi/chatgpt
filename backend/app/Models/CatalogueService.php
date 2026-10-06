<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Model;

class CatalogueService extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['price'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function getPriceAttribute(): string
    {
        return Money::decimal($this->unit_amount);
    }

    public function setPriceAttribute($value): void
    {
        $this->attributes['unit_amount'] = Money::scaled($value);
    }
}
