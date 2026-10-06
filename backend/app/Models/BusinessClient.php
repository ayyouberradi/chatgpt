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

    public function documents()
    {
        return $this->hasMany(BusinessDocument::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
}
