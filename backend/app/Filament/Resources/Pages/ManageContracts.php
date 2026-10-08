<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\ContractResource;
use App\Models\BusinessDocument;
use App\Services\DocumentWorkflow;
use Filament\Actions\CreateAction;
use Filament\Forms\Components\Select;
use Filament\Resources\Pages\ManageRecords;

class ManageContracts extends ManageRecords
{
    protected static string $resource = ContractResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->label('Create optional contract from quote')->schema([
            Select::make('quote_id')->label('Accepted quote')->options(fn () => BusinessDocument::where('type', 'quote')->where('status', 'accepted')->whereNull('archived_at')->whereNotNull('issued_at')->with('client')->orderByDesc('id')->get()->mapWithKeys(fn ($q) => [$q->id => $q->number.' · '.$q->client->display_name]))->searchable()->required(),
        ])->using(fn (array $data) => app(DocumentWorkflow::class)->duplicate(BusinessDocument::findOrFail($data['quote_id']), 'contract'))];
    }
}
