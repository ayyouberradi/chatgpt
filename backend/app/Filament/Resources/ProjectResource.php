<?php

namespace App\Filament\Resources;

use App\Models\Project;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;

    protected static ?string $navigationLabel = 'Projects';

    protected static string|\UnitEnum|null $navigationGroup = 'Projects';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-briefcase';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required()->maxLength(255), Select::make('status')->options(Project::STATUSES)->required(), DatePicker::make('due_on')->label('Project deadline'), Toggle::make('client_visible')->label('Show project in client portal'), Textarea::make('notes')->label('Internal project notes')->maxLength(6000)->columnSpanFull(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('name')->searchable(), TextColumn::make('client.display_name')->label('Client'), TextColumn::make('quote.number')->label('Quote'), TextColumn::make('status')->formatStateUsing(fn ($state) => Project::STATUSES[$state] ?? $state)->badge(), TextColumn::make('due_on')->date()->sortable()->color(fn ($record) => $record->due_on?->isPast() && $record->status !== 'completed' ? 'danger' : null), TextColumn::make('tasks_count')->counts('tasks')->label('Tasks'),
        ])->recordActions([
            Action::make('workspace')->label('Workspace')->modalHeading(fn ($record) => $record->name)->modalContent(fn ($record) => view('filament.projects.workspace', ['project' => $record->load('tasks', 'quote')]))->modalSubmitAction(false)->modalCancelActionLabel('Close')->modalWidth('7xl'),
            EditAction::make(), Action::make('tasks')->label('Tasks & deliverables')->url(fn ($record) => ProjectTaskResource::getUrl('index', ['tableFilters' => ['project_id' => ['value' => $record->id]]])),
        ])->defaultSort('id', 'desc');
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageProjects::route('/')];
    }
}
