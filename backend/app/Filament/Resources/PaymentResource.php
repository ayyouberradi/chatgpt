<?php

namespace App\Filament\Resources;

use App\Models\Payment;
use App\Services\DocumentWorkflow;
use Filament\Actions\Action;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class PaymentResource extends Resource
{
    protected static ?int $navigationSort = 5;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $model = Payment::class;

    protected static string|\UnitEnum|null $navigationGroup = 'Finance';

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
        return $table->columns([
            TextColumn::make('document.number')->searchable(), TextColumn::make('document.client.name')->searchable(), TextColumn::make('display_amount')->label('Amount'), TextColumn::make('paid_on')->date()->sortable(), TextColumn::make('method'), TextColumn::make('reference')->searchable(), TextColumn::make('voided_at')->dateTime(), TextColumn::make('void_reason')->wrap(),
        ])->recordActions([Action::make('void')->label('Void incorrect payment')->color('danger')->visible(fn (Payment $record) => ! $record->voided_at)->schema([Textarea::make('reason')->required()->minLength(5)->maxLength(2000)])->requiresConfirmation()->action(function (Payment $record, array $data) {
            app(DocumentWorkflow::class)->voidPayment($record, $data['reason']);
            Notification::make()->title('Payment voided; balance restored')->success()->send();
        })])->defaultSort('id', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManagePayments::route('/')];
    }
}
