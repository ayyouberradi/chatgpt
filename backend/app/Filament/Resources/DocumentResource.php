<?php

namespace App\Filament\Resources;

use App\Models\BusinessClient;
use App\Models\BusinessDocument;
use App\Models\BusinessSetting;
use App\Models\CatalogueService;
use App\Models\ContractTemplate;
use App\Services\DocumentWorkflow;
use App\Support\Money;
use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

abstract class DocumentResource extends Resource
{
    protected static ?string $model = BusinessDocument::class;

    protected static string|\UnitEnum|null $navigationGroup = 'Finance';

    abstract public static function documentType(): string;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('type', static::documentType())->whereNull('archived_at')->with(['client', 'items']);
    }

    public static function canDelete(Model $record): bool
    {
        return in_array($record->type, ['quote', 'invoice'], true) && ! $record->issued_at;
    }

    public static function canEdit(Model $record): bool
    {
        return ! $record->issued_at;
    }

    public static function form(Schema $schema): Schema
    {
        if (static::documentType() === 'invoice') {
            return $schema->components([
                TextInput::make('quote_reference')->label('Linked quote')->afterStateHydrated(fn (TextInput $component, ?BusinessDocument $record) => $component->state($record?->source?->number))->disabled()->dehydrated(false),
                TextInput::make('deposit_reference')->label('Deposit invoice')->afterStateHydrated(fn (TextInput $component, ?BusinessDocument $record) => $component->state($record?->depositInvoice?->number))->visible(fn (?BusinessDocument $record) => (bool) $record?->deposit_invoice_id)->disabled()->dehydrated(false),
                TextInput::make('payment_description')->label('Payment type')->afterStateHydrated(fn (TextInput $component, ?BusinessDocument $record) => $component->state($record?->deposit_invoice_id ? 'Final balance' : ($record?->payment_percent === 50 ? 'Deposit (50%)' : 'Full payment (100%)')))->disabled()->dehydrated(false),
                DatePicker::make('due_on')->label('Due date')->required(),
                Textarea::make('notes')->label('Internal notes — not printed')->maxLength(2000),
            ])->columns(2);
        }

        return $schema->components([
            Section::make('Document')->schema([
                Select::make('business_client_id')->label('Client')->relationship('client', 'company')->getOptionLabelFromRecordUsing(fn (BusinessClient $record) => $record->display_name)->searchable(['company', 'name', 'phone', 'email'])->preload()->required()->live()->afterStateUpdated(function ($state, Set $set) {
                    if ($c = BusinessClient::find($state)) {
                        $set('currency', $c->currency);
                        $set('language', $c->language);
                    }
                }),
                TextInput::make('title')->label('Project / document subject')->helperText('The PDF title and filename use the client name, document type and issue date (creation date for drafts).')->required()->maxLength(255),
                Select::make('currency')->options(['MAD' => 'MAD', 'EUR' => 'EUR', 'USD' => 'USD'])->default(fn () => BusinessSetting::current()->currency)->required(),
                Select::make('language')->options(['fr' => 'Français', 'en' => 'English'])->default(fn () => BusinessSetting::current()->language)->required(),
                Select::make('billing_period')->options(['one_time' => 'One-time', 'monthly' => 'Monthly', 'yearly' => 'Yearly'])->default('one_time')->required()->helperText('Use separate documents for one-time and recurring charges.'),
                DatePicker::make('due_on')->label(static::documentType() === 'quote' ? 'Valid until' : 'Due date')->default(now()->addDays(30))->required(in_array(static::documentType(), ['quote', 'invoice'])),
                Select::make('source_document_id')->label(static::documentType() === 'credit_note' ? 'Original invoice' : 'Accepted quote')->options(fn () => BusinessDocument::where('type', static::documentType() === 'credit_note' ? 'invoice' : 'quote')->whereNotNull('issued_at')->when(static::documentType() !== 'credit_note', fn ($q) => $q->where('status', 'accepted'))->orderByDesc('id')->get()->mapWithKeys(fn ($d) => [$d->id => $d->number.' · '.$d->client->display_name]))->searchable()->visible(static::documentType() !== 'quote')->required(in_array(static::documentType(), ['contract', 'credit_note'])),
                Select::make('contract_template_id')->label('Approved contract template')->options(fn () => ContractTemplate::where('is_approved', true)->pluck('name', 'id'))->visible(static::documentType() === 'contract')->required(static::documentType() === 'contract')->live()->afterStateUpdated(function ($state, Set $set) {
                    if ($t = ContractTemplate::find($state)) {
                        $set('terms', $t->body);
                        $set('language', $t->language);
                    }
                }),
            ])->columns(2),
            Section::make('Services and deliverables')->schema([
                Repeater::make('items')->relationship()->orderColumn('position')->defaultItems(1)->minItems(1)->maxItems(50)->schema([
                    Select::make('catalogue_service_id')->label('Service (optional)')->options(fn () => CatalogueService::where('is_active', true)->pluck('name', 'id'))->searchable()->live()->afterStateUpdated(function ($state, Get $get, Set $set) {
                        if ($s = CatalogueService::find($state)) {
                            if ($s->currency !== $get('../../currency')) {
                                Notification::make()->title('Choose a service in the document currency, or add a custom line.')->warning()->send();
                                $set('catalogue_service_id', null);

                                return;
                            }
                            $set('description', $s->name);
                            $set('unit_price', $s->price);
                            $set('billing_period', $s->billing_period);
                            $set('scope', trim(($s->scope ?? '')."\n\nIncluded revisions: ".$s->revision_limit.($s->exclusions ? "\nExcluded: ".$s->exclusions : '')));
                        }
                    }),
                    TextInput::make('description')->required()->maxLength(255),
                    TextInput::make('quantity')->required()->default('1.000')->regex('/^\d{1,5}([.,]\d{1,3})?$/'),
                    TextInput::make('unit_price')->label('Unit price')->required()->default('0.00')->regex('/^\d{1,9}([.,]\d{1,2})?$/'),
                    Select::make('billing_period')->options(['one_time' => 'One-time', 'monthly' => 'Monthly', 'yearly' => 'Yearly'])->default('one_time')->required(),
                    Textarea::make('scope')->label('Deliverables, revisions, exclusions')->rows(4)->columnSpanFull(),
                ])->columns(2)->collapsible()->itemLabel(fn (array $state): ?string => $state['description'] ?? null)->columnSpanFull(),
            ]),
            Section::make('Totals and terms')->schema([
                TextInput::make('discount')->label('Fixed discount')->default('0.00')->required()->regex('/^\d{1,9}([.,]\d{1,2})?$/'),
                TextInput::make('tax_percent')->label('Tax %')->default(fn () => BusinessSetting::current()->tax_percent)->required()->regex('/^\d{1,3}([.,]\d{1,2})?$/'),
                Textarea::make('terms')->rows(10)->default(fn () => static::documentType() === 'contract' ? null : BusinessSetting::current()->default_terms)->columnSpanFull(),
                Textarea::make('notes')->label('Internal notes — not printed')->rows(3)->columnSpanFull(),
            ])->columns(2),
        ])->columns(1);
    }

    public static function perform(callable $operation): void
    {
        try {
            $operation();
            Notification::make()->title('Saved')->success()->send();
        } catch (ValidationException $e) {
            Notification::make()->title('Cannot complete this action')->body(collect($e->errors())->flatten()->implode(' '))->danger()->persistent()->send();
        }
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('display_number')->label('Number')->searchable(['number', 'title']),
            TextColumn::make('client.company')->label('Client')->state(fn (BusinessDocument $record) => $record->client->display_name)->searchable(), TextColumn::make('title')->limit(35),
            TextColumn::make('display_total')->label('Total'), TextColumn::make('display_status')->label('Status')->badge(),
            TextColumn::make('balance')->label('Balance')->state(fn (BusinessDocument $r) => $r->type === 'invoice' && $r->issued_at ? Money::decimal($r->balanceAmount()).' '.$r->currency : '—'),
            TextColumn::make('due_on')->date()->sortable(),
        ])->filters([Filter::make('outstanding')->label('Outstanding invoices')->visible(static::documentType() === 'invoice')->query(fn (Builder $query) => $query->whereNotNull('issued_at')->whereRaw('total_amount > COALESCE((SELECT SUM(amount) FROM payments WHERE payments.business_document_id = business_documents.id AND voided_at IS NULL), 0) + COALESCE((SELECT SUM(total_amount) FROM business_documents AS credits WHERE credits.source_document_id = business_documents.id AND credits.type = ? AND credits.issued_at IS NOT NULL), 0)', ['credit_note'])), SelectFilter::make('status')->options(['draft' => 'Draft', 'issued' => 'Issued', 'accepted' => 'Accepted', 'declined' => 'Declined', 'signed' => 'Signed'])])->recordActions([
            EditAction::make()->visible(fn ($record) => ! $record->issued_at)->modalWidth('7xl'),
            ViewAction::make()->modalWidth('7xl'),
            Action::make('pdf')->label('Preview PDF')->url(fn ($record) => route('business.pdf', $record))->openUrlInNewTab(),
            Action::make('accept')->label('Mark accepted')->color('success')->requiresConfirmation()->modalDescription('Record the client’s acceptance. A draft will be issued and numbered first, and its contents will be locked.')->visible(fn ($record) => $record->type === 'quote' && in_array($record->status, ['draft', 'issued']))->action(fn ($record) => static::perform(fn () => app(DocumentWorkflow::class)->decideQuote($record, true))),
            Action::make('decline')->label('Mark rejected')->color('danger')->requiresConfirmation()->modalDescription('Record the client’s rejection. A draft will be issued and numbered first, and its contents will be locked.')->visible(fn ($record) => $record->type === 'quote' && in_array($record->status, ['draft', 'issued']))->action(fn ($record) => static::perform(fn () => app(DocumentWorkflow::class)->decideQuote($record, false))),
            ActionGroup::make([
                Action::make('delete_confirmed')->label('Delete')->color('danger')->requiresConfirmation()->modalDescription('Remove this confirmed document from the admin lists? Its number, payments and links will be retained for your financial history.')->visible(fn ($record) => in_array($record->type, ['quote', 'invoice'], true) && $record->issued_at)->action(fn ($record) => static::perform(fn () => app(DocumentWorkflow::class)->archive($record))),
                DeleteAction::make()->label('Delete draft')->requiresConfirmation()->modalDescription('Permanently delete this draft and its line items? Issued documents cannot be deleted.')->visible(fn ($record) => static::canDelete($record)),
                Action::make('issue')->label('Issue')->color('success')->requiresConfirmation()->modalDescription('This assigns a permanent number and locks the document. Check the preview PDF and totals first.')->visible(fn ($record) => ! $record->issued_at)->action(fn ($record) => static::perform(fn () => app(DocumentWorkflow::class)->issue($record))),
                Action::make('revision')->label('New quote revision')->visible(fn ($record) => $record->type === 'quote')->requiresConfirmation()->action(fn ($record) => static::perform(fn () => app(DocumentWorkflow::class)->duplicate($record, 'quote'))),
                Action::make('contract')->label('Create contract')->visible(fn ($record) => $record->type === 'quote' && $record->status === 'accepted')->action(fn ($record) => static::perform(fn () => app(DocumentWorkflow::class)->duplicate($record, 'contract'))),
                Action::make('invoice')->label('Create invoice')->visible(fn ($record) => $record->type === 'quote' && $record->status === 'accepted')->schema([Select::make('payment_percent')->label('Payment type')->options([100 => 'Full payment (100%)', 50 => 'Deposit (50%)'])->default(100)->required()])->action(fn ($record, array $data) => static::perform(fn () => app(DocumentWorkflow::class)->duplicate($record, 'invoice', (int) $data['payment_percent']))),
                Action::make('signed')->label('Record signed contract')->requiresConfirmation()->modalDescription('Use only after receiving the signed agreement. This does not provide electronic signature.')->visible(fn ($record) => $record->type === 'contract' && $record->status === 'issued')->action(fn ($record) => static::perform(fn () => app(DocumentWorkflow::class)->markSigned($record))),
                Action::make('final_invoice')->label('Create final balance invoice')->requiresConfirmation()->modalDescription('Creates a draft for the remaining quote amount, linked to this paid deposit invoice.')->visible(fn ($record) => $record->type === 'invoice' && $record->issued_at && $record->payment_percent === 50 && $record->paidAmount() >= $record->total_amount && $record->creditAmount() === 0 && ! BusinessDocument::where('deposit_invoice_id', $record->id)->exists())->action(fn ($record) => static::perform(fn () => app(DocumentWorkflow::class)->finalInvoice($record))),
                Action::make('payment')->label('Record payment')->visible(fn ($record) => $record->type === 'invoice' && $record->issued_at && $record->balanceAmount() > 0)->schema([
                    TextInput::make('amount')->required()->regex('/^\d{1,9}([.,]\d{1,2})?$/')->default(fn ($record) => Money::decimal($record->balanceAmount())),
                    DatePicker::make('paid_on')->required()->default(today())->maxDate(today()), Select::make('method')->options(['bank_transfer' => 'Bank transfer', 'cash' => 'Cash', 'card' => 'Card', 'other' => 'Other'])->required()->default('bank_transfer'), TextInput::make('reference')->maxLength(200), Textarea::make('notes')->maxLength(2000),
                ])->action(fn ($record, array $data) => static::perform(fn () => app(DocumentWorkflow::class)->recordPayment($record, $data))),
                Action::make('credit')->label('Create credit note')->visible(fn ($record) => $record->type === 'invoice' && $record->issued_at && $record->balanceAmount() > 0)->requiresConfirmation()->modalDescription('A draft is created. Adjust its line items to the amount being credited before issuing.')->action(fn ($record) => static::perform(fn () => app(DocumentWorkflow::class)->duplicate($record, 'credit_note'))),
            ])->label('Workflow')->button(),
        ])->defaultSort('id', 'desc');
    }
}
