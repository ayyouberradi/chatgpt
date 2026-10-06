<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\LeadResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageLeads extends ManageRecords
{
    protected static string $resource = LeadResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->modalWidth('5xl')];
    }
}
