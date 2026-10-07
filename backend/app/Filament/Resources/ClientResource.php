<?php

namespace App\Filament\Resources;

use App\Models\BusinessClient;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
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
            TextInput::make('company')->label('Company name')->maxLength(255),
            TextInput::make('phone')->tel()->maxLength(60),
            TextInput::make('email')->email()->maxLength(255)->unique(ignoreRecord: true),
            TextInput::make('tax_identifier')->label('Client tax identifier')->maxLength(255),
            Select::make('currency')->options(['MAD' => 'MAD', 'EUR' => 'EUR', 'USD' => 'USD'])->default('MAD')->helperText('Uses MAD when left blank.'),
            Select::make('language')->options(['fr' => 'Français', 'en' => 'English'])->default('fr')->helperText('Uses French when left blank.'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('company')->label('Company name')->state(fn (BusinessClient $record) => $record->display_name)->searchable(['company', 'name'])->sortable(), TextColumn::make('email')->searchable(), TextColumn::make('phone'), IconColumn::make('is_active')->boolean()])->recordActions([EditAction::make()->modalWidth('5xl')])->defaultSort('id', 'desc');
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
