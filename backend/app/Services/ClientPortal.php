<?php

namespace App\Services;

use App\Models\AuditEvent;
use App\Models\BusinessClient;
use App\Models\ClientPortalAccess;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ClientPortal
{
    public function generate(BusinessClient $client): string
    {
        Gate::authorize('manage-business');

        return DB::transaction(function () use ($client) {
            $client = BusinessClient::lockForUpdate()->findOrFail($client->id);
            if (! $client->is_active) {
                throw ValidationException::withMessages(['client' => 'Activate this client before creating portal access.']);
            }
            ClientPortalAccess::where('business_client_id', $client->id)->whereNull('revoked_at')->update(['revoked_at' => now()]);
            $token = Str::random(64);
            $access = ClientPortalAccess::create(['business_client_id' => $client->id, 'token_hash' => hash('sha256', $token), 'expires_at' => now()->addDays(90)]);
            AuditEvent::record('portal.access_created', $access, ['client_id' => $client->id]);

            return url('/client-access/'.$token);
        });
    }

    public function revoke(BusinessClient $client): void
    {
        Gate::authorize('manage-business');
        DB::transaction(function () use ($client) {
            BusinessClient::lockForUpdate()->findOrFail($client->id);
            ClientPortalAccess::where('business_client_id', $client->id)->whereNull('revoked_at')->update(['revoked_at' => now()]);
            AuditEvent::record('portal.access_revoked', $client);
        });
    }
}
