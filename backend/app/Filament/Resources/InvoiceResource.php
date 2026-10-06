<?php

namespace App\Filament\Resources;

class InvoiceResource extends DocumentResource
{
    protected static ?int $navigationSort = 3;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-document-currency-dollar';

    protected static ?string $navigationLabel = 'Invoices';

    protected static ?string $modelLabel = 'Invoice';

    protected static ?string $slug = 'invoices';

    public static function documentType(): string
    {
        return 'invoice';
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageInvoices::route('/')];
    }
}
