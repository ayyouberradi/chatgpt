<?php

namespace App\Filament\Resources;

use App\Models\WhatsAppMessage;
use Filament\Actions\Action;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class WhatsAppMessageResource extends Resource
{
    protected static ?string $model = WhatsAppMessage::class;

    protected static ?string $navigationLabel = 'WhatsApp outbox';

    protected static ?string $slug = 'whatsapp-outbox';

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-paper-airplane';

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('lead.name')->searchable(), TextColumn::make('phone')->searchable(), TextColumn::make('kind')->badge(), TextColumn::make('template'), TextColumn::make('status')->badge(), TextColumn::make('attempts'), TextColumn::make('submitted_at')->label('API accepted')->dateTime(), TextColumn::make('delivered_at')->dateTime(), TextColumn::make('read_at')->dateTime(), TextColumn::make('last_error')->wrap(), TextColumn::make('created_at')->dateTime()->sortable()])->filters([SelectFilter::make('status')->options(['queued' => 'Queued', 'sending' => 'Sending', 'accepted' => 'API accepted — awaiting delivery', 'sent' => 'Sent', 'delivered' => 'Delivered', 'read' => 'Read', 'failed' => 'Failed', 'unknown' => 'Unconfirmed — check Meta', 'cancelled' => 'Cancelled'])])->recordActions([
            Action::make('cancel')->label('Cancel pending')->requiresConfirmation()->visible(fn ($record) => $record->status === 'queued')->action(function ($record) {
                DB::transaction(function () use ($record) {
                    $m = WhatsAppMessage::lockForUpdate()->findOrFail($record->id);
                    if ($m->status === 'queued') {
                        $m->update(['status' => 'cancelled']);
                    }
                });
            }),
        ])->defaultSort('id', 'desc');
    }

    public static function canCreate(): bool
    {
        return false;
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
        return ['index' => Pages\ManageWhatsAppMessages::route('/')];
    }
}
