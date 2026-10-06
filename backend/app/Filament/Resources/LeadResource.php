<?php

namespace App\Filament\Resources;

use App\Models\Lead;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class LeadResource extends Resource
{
    protected static ?int $navigationSort = 1;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-inbox';

    protected static ?string $model = Lead::class;

    protected static ?string $navigationLabel = 'Enquiries';

    protected static ?string $modelLabel = 'Enquiry';

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static ?string $slug = 'leads';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required(), TextInput::make('email')->email()->required(), TextInput::make('phone')->tel(),
            TextInput::make('service'), TextInput::make('business'), TextInput::make('budget'), TextInput::make('timeline'), Textarea::make('message')->rows(4),
            Select::make('status')->options(['new' => 'New', 'contacted' => 'Contacted', 'qualified' => 'Qualified', 'won' => 'Won', 'lost' => 'Lost'])->default('new')->required(),
            DatePicker::make('follow_up_on'), Textarea::make('notes')->label('Internal notes'), TextInput::make('source')->default('manual')->required(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('name')->searchable()->sortable(), TextColumn::make('email')->searchable(), TextColumn::make('service'), TextColumn::make('status')->badge(), TextColumn::make('follow_up_on')->date()->sortable(), TextColumn::make('created_at')->dateTime()->sortable()])->filters([SelectFilter::make('status')->options(['new' => 'New', 'contacted' => 'Contacted', 'qualified' => 'Qualified', 'won' => 'Won', 'lost' => 'Lost'])])->recordActions([Action::make('client')->label('Convert to client')->visible(fn (Lead $record) => ! $record->business_client_id)->requiresConfirmation()->action(function (Lead $record) {
            $record->convertToClient();
            Notification::make()->title('Client created. Complete their billing address in Clients.')->success()->send();
        }), EditAction::make()->modalWidth('5xl')])->defaultSort('id', 'desc');
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
        return ['index' => Pages\ManageLeads::route('/')];
    }
}
