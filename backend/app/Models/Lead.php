<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Lead extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['follow_up_on' => 'date'];
    }

    public function client()
    {
        return $this->belongsTo(BusinessClient::class, 'business_client_id');
    }

    public function convertToClient(): BusinessClient
    {
        return DB::transaction(function () {
            $client = BusinessClient::firstOrCreate(['email' => $this->email], ['name' => $this->name, 'phone' => $this->phone, 'currency' => 'MAD', 'language' => 'fr']);
            $this->update(['business_client_id' => $client->id, 'status' => 'qualified']);
            AuditEvent::record('lead.converted', $this, ['client_id' => $client->id]);

            return $client;
        });
    }
}
