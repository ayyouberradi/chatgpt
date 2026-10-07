<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessClient extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::saving(function (self $client) {
            $client->currency = $client->currency ?: 'MAD';
            $client->language = $client->language ?: 'fr';
            $client->email = trim($client->email ?? '') ?: null;
        });
    }

    public function getDisplayNameAttribute(): string
    {
        return trim($this->company ?? '') ?: (trim($this->name ?? '') ?: 'Client #'.$this->id);
    }

    public function documents()
    {
        return $this->hasMany(BusinessDocument::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
}
