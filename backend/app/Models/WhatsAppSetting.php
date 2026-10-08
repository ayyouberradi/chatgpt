<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class WhatsAppSetting extends Model
{
    protected $table = 'whatsapp_settings';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['enabled' => 'boolean', 'confirmations' => 'boolean', 'followups' => 'boolean'];
    }

    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1])->fresh();
    }

    public static function missingConfiguration(): array
    {
        $missing = [];
        foreach (['access_token', 'phone_number_id', 'app_secret', 'verify_token'] as $key) {
            if (! config('whatsapp.'.$key)) {
                $missing[] = 'WHATSAPP_'.strtoupper($key);
            }
        }
        if (config('whatsapp.phone_number_id') && ! preg_match('/^[0-9]+$/D', (string) config('whatsapp.phone_number_id'))) {
            $missing[] = 'Valid numeric WhatsApp phone number ID';
        }
        if (! preg_match('/^v[0-9]+\.[0-9]+$/D', (string) config('whatsapp.graph_version'))) {
            $missing[] = 'Valid Graph API version';
        }

        return $missing;
    }

    protected static function booted(): void
    {
        static::saving(function (self $s) {
            if ($s->enabled && ! $s->getOriginal('enabled')) {
                $s->started_after_lead_id = Lead::max('id') ?? 0;
            }
            if ($s->enabled && $s->followups && ! $s->confirmations) {
                throw ValidationException::withMessages(['followups' => 'Enable booking confirmations before automatic follow-ups.']);
            }
            if ($s->enabled && (self::missingConfiguration() || ($s->confirmations && ! $s->confirmation_template) || ($s->followups && ! $s->followup_template))) {
                throw ValidationException::withMessages(['enabled' => 'Configure the Meta credentials and approved templates before enabling automatic sending.']);
            }
        });
    }

    public function templateFor(string $kind): ?string
    {
        return $kind === 'confirmation' ? $this->confirmation_template : $this->followup_template;
    }
}
