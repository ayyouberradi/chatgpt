<?php

namespace App\Filament\Resources;

use App\Models\Project;
use App\Models\ProjectTask;
use App\Services\ProjectWorkspace;
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
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class ProjectTaskResource extends Resource
{
    protected static ?string $model = ProjectTask::class;

    protected static ?string $navigationLabel = 'Tasks & deliverables';

    protected static ?string $slug = 'project-tasks';

    protected static string|\UnitEnum|null $navigationGroup = 'Projects';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-clipboard-document-check';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('project_id')->label('Project')->options(fn () => Project::pluck('name', 'id'))->default(fn ($livewire) => $livewire->tableFilters['project_id']['value'] ?? null)->searchable()->preload()->required()->disabled(fn (?ProjectTask $record) => (bool) $record)->dehydrated(),
            TextInput::make('title')->required()->maxLength(255), Select::make('kind')->label('Type')->options(['task' => 'Task', 'deliverable' => 'Deliverable for client review'])->default('task')->required(), Select::make('status')->options(ProjectTask::STATUSES)->default('todo')->required(), DatePicker::make('due_on')->label('Deadline'), Toggle::make('client_visible')->label('Show to client')->default(false)->helperText('Internal tasks stay private unless enabled. Deliverables must be visible to request approval.'),
            Textarea::make('description')->label('Description / client instructions')->maxLength(6000)->rows(5)->columnSpanFull(), TextInput::make('review_url')->label('Review link (optional)')->url()->maxLength(2048)->columnSpanFull(), Textarea::make('internal_notes')->label('Internal notes — never shared')->maxLength(6000)->columnSpanFull(),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('project.name')->label('Project')->searchable(), TextColumn::make('title')->searchable(), TextColumn::make('kind'), TextColumn::make('status')->badge(), TextColumn::make('due_on')->date()->sortable()->color(fn ($record) => $record->due_on?->isPast() && $record->status !== 'done' ? 'danger' : null), TextColumn::make('approval_status')->label('Client review')->badge(), TextColumn::make('revision'), TextColumn::make('client_feedback')->label('Client feedback')->wrap()->limit(120),
        ])->filters([SelectFilter::make('project_id')->label('Project')->options(fn () => Project::pluck('name', 'id')), SelectFilter::make('status')->options(ProjectTask::STATUSES), Filter::make('overdue')->query(fn ($q) => $q->whereDate('due_on', '<', now('Africa/Casablanca')->toDateString())->where('status', '!=', 'done'))])->recordActions([
            EditAction::make()->modalWidth('5xl'), Action::make('submit')->label('Request client approval')->requiresConfirmation()->modalDescription('The current version becomes available for approval in the client portal. Share their private portal link separately.')->visible(fn ($record) => $record->kind === 'deliverable' && $record->client_visible && $record->approval_status === 'draft')->action(fn ($record) => DocumentResource::perform(fn () => app(ProjectWorkspace::class)->submit($record->id))),
        ])->defaultSort('id', 'desc');
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ManageProjectTasks::route('/')];
    }
}
