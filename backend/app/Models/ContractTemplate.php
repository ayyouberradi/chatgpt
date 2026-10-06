<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractTemplate extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_approved' => 'boolean'];
    }
}
