<?php

namespace App\Filament\Resources;

class ContractResource extends DocumentResource
{
    protected static ?int $navigationSort = 2;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-document-check';

    protected static ?string $navigationLabel = 'Contracts';

    protected static ?string $modelLabel = 'Contract';

    protected static ?string $slug = 'contracts';

    public static function documentType(): string
    {
        return 'contract';
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageContracts::route('/')];
    }
}
