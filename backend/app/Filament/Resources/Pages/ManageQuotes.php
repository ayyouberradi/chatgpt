<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\QuoteResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageQuotes extends ManageRecords
{
    protected static string $resource = QuoteResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->modalWidth('7xl')->mutateDataUsing(fn (array $data) => $data + ['type' => 'quote', 'created_by' => auth()->id()])];
    }
}
