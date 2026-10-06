<?php

namespace App\Filament\Resources;

class QuoteResource extends DocumentResource
{
    protected static ?int $navigationSort = 1;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-document-chart-bar';

    protected static ?string $navigationLabel = 'Quotes';

    protected static ?string $modelLabel = 'Quote';

    protected static ?string $slug = 'quotes';

    public static function documentType(): string
    {
        return 'quote';
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageQuotes::route('/')];
    }
}
