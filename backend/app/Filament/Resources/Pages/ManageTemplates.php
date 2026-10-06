<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\TemplateResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageTemplates extends ManageRecords
{
    protected static string $resource = TemplateResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->modalWidth('5xl')];
    }
}
