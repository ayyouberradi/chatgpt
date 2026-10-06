<?php

namespace App\Filament\Resources;

use App\Models\BusinessClient;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class ClientResource extends Resource
{
    protected static ?int $navigationSort = 2;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-users';

    protected static ?string $model = BusinessClient::class;

    protected static ?string $navigationLabel = 'Clients';

    protected static ?string $modelLabel = 'Client';

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static ?string $slug = 'clients';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required()->maxLength(255), TextInput::make('company')->maxLength(255),
            TextInput::make('email')->email()->required()->unique(ignoreRecord: true), TextInput::make('phone')->tel()->maxLength(60),
            Textarea::make('address')->label('Billing address')->rows(3), TextInput::make('tax_identifier')->label('Client tax identifier'),
            Select::make('currency')->options(['MAD' => 'MAD', 'EUR' => 'EUR', 'USD' => 'USD'])->default('MAD')->required(),
            Select::make('language')->options(['fr' => 'Français', 'en' => 'English'])->default('fr')->required(),
            Textarea::make('notes')->rows(3), Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('name')->searchable()->sortable(), TextColumn::make('company')->searchable(), TextColumn::make('email')->searchable(), TextColumn::make('phone'), IconColumn::make('is_active')->boolean()])->recordActions([EditAction::make()->modalWidth('5xl')])->defaultSort('id', 'desc');
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
        return ['index' => Pages\ManageClients::route('/')];
    }
}
