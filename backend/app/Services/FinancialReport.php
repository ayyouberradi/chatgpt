<?php

namespace App\Services;

use App\Models\BusinessDocument;
use App\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class FinancialReport
{
    public function month(string $month): array
    {
        Gate::authorize('manage-business');
        if (! preg_match('/^\d{4}-(0[1-9]|1[0-2])$/D', $month)) {
            throw ValidationException::withMessages(['month' => 'Choose a valid month.']);
        }
        $start = $month.'-01';
        $end = CarbonImmutable::parse($start, 'Africa/Casablanca')->endOfMonth()->toDateString();
        $inMonth = fn ($d) => ($d->document_date?->format('Y-m') ?? $d->issued_at?->timezone('Africa/Casablanca')->format('Y-m')) === $month;
        $documents = BusinessDocument::with(['client', 'items'])->whereIn('type', ['invoice', 'credit_note'])->whereNotNull('issued_at')->where('status', '!=', 'cancelled')->get();
        $invoices = $documents->where('type', 'invoice')->filter($inMonth);
        $credits = $documents->where('type', 'credit_note');
        $creditTotals = $credits->groupBy('source_document_id')->map(fn ($rows) => $rows->sum('total_amount'));
        $payments = Payment::with('document.client')->whereNull('voided_at')->whereHas('document', fn ($q) => $q->where('type', 'invoice')->whereNotNull('issued_at')->where('status', '!=', 'cancelled'))->get();
        $paidTotals = $payments->groupBy('business_document_id')->map(fn ($rows) => $rows->sum('amount'));
        $receipts = $payments->filter(fn ($p) => $p->paid_on->toDateString() >= $start && $p->paid_on->toDateString() <= $end);
        $currencies = [];
        $clients = [];
        $services = [];
        $rows = [];
        $init = fn () => ['invoiced' => 0, 'credits' => 0, 'received' => 0, 'outstanding' => 0, 'overdue' => 0];
        foreach ($invoices as $i) {
            $currency = $i->currency;
            $currencies[$currency] ??= $init();
            $key = $i->business_client_id.'|'.$currency;
            $clients[$key] ??= ['name' => $i->client?->display_name ?? 'Client', 'currency' => $currency] + $init();
            $balance = $i->archived_at ? 0 : max(0, $i->total_amount - ($paidTotals[$i->id] ?? 0) - ($creditTotals[$i->id] ?? 0));
            $overdue = $i->due_on && $i->due_on->toDateString() < now('Africa/Casablanca')->toDateString() ? $balance : 0;
            foreach (['invoiced' => $i->total_amount, 'outstanding' => $balance, 'overdue' => $overdue] as $field => $amount) {
                $currencies[$currency][$field] += $amount;
                $clients[$key][$field] += $amount;
            }
            foreach ($i->items as $item) {
                $serviceKey = $currency.'|'.$item->description;
                $services[$serviceKey] ??= ['name' => $item->description, 'currency' => $currency, 'amount' => 0];
                $services[$serviceKey]['amount'] += $item->lineAmount();
            }
            $rows[] = ['Invoice', $i->document_date?->toDateString() ?? $i->issued_at->timezone('Africa/Casablanca')->toDateString(), $i->number, $clients[$key]['name'], $currency, $i->total_amount, $balance, $i->archived_at ? 'Archived' : $i->status];
        }
        foreach ($credits->filter($inMonth) as $c) {
            $currencies[$c->currency] ??= $init();
            $currencies[$c->currency]['credits'] += $c->total_amount;
            $key = $c->business_client_id.'|'.$c->currency;
            $clients[$key] ??= ['name' => $c->client?->display_name ?? 'Client', 'currency' => $c->currency] + $init();
            $clients[$key]['credits'] += $c->total_amount;
            $rows[] = ['Credit note', $c->document_date?->toDateString() ?? $c->issued_at->timezone('Africa/Casablanca')->toDateString(), $c->number, $clients[$key]['name'], $c->currency, $c->total_amount, 0, $c->status];
        }
        foreach ($receipts as $p) {
            $i = $p->document;
            $currencies[$i->currency] ??= $init();
            $currencies[$i->currency]['received'] += $p->amount;
            $key = $i->business_client_id.'|'.$i->currency;
            $clients[$key] ??= ['name' => $i->client?->display_name ?? 'Client', 'currency' => $i->currency] + $init();
            $clients[$key]['received'] += $p->amount;
            $rows[] = ['Payment', $p->paid_on->toDateString(), $i->number, $clients[$key]['name'], $i->currency, $p->amount, 0, $p->method];
        }
        ksort($currencies);

        return compact('currencies', 'clients', 'services', 'rows');
    }
}
