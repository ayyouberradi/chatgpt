<?php

namespace App\Filament\Widgets;

use App\Models\BusinessDocument;
use App\Models\Lead;
use App\Support\Money;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class BusinessOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected static bool $isLazy = false;

    protected function getStats(): array
    {
        $stats = [Stat::make('New enquiries', Lead::where('status', 'new')->count())->description('Review the enquiries inbox')->url('/manage/leads'),
            Stat::make('Follow-ups due', Lead::whereNotIn('status', ['won', 'lost'])->whereDate('follow_up_on', '<=', today())->count())->url('/manage/leads'),
            Stat::make('Draft quotes', BusinessDocument::where('type', 'quote')->where('status', 'draft')->count())->url('/manage/quotes')];
        $balances = [];
        $overdue = 0;
        $invoices = BusinessDocument::where('type', 'invoice')->whereNotNull('issued_at')->withSum(['payments as received_amount' => fn ($q) => $q->whereNull('voided_at')], 'amount')->get();
        $credits = BusinessDocument::where('type', 'credit_note')->whereNotNull('issued_at')->selectRaw('source_document_id, SUM(total_amount) AS credited_amount')->groupBy('source_document_id')->pluck('credited_amount', 'source_document_id');
        foreach ($invoices as $invoice) {
            $balance = max(0, $invoice->total_amount - (int) $invoice->received_amount - (int) ($credits[$invoice->id] ?? 0));
            if ($balance > 0) {
                $balances[$invoice->currency] = ($balances[$invoice->currency] ?? 0) + $balance;
                if ($invoice->due_on?->endOfDay()->isPast()) {
                    $overdue++;
                }
            }
        }
        foreach ($balances as $currency => $amount) {
            $stats[] = Stat::make('Outstanding · '.$currency, Money::decimal($amount).' '.$currency)->url('/manage/invoices');
        }
        $stats[] = Stat::make('Overdue invoices', $overdue)->color($overdue ? 'danger' : 'success')->url('/manage/invoices');

        return $stats;
    }
}
