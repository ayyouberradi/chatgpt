<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\CreditNoteResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageCreditNotes extends ManageRecords
{
    protected static string $resource = CreditNoteResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->modalWidth('7xl')->mutateDataUsing(fn (array $data) => $data + ['type' => 'credit_note', 'created_by' => auth()->id()])];
    }
}
