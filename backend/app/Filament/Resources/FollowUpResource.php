<?php

namespace App\Filament\Resources;

use App\Models\LeadFollowUp;
use App\Services\LeadFollowUpWorkflow;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class FollowUpResource extends Resource
{
    protected static ?string $model = LeadFollowUp::class;

    protected static ?string $navigationLabel = 'Manual WhatsApp follow-ups';

    protected static ?string $modelLabel = 'WhatsApp follow-up';

    protected static ?string $slug = 'whatsapp-follow-ups';

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?int $navigationSort = 4;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return $record->status === 'draft';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([Textarea::make('message')->required()->minLength(10)->maxLength(3000)->rows(10)]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('lead.name')->searchable(), TextColumn::make('phone')->searchable(), TextColumn::make('message')->limit(80)->wrap(), TextColumn::make('status')->badge(), TextColumn::make('sent_at')->dateTime()->sortable(), TextColumn::make('lead.follow_up_on')->label('Next follow-up')->date(), TextColumn::make('created_at')->dateTime()->sortable()])
            ->filters([SelectFilter::make('status')->options(['draft' => 'Prepared — not sent', 'sent' => 'Sent (recorded manually)'])])
            ->recordActions([
                EditAction::make()->visible(fn ($record) => $record->status === 'draft'),
                Action::make('open')->label('Open WhatsApp')->visible(fn ($record) => $record->canOpen())->url(fn ($record) => $record->canOpen() ? $record->whatsappUrl() : null)->openUrlInNewTab(),
                Action::make('sent')->label('Record sent')->visible(fn ($record) => $record->status === 'draft' && $record->canOpen())->requiresConfirmation()->modalDescription('Confirm that you have sent this message in WhatsApp. Opening a draft does not send it.')->schema([DatePicker::make('next_date')->label('Next follow-up date')->minDate(today())->default(today()->addDays(2))])->action(function ($record, array $data) {
                    app(LeadFollowUpWorkflow::class)->recordSent($record, $data['next_date'] ?? null);
                    Notification::make()->title('Follow-up recorded')->success()->send();
                }),
            ])->defaultSort('id', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageFollowUps::route('/')];
    }
}
