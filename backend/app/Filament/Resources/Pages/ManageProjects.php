<?php

namespace App\Filament\Resources\Pages;

use App\Filament\Resources\ProjectResource;
use App\Models\BusinessDocument;
use App\Services\ProjectWorkspace;
use Filament\Actions\CreateAction;
use Filament\Forms\Components\Select;
use Filament\Resources\Pages\ManageRecords;

class ManageProjects extends ManageRecords
{
    protected static string $resource = ProjectResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->label('Create project from accepted quote')->schema([
            Select::make('quote_id')->label('Accepted quote')->options(fn () => BusinessDocument::where('type', 'quote')->where('status', 'accepted')->whereNotNull('issued_at')->whereNull('archived_at')->with('client')->get()->mapWithKeys(fn ($q) => [$q->id => $q->number.' · '.$q->client->display_name.' · '.$q->title]))->searchable()->preload()->required(),
        ])->using(fn (array $data) => app(ProjectWorkspace::class)->create((int) $data['quote_id']))];
    }
}
