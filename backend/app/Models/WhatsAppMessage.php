<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppMessage extends Model
{
    protected $table = 'whatsapp_messages';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['parameters' => 'array', 'automatic' => 'boolean', 'available_at' => 'datetime', 'expires_at' => 'datetime', 'claimed_at' => 'datetime', 'submitted_at' => 'datetime', 'delivered_at' => 'datetime', 'read_at' => 'datetime'];
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
