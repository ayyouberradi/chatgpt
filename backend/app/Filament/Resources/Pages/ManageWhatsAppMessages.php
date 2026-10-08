<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\WhatsAppMessageResource;
use Filament\Resources\Pages\ManageRecords;

class ManageWhatsAppMessages extends ManageRecords
{
    protected static string $resource = WhatsAppMessageResource::class;
}
