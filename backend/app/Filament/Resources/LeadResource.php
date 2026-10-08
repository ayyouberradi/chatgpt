<?php

namespace App\Filament\Resources;

use App\Models\Lead;
use App\Models\WhatsAppSetting;
use App\Services\LeadFollowUpWorkflow;
use App\Services\SalesPipeline;
use App\Services\WhatsAppBusiness;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class LeadResource extends Resource
{
    protected static ?int $navigationSort = 1;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-inbox';

    protected static ?string $model = Lead::class;

    protected static ?string $navigationLabel = 'Leads & bookings';

    protected static ?string $modelLabel = 'Enquiry';

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static ?string $slug = 'leads';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required(), TextInput::make('email')->email()->required(), TextInput::make('phone')->tel()->helperText('Include country code, for example +212 708 295518'),
            Select::make('intent')->options(['enquiry' => 'Enquiry', 'discovery_call' => 'Discovery call', 'whatsapp' => 'WhatsApp request'])->default('enquiry')->required(),
            TextInput::make('preferred_display')->label('Requested time')->disabled()->dehydrated(false),
            Toggle::make('whatsapp_consent')->label('Permission for WhatsApp follow-up')->helperText('Enable only after the client has agreed to WhatsApp follow-up.'),
            TextInput::make('service'), TextInput::make('business'), TextInput::make('budget'), TextInput::make('timeline'), Textarea::make('message')->rows(4),
            Select::make('status')->options(SalesPipeline::STAGES)->default('new')->required(),
            DatePicker::make('follow_up_on'), Textarea::make('notes')->label('Internal notes'), TextInput::make('source')->default('manual')->required(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('name')->searchable()->sortable(), TextColumn::make('email')->searchable(), TextColumn::make('phone')->searchable(), TextColumn::make('source')->badge(), TextColumn::make('service'), TextColumn::make('intent')->badge(), TextColumn::make('preferred_display')->label('Requested time'), IconColumn::make('whatsapp_ready')->label('WhatsApp')->state(fn (Lead $record) => $record->whatsappReady())->boolean(), TextColumn::make('last_whatsapp_follow_up_at')->label('Last WhatsApp follow-up')->dateTime(), TextColumn::make('status')->badge(), TextColumn::make('follow_up_on')->date()->sortable(), TextColumn::make('created_at')->dateTime()->sortable()])->filters([SelectFilter::make('status')->options(SalesPipeline::STAGES), Filter::make('needs_follow_up')->label('Needs follow-up')->query(fn ($q) => $q->whereDate('follow_up_on', '<=', now('Africa/Casablanca')->toDateString())->whereNotIn('status', ['completed', 'lost']))])->recordActions([
            Action::make('business_whatsapp')->label('Send Business template')->requiresConfirmation()->modalDescription('Queue the approved follow-up template for this lead. Sending and delivery status appear in WhatsApp outbox.')->visible(fn (Lead $record) => $record->whatsappReady() && WhatsAppSetting::current()->enabled && ! in_array($record->status, ['accepted', 'in_progress', 'completed', 'lost']))->action(function (Lead $record) {
                $message = app(WhatsAppBusiness::class)->enqueue($record, 'followup', false);
                if (! $message) {
                    Notification::make()->title('Configure the approved follow-up template before sending')->warning()->send();

                    return;
                }
                defer(fn () => app(WhatsAppBusiness::class)->send($message->id));
                Notification::make()->title('Template queued — check WhatsApp outbox for delivery')->success()->send();
            }),
            Action::make('whatsapp')->label('Prepare WhatsApp')->visible(fn (Lead $record) => $record->whatsappReady())->schema([Textarea::make('message')->required()->minLength(10)->maxLength(3000)->rows(7)->default(fn (Lead $record) => $record->suggestedWhatsAppMessage())])->action(function (Lead $record, array $data) {
                $draft = app(LeadFollowUpWorkflow::class)->prepare($record, $data['message']);
                Notification::make()->title('Message prepared — send it in WhatsApp')->body('After sending, record it in WhatsApp follow-ups and choose the next follow-up date.')->success()->persistent()->actions([Action::make('open')->label('Open WhatsApp')->url($draft->whatsappUrl())->openUrlInNewTab(), Action::make('history')->label('Follow-ups')->url('/manage/whatsapp-follow-ups')])->send();
            }),
            Action::make('client')->label('Convert to client')->visible(fn (Lead $record) => ! $record->business_client_id)->requiresConfirmation()->action(function (Lead $record) {
                $record->convertToClient();
                Notification::make()->title('Client created. You can now link quotes to this inquiry.')->success()->send();
            }), EditAction::make()->modalWidth('5xl')])->defaultSort('id', 'desc');
    }

    public static function canCreate(): bool
    {
        return true;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageLeads::route('/')];
    }
}
