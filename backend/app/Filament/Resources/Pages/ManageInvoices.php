<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\InvoiceResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageInvoices extends ManageRecords
{
    protected static string $resource = InvoiceResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->modalWidth('7xl')->mutateDataUsing(fn (array $data) => $data + ['type' => 'invoice', 'created_by' => auth()->id()])];
    }
}
