<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\ContractResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageContracts extends ManageRecords
{
    protected static string $resource = ContractResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->modalWidth('7xl')->mutateDataUsing(fn (array $data) => $data + ['type' => 'contract', 'created_by' => auth()->id()])];
    }
}
