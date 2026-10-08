<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppReply extends Model
{
    protected $table = 'whatsapp_replies';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['received_at' => 'datetime'];
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
