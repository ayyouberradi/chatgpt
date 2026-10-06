<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\ServiceResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageServices extends ManageRecords
{
    protected static string $resource = ServiceResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->modalWidth('5xl')];
    }
}
