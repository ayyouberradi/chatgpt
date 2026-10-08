<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\BillingScheduleResource;
use App\Filament\Resources\InvoiceResource;
use App\Models\BusinessDocument;
use App\Services\DocumentWorkflow;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRecords;
use Filament\Schemas\Components\Utilities\Get;
use Illuminate\Validation\ValidationException;

class ManageInvoices extends ManageRecords
{
    protected static string $resource = InvoiceResource::class;

    protected function getHeaderActions(): array
    {
        return [Action::make('create')->label('Create invoice from quote')->modalSubmitActionLabel('Continue')->schema([
            Select::make('quote_id')->label('Accepted quote')->options(fn () => BusinessDocument::where('type', 'quote')->where('status', 'accepted')->whereNull('archived_at')->whereNotNull('issued_at')->with('client')->orderByDesc('id')->get()->mapWithKeys(fn ($quote) => [$quote->id => $quote->number.' · '.$quote->client->display_name.' · '.($quote->billing_period === 'monthly' ? 'Monthly billing' : 'One-time / yearly')]))->searchable()->preload()->live()->required()->helperText(fn (Get $get) => BusinessDocument::find($get('quote_id'))?->billing_period === 'monthly' ? 'This monthly quote uses automatic billing. Continue opens Monthly billing; no deposit or manual invoice will be created.' : 'Choose an accepted quote. Monthly quotes continue to automatic billing; other quotes create a draft invoice.')->noSearchResultsMessage('No matching accepted quote. Check the quote is accepted and has not been deleted.'),
            Select::make('payment_percent')->label('Payment type')->options([100 => 'Full payment (100%)', 50 => 'Deposit (50%)'])->default(100)->required()->visible(fn (Get $get) => BusinessDocument::find($get('quote_id'))?->billing_period !== 'monthly'),
        ])->action(function (array $data) {
            $quote = BusinessDocument::where('type', 'quote')->where('status', 'accepted')->whereNull('archived_at')->whereNotNull('issued_at')->find($data['quote_id']);
            if (! $quote) {
                throw ValidationException::withMessages(['quote_id' => 'Choose an active accepted quote.']);
            }
            if ($quote->billing_period === 'monthly') {
                $this->redirect(BillingScheduleResource::getUrl('index', ['quote_id' => $quote->id]));

                return;
            }
            app(DocumentWorkflow::class)->duplicate($quote, 'invoice', (int) $data['payment_percent']);
            Notification::make()->title('Draft invoice created')->success()->send();
        }), Action::make('monthly_billing')->label('Monthly billing')->url(BillingScheduleResource::getUrl())];
    }
}
