<?php

namespace App\Filament\Resources;

class CreditNoteResource extends DocumentResource
{
    protected static ?int $navigationSort = 4;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-receipt-refund';

    protected static ?string $navigationLabel = 'Credit notes';

    protected static ?string $modelLabel = 'Credit note';

    protected static ?string $slug = 'credit-notes';

    public static function documentType(): string
    {
        return 'credit_note';
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageCreditNotes::route('/')];
    }
}
