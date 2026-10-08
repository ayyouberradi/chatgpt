<?php

namespace App\Filament\Pages;

use App\Models\Lead;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Gate;

class SalesPipeline extends Page
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-view-columns';

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static ?int $navigationSort = 0;

    protected static ?string $title = 'Sales pipeline';

    protected string $view = 'filament.pages.sales-pipeline';

    public static function canAccess(): bool
    {
        return Gate::allows('manage-business');
    }

    public function move(int $id, string $stage): void
    {
        app(\App\Services\SalesPipeline::class)->move($id, $stage);
    }

    protected function getViewData(): array
    {
        Gate::authorize('manage-business');
        $stages = \App\Services\SalesPipeline::STAGES;
        $columns = [];
        foreach ($stages as $key => $label) {
            $columns[$key] = Lead::where('status', $key)->with('client')->orderByRaw('follow_up_on IS NULL')->orderBy('follow_up_on')->orderByDesc('id')->limit(100)->get();
        }

        return compact('stages', 'columns');
    }
}
