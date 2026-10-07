<?php

namespace App\Filament\Resources;

use App\Models\BusinessSetting;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class SettingResource extends Resource
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $model = BusinessSetting::class;

    protected static ?string $navigationLabel = 'Business settings';

    protected static ?string $modelLabel = 'Business settings';

    protected static string|\UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $slug = 'settings';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('legal_name')->label('Legal business name')->required(), Textarea::make('address')->required(), TextInput::make('email')->email()->required(), TextInput::make('phone'),
            TextInput::make('business_type')->label('Legal form / business status')->required(), TextInput::make('tax_identifier'), TextInput::make('registration_number'),
            Select::make('tax_mode')->options(['not_configured' => 'Not configured — issuing blocked', 'vat' => 'VAT registered', 'no_vat' => 'No VAT charged'])->required(),
            TextInput::make('tax_percent')->label('Default tax %')->required()->regex('/^\d{1,3}([.,]\d{1,2})?$/')->helperText('Confirm the applicable tax treatment for your business before issuing.'),
            Select::make('currency')->options(['MAD' => 'MAD', 'EUR' => 'EUR', 'USD' => 'USD'])->required(), Select::make('language')->options(['fr' => 'Français', 'en' => 'English'])->required(),
            Textarea::make('pdf_footer')->label('Quote / invoice legal footer')->rows(6)->maxLength(600)->helperText('Optional custom footer: legal name, CNIE, address, ICE, IF, professional tax, phone and email. Keep it to a few short lines. Leave blank to use your business identity fields.')->columnSpanFull(),
            Textarea::make('payment_instructions')->rows(4)->helperText('Bank details and payment reference instructions printed on documents.'), Textarea::make('default_terms')->rows(5),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('legal_name')->placeholder('Configure business identity'), TextColumn::make('tax_mode')->badge(), TextColumn::make('currency'), TextColumn::make('language')])->recordActions([EditAction::make()->modalWidth('5xl')])->defaultSort('id', 'desc');
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageSettings::route('/')];
    }
}
