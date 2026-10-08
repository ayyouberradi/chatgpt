<?php

namespace App\Filament\Resources;

use App\Models\CatalogueService;
use App\Services\ContractTerms;
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

class ServiceResource extends Resource
{
    protected static ?int $navigationSort = 3;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-squares-plus';

    protected static ?string $model = CatalogueService::class;

    protected static ?string $navigationLabel = 'Service catalogue';

    protected static ?string $modelLabel = 'Service';

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static ?string $slug = 'services';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required()->maxLength(255), Textarea::make('description'),
            Select::make('contract_category')->label('Contract service category')->options(ContractTerms::CATEGORIES)->helperText('Optional override for generated contracts. Blank uses the service name; unrecognised services use custom terms.'),
            Textarea::make('scope')->label('Deliverables / scope')->rows(5), Textarea::make('exclusions')->label('What is excluded'),
            TextInput::make('revision_limit')->numeric()->integer()->minValue(0)->maxValue(100)->default(2)->required(),
            TextInput::make('price')->label('Unit price')->default('0.00')->required()->regex('/^\d{1,9}([.,]\d{1,2})?$/'),
            Select::make('currency')->options(['MAD' => 'MAD', 'EUR' => 'EUR', 'USD' => 'USD'])->default('MAD')->required(),
            Select::make('billing_period')->options(['one_time' => 'One-time', 'monthly' => 'Monthly', 'yearly' => 'Yearly'])->default('one_time')->required(), Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('name')->searchable()->sortable(), TextColumn::make('price'), TextColumn::make('currency'), TextColumn::make('billing_period')->badge(), IconColumn::make('is_active')->boolean()])->recordActions([EditAction::make()->modalWidth('5xl')])->defaultSort('id', 'desc');
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
        return ['index' => Pages\ManageServices::route('/')];
    }
}
