<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\AuditResource;
use Filament\Resources\Pages\ManageRecords;

class ManageAudit extends ManageRecords
{
    protected static string $resource = AuditResource::class;
}
