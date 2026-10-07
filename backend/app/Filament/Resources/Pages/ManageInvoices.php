<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\InvoiceResource;
use App\Models\BusinessDocument;
use App\Services\DocumentWorkflow;
use Filament\Actions\CreateAction;
use Filament\Forms\Components\Select;
use Filament\Resources\Pages\ManageRecords;

class ManageInvoices extends ManageRecords
{
    protected static string $resource = InvoiceResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->label('Create invoice from quote')->schema([
            Select::make('quote_id')->label('Accepted quote')->options(fn () => BusinessDocument::where('type', 'quote')->where('status', 'accepted')->whereNotNull('issued_at')->with('client')->orderByDesc('id')->get()->mapWithKeys(fn ($quote) => [$quote->id => $quote->number.' · '.$quote->client->display_name]))->searchable()->required(),
            Select::make('payment_percent')->label('Payment type')->options([100 => 'Full payment (100%)', 50 => 'Deposit (50%)'])->default(100)->required(),
        ])->using(fn (array $data) => app(DocumentWorkflow::class)->duplicate(BusinessDocument::findOrFail($data['quote_id']), 'invoice', (int) $data['payment_percent']))];
    }
}
