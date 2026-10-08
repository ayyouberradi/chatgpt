<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientPortalAccess extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['token_hash'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime', 'revoked_at' => 'datetime'];
    }

    public function client()
    {
        return $this->belongsTo(BusinessClient::class, 'business_client_id');
    }
}
