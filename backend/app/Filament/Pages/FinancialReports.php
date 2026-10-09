<?php

namespace App\Filament\Pages;

use App\Services\FinancialReport;
use App\Support\Money;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Gate;

class FinancialReports extends Page
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-chart-bar';

    protected static string|\UnitEnum|null $navigationGroup = 'Finance';

    protected static ?string $title = 'Monthly financial reports';

    protected string $view = 'filament.pages.financial-reports';

    public string $month = '';

    public static function canAccess(): bool
    {
        return Gate::allows('manage-business');
    }

    public function mount(): void
    {
        $this->month = now('Africa/Casablanca')->format('Y-m');
    }

    protected function getViewData(): array
    {
        return ['report' => app(FinancialReport::class)->month($this->month)];
    }

    public function export()
    {
        $report = app(FinancialReport::class)->month($this->month);

        return response()->streamDownload(function () use ($report) {
            $stream = fopen('php://output', 'w');
            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, ['Entry type', 'Date', 'Document number', 'Client', 'Currency', 'Amount', 'Current outstanding', 'Status / payment method'], ',', '"', '');
            foreach ($report['rows'] as $row) {
                $row[5] = Money::decimal($row[5]);
                $row[6] = Money::decimal($row[6]);
                $row = array_map(fn ($v) => preg_match('/^[\s]*[=+@-]/u', (string) $v) ? "'".$v : $v, $row);
                fputcsv($stream, $row, ',', '"', '');
            }
            fclose($stream);
        }, 'financial-report-'.$this->month.'.csv', ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'private, no-store']);
    }
}
