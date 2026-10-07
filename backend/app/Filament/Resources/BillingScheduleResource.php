<?php

namespace App\Filament\Resources;

use App\Models\BillingSchedule;
use App\Models\BusinessDocument;
use App\Services\RecurringBilling;
use Filament\Actions\Action;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class BillingScheduleResource extends Resource
{
    protected static ?string $model = BillingSchedule::class;

    protected static ?string $navigationLabel = 'Monthly billing';

    protected static ?string $modelLabel = 'Monthly billing schedule';

    protected static string|\UnitEnum|null $navigationGroup = 'Finance';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-arrow-path';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('source_document_id')->label('Accepted monthly quote')->options(fn () => BusinessDocument::where('type', 'quote')->where('status', 'accepted')->where('billing_period', 'monthly')->whereNull('archived_at')->whereNotIn('id', BillingSchedule::select('source_document_id'))->with('client')->get()->mapWithKeys(fn ($q) => [$q->id => $q->number.' · '.$q->client->display_name.' · '.$q->display_total.'/month']))->searchable()->required()->helperText('Each invoice is issued automatically with the services and full monthly price from this quote.'),
            DatePicker::make('next_issue_on')->label('First invoice date')->default(now('Africa/Casablanca'))->minDate(now('Africa/Casablanca')->toDateString())->required()->helperText('Choose the first unbilled month. The day repeats monthly; shorter months use their last day.'),
            TextInput::make('payment_due_days')->label('Payment due after (days)')->numeric()->integer()->minValue(0)->maxValue(60)->default(7)->required(),
            DatePicker::make('end_on')->label('Last billing date (optional)')->afterOrEqual('next_issue_on'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('quote.client.display_name')->label('Client'), TextColumn::make('quote.number')->label('Quote'), TextColumn::make('quote.display_total')->label('Monthly amount'), TextColumn::make('next_issue_on')->date()->sortable(),
            TextColumn::make('payment_due_days')->label('Due after (days)'), TextColumn::make('status')->badge(), TextColumn::make('end_on')->date(), TextColumn::make('last_error')->label('Billing error')->wrap(),
        ])->recordActions([
            Action::make('pause')->requiresConfirmation()->visible(fn ($record) => $record->status === 'active')->action(fn ($record) => app(RecurringBilling::class)->changeStatus($record, 'paused')),
            Action::make('resume')->requiresConfirmation()->modalDescription('Resume future billing. Paused months are skipped without charges.')->visible(fn ($record) => $record->status === 'paused')->action(fn ($record) => app(RecurringBilling::class)->changeStatus($record, 'active')),
            Action::make('end')->color('danger')->requiresConfirmation()->modalDescription('Stop future invoices permanently. Existing invoices and payments are preserved.')->visible(fn ($record) => $record->status !== 'ended')->action(fn ($record) => app(RecurringBilling::class)->changeStatus($record, 'ended')),
            Action::make('invoices')->url(fn () => InvoiceResource::getUrl())->label('View invoices'),
        ])->defaultSort('id', 'desc');
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageBillingSchedules::route('/')];
    }
}
