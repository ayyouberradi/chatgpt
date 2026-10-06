<?php

namespace App\Filament\Resources;

use App\Models\AuditEvent;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class AuditResource extends Resource
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-clock';

    protected static ?string $model = AuditEvent::class;

    protected static ?string $navigationLabel = 'Activity log';

    protected static string|\UnitEnum|null $navigationGroup = 'Settings';

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

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('created_at')->dateTime()->sortable(), TextColumn::make('user.email'), TextColumn::make('action')->searchable(), TextColumn::make('subject_type')->formatStateUsing(fn ($state) => class_basename($state)), TextColumn::make('subject_id')])->defaultSort('id', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageAudit::route('/')];
    }
}
