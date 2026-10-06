<?php

namespace App\Filament\Resources;

use App\Models\ContractTemplate;
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

class TemplateResource extends Resource
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $model = ContractTemplate::class;

    protected static ?string $navigationLabel = 'Contract templates';

    protected static ?string $modelLabel = 'Contract template';

    protected static string|\UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $slug = 'templates';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required(), Select::make('language')->options(['fr' => 'Français', 'en' => 'English'])->default('fr')->required(),
            Textarea::make('body')->label('Contract terms')->rows(18)->required()->helperText('Write complete terms covering scope, delivery, revisions, client responsibilities, payment, ownership, confidentiality and cancellation. Service scope is appended separately to the PDF.'),
            Toggle::make('is_approved')->label('Approved for use')->helperText('Only approve after reviewing the complete terms for your business.'),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('name')->searchable(), TextColumn::make('language')->badge(), IconColumn::make('is_approved')->boolean()])->recordActions([EditAction::make()->modalWidth('5xl')])->defaultSort('id', 'desc');
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
        return ['index' => Pages\ManageTemplates::route('/')];
    }
}
