<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\BillingScheduleResource;
use App\Filament\Resources\InvoiceResource;
use App\Models\BusinessDocument;
use App\Services\DocumentWorkflow;
use Filament\Actions\Action;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRecords;
use Filament\Schemas\Components\Utilities\Get;
use Illuminate\Validation\ValidationException;

class ManageInvoices extends ManageRecords
{
    protected static string $resource = InvoiceResource::class;

    private static function historicalDate(?string $date): bool
    {
        return $date && preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/D', $date) && $date < now('Africa/Casablanca')->startOfMonth()->toDateString();
    }

    protected function getHeaderActions(): array
    {
        return [Action::make('create')->label('Create invoice from quote')->modalSubmitActionLabel('Continue')->schema([
            DatePicker::make('document_date')->label('Document date')->default(now('Africa/Casablanca')->toDateString())->maxDate(now('Africa/Casablanca')->toDateString())->live()->helperText('An earlier month lets you enter a historical monthly invoice. Current monthly invoices use automatic billing.'),
            Select::make('quote_id')->label('Accepted quote')->options(fn () => BusinessDocument::where('type', 'quote')->where('status', 'accepted')->whereNull('archived_at')->whereNotNull('issued_at')->with('client')->orderByDesc('id')->get()->mapWithKeys(fn ($quote) => [$quote->id => $quote->number.' · '.$quote->client->display_name.' · '.($quote->billing_period === 'monthly' ? 'Monthly billing' : 'One-time / yearly')]))->searchable()->preload()->live()->required()->helperText(fn (Get $get) => BusinessDocument::find($get('quote_id'))?->billing_period === 'monthly' ? (static::historicalDate($get('document_date')) ? 'This creates one historical monthly invoice at the full quote price for the selected month.' : 'This monthly quote uses automatic billing. Continue opens Monthly billing; no deposit or manual invoice will be created.') : 'Choose an accepted quote. Monthly quotes continue to automatic billing; other quotes create a draft invoice.')->noSearchResultsMessage('No matching accepted quote. Check the quote is accepted and has not been deleted.'),
            Select::make('payment_percent')->label('Payment type')->options([100 => 'Full payment (100%)', 50 => 'Deposit (50%)'])->default(100)->required()->visible(fn (Get $get) => BusinessDocument::find($get('quote_id'))?->billing_period !== 'monthly'),
        ])->action(function (array $data) {
            $quote = BusinessDocument::where('type', 'quote')->where('status', 'accepted')->whereNull('archived_at')->whereNotNull('issued_at')->find($data['quote_id']);
            if (! $quote) {
                throw ValidationException::withMessages(['quote_id' => 'Choose an active accepted quote.']);
            }
            if ($quote->billing_period === 'monthly' && ! static::historicalDate($data['document_date'] ?? null)) {
                $this->redirect(BillingScheduleResource::getUrl('index', ['quote_id' => $quote->id]));

                return;
            }
            app(DocumentWorkflow::class)->duplicate($quote, 'invoice', $quote->billing_period === 'monthly' ? 100 : (int) $data['payment_percent'])->update(['document_date' => $data['document_date'] ?? null]);
            Notification::make()->title('Draft invoice created')->success()->send();
        }), Action::make('monthly_billing')->label('Monthly billing')->url(BillingScheduleResource::getUrl())];
    }
}
