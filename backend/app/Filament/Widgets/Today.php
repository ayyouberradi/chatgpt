<?php

namespace App\Filament\Widgets;

use App\Models\BillingSchedule;
use App\Models\BusinessDocument;
use App\Models\Lead;
use App\Models\ProjectTask;
use App\Support\Money;
use Filament\Widgets\Widget;

class Today extends Widget
{
    protected string $view = 'filament.widgets.today';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 0;

    protected static bool $isLazy = false;

    public function agenda(): array
    {
        $today = now('Africa/Casablanca')->toDateString();
        $week = now('Africa/Casablanca')->addDays(7)->toDateString();
        $link = fn ($path, $search) => '/manage/'.$path.'?'.http_build_query(['tableSearch' => $search]);
        $leads = Lead::whereNotIn('status', ['completed', 'lost'])->whereDate('follow_up_on', '<=', $today)->orderBy('follow_up_on')->get();
        $tasks = ProjectTask::with('project')->whereHas('project', fn ($q) => $q->whereNotIn('status', ['paused', 'completed']));
        $deadlines = (clone $tasks)->where('status', '!=', 'done')->whereDate('due_on', '<=', $week)->orderBy('due_on')->get();
        $approvals = (clone $tasks)->where('kind', 'deliverable')->where('client_visible', true)->whereHas('project', fn ($q) => $q->where('client_visible', true))->where('approval_status', 'awaiting')->orderBy('submitted_at')->get();
        $errors = BillingSchedule::with('quote.client')->where('status', 'active')->whereNotNull('last_error')->where('last_error', '!=', '')->get();
        $credits = BusinessDocument::where('type', 'credit_note')->whereNotNull('issued_at')->where('status', '!=', 'cancelled')->selectRaw('source_document_id, SUM(total_amount) as amount')->groupBy('source_document_id')->pluck('amount', 'source_document_id');
        $payments = BusinessDocument::with('client')->where('type', 'invoice')->whereNull('archived_at')->whereNotNull('issued_at')->where('status', '!=', 'cancelled')->whereDate('due_on', '<=', $week)->orderBy('due_on')->withSum(['payments as received_amount' => fn ($q) => $q->whereNull('voided_at')], 'amount')->get()->map(function ($invoice) use ($credits) {
            $invoice->agenda_balance = max(0, $invoice->total_amount - (int) $invoice->received_amount - (int) ($credits[$invoice->id] ?? 0));

            return $invoice;
        })->filter(fn ($invoice) => $invoice->agenda_balance > 0);
        $date = fn ($value) => $value?->format('d/m/Y');
        $section = fn ($title, $records, $path, $map) => ['title' => $title, 'count' => $records->count(), 'url' => '/manage/'.$path, 'items' => $records->take(5)->map($map)->values()->all()];

        return [
            $section('Follow-ups due', $leads, 'leads', fn ($l) => ['title' => $l->name, 'detail' => $l->service.' · '.$date($l->follow_up_on), 'url' => $link('leads', $l->name)]),
            $section('Payments due within 7 days or overdue', $payments, 'invoices', fn ($i) => ['title' => 'Facture N°'.$i->number.' · '.($i->client?->company ?? $i->title), 'detail' => Money::decimal($i->agenda_balance).' '.$i->currency.' · '.($i->due_on->toDateString() < $today ? 'Overdue' : 'Due').' '.$date($i->due_on), 'url' => $link('invoices', $i->number)]),
            $section('Deadlines within 7 days or overdue', $deadlines, 'project-tasks', fn ($t) => ['title' => $t->title, 'detail' => $t->project->name.' · '.$date($t->due_on), 'url' => $link('project-tasks', $t->title)]),
            $section('Awaiting client approval', $approvals, 'project-tasks', fn ($t) => ['title' => $t->title, 'detail' => $t->project->name.' · Revision '.$t->revision, 'url' => $link('project-tasks', $t->title)]),
            $section('Monthly billing needs attention', $errors, 'billing-schedules', fn ($s) => ['title' => $s->quote?->client?->company ?? $s->quote?->title ?? 'Monthly schedule', 'detail' => $s->last_error, 'url' => '/manage/billing-schedules']),
        ];
    }
}
