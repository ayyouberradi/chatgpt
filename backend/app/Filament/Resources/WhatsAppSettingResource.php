<?php

namespace App\Filament\Resources;

use App\Models\WhatsAppSetting;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class WhatsAppSettingResource extends Resource
{
    protected static ?string $model = WhatsAppSetting::class;

    protected static ?string $navigationLabel = 'WhatsApp Business';

    protected static ?string $slug = 'whatsapp-settings';

    protected static string|\UnitEnum|null $navigationGroup = 'Settings';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    public static function getEloquentQuery(): Builder
    {
        WhatsAppSetting::current();

        return parent::getEloquentQuery();
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Toggle::make('enabled')->label('Enable WhatsApp Business sending')->helperText('Requires Meta credentials and approved templates. New inquiries only; existing leads are not contacted automatically.'),
            Toggle::make('confirmations')->label('Automatic booking confirmations')->helperText('Sent after saving a consented inquiry. The requested time remains subject to confirmation.'),
            Toggle::make('followups')->label('Automatic lead follow-ups')->helperText('First follow-up 3 days after confirmation, then 7 days later. Maximum 2 automatic follow-ups. Replies and advanced sales stages stop them.'),
            TextInput::make('confirmation_template')->label('Approved confirmation template name')->regex('/^[a-z0-9_]+$/D')->maxLength(100)->helperText('Body parameters, in order: client name, request reference, service, requested time.'),
            TextInput::make('followup_template')->label('Approved follow-up template name')->regex('/^[a-z0-9_]+$/D')->maxLength(100)->helperText('Body parameters, in order: client name, request reference, service.'),
            Select::make('language')->options(['fr' => 'Français (fr)', 'en_US' => 'English (en_US)', 'ar' => 'Arabic (ar)'])->required()->default('fr')->helperText('Must match the approved template language.'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('connection')->state(fn () => WhatsAppSetting::missingConfiguration() ? 'Not connected: '.implode(', ', WhatsAppSetting::missingConfiguration()) : 'Credentials configured')->wrap(), TextColumn::make('enabled')->formatStateUsing(fn ($state) => $state ? 'Enabled' : 'Disabled')->badge(), TextColumn::make('confirmation_template'), TextColumn::make('followup_template'), TextColumn::make('language')])->recordActions([EditAction::make()]);
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
        return ['index' => Pages\ManageWhatsAppSettings::route('/')];
    }
}
