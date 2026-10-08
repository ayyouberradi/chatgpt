<?php

namespace App\Filament\Resources;

use App\Models\WhatsAppReply;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class WhatsAppReplyResource extends Resource
{
    protected static ?string $model = WhatsAppReply::class;

    protected static ?string $navigationLabel = 'WhatsApp replies';

    protected static ?string $slug = 'whatsapp-replies';

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-chat-bubble-left';

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('lead.name')->searchable(), TextColumn::make('phone')->searchable(), TextColumn::make('kind')->badge(), TextColumn::make('message')->wrap()->limit(500), TextColumn::make('received_at')->dateTime()->sortable()])->defaultSort('id', 'desc');
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
        return ['index' => Pages\ManageWhatsAppReplies::route('/')];
    }
}
