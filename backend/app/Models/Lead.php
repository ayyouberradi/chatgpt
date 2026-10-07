<?php

namespace App\Models;

use App\Support\WhatsAppPhone;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class Lead extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['whatsapp_consent', 'preferred_display'];

    protected function casts(): array
    {
        return ['follow_up_on' => 'date', 'preferred_at' => 'datetime', 'whatsapp_consent_at' => 'datetime', 'last_whatsapp_follow_up_at' => 'datetime'];
    }

    public function getWhatsappConsentAttribute(): bool
    {
        return $this->whatsapp_consent_at !== null;
    }

    public function setWhatsappConsentAttribute($value): void
    {
        $this->setAttribute('whatsapp_consent_at', $value ? ($this->whatsapp_consent_at ?? now()) : null);
    }

    public function getPreferredDisplayAttribute(): string
    {
        return $this->preferred_at ? $this->preferred_at->copy()->setTimezone($this->booking_timezone ?? 'UTC')->format('Y-m-d H:i').' ('.($this->booking_timezone ?? 'UTC').')' : 'Flexible';
    }

    public function followUps()
    {
        return $this->hasMany(LeadFollowUp::class);
    }

    public function whatsappReady(): bool
    {
        if (! $this->whatsapp_consent_at || ! $this->phone) {
            return false;
        }
        try {
            WhatsAppPhone::normalize($this->phone);

            return true;
        } catch (ValidationException) {
            return false;
        }
    }

    public function suggestedWhatsAppMessage(): string
    {
        $fr = BusinessSetting::current()->language === 'fr';
        $intro = $fr ? 'Bonjour '.$this->name.', merci pour votre demande.' : 'Hello '.$this->name.', thank you for your request.';
        $service = $this->service ? ($fr ? ' Prestation : ' : ' Service: ').$this->service.'.' : '';
        $booking = $this->preferred_at ? ($fr ? ' Votre créneau souhaité : ' : ' Your requested time: ').$this->preferred_display.'.' : '';
        $end = $fr ? ' Quand seriez-vous disponible pour en discuter et confirmer les prochaines étapes ?' : ' When would you be available to discuss this and confirm the next steps?';

        return $intro.$service.$booking.$end."\nAyoub Erradi · ".sprintf('REQ-%06d', $this->id);
    }

    public function client()
    {
        return $this->belongsTo(BusinessClient::class, 'business_client_id');
    }

    public function convertToClient(): BusinessClient
    {
        return DB::transaction(function () {
            $client = $this->business_client_id ? BusinessClient::findOrFail($this->business_client_id) : null;
            $email = trim($this->email ?? '') ?: null;
            $attributes = ['name' => $this->name, 'phone' => $this->phone, 'currency' => 'MAD', 'language' => 'fr'];
            $client ??= $email ? BusinessClient::firstOrCreate(['email' => $email], $attributes) : BusinessClient::create($attributes);
            $this->update(['business_client_id' => $client->id, 'status' => 'qualified']);
            AuditEvent::record('lead.converted', $this, ['client_id' => $client->id]);

            return $client;
        });
    }
}
