<?php

namespace App\Services;

use App\Models\AuditEvent;
use App\Models\BillingSchedule;
use App\Models\BusinessDocument;
use App\Models\User;
use App\Support\Money;
use Carbon\Carbon;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class RecurringBilling
{
    public function create(array $data): BillingSchedule
    {
        validator($data, ['source_document_id' => 'required|integer', 'next_issue_on' => 'required|date', 'payment_due_days' => 'required|integer|min:0|max:60', 'end_on' => 'nullable|date|after_or_equal:next_issue_on'])->validate();

        return DB::transaction(function () use ($data) {
            $quote = BusinessDocument::lockForUpdate()->findOrFail($data['source_document_id']);
            if ($quote->type !== 'quote' || $quote->status !== 'accepted' || ! $quote->issued_at || $quote->archived_at || $quote->billing_period !== 'monthly' || BillingSchedule::where('source_document_id', $quote->id)->exists()) {
                throw ValidationException::withMessages(['source_document_id' => 'Select an accepted monthly quote without an existing billing schedule.']);
            }
            $schedule = BillingSchedule::create(collect($data)->only(['source_document_id', 'next_issue_on', 'payment_due_days', 'end_on'])->all() + ['billing_day' => Carbon::parse($data['next_issue_on'])->day]);
            AuditEvent::record('billing.schedule_created', $schedule);

            return $schedule;
        });
    }

    public function nextDate(Carbon $date, int $day): Carbon
    {
        $next = $date->copy()->startOfMonth()->addMonth();

        return $next->day(min($day, $next->daysInMonth));
    }

    public function changeStatus(BillingSchedule $original, string $status): void
    {
        if (! in_array($status, ['active', 'paused', 'ended'])) {
            throw new \InvalidArgumentException('Invalid status');
        }
        DB::transaction(function () use ($original, $status) {
            $s = BillingSchedule::lockForUpdate()->findOrFail($original->id);
            if ($s->status === 'ended') {
                throw ValidationException::withMessages(['status' => 'Ended schedules cannot be restarted.']);
            }
            if ($status === 'active') {
                while ($s->next_issue_on->toDateString() < now('Africa/Casablanca')->toDateString()) {
                    $s->next_issue_on = $this->nextDate($s->next_issue_on, $s->billing_day);
                }
            }
            $s->status = $status;
            $s->save();
            AuditEvent::record('billing.'.$status, $s);
        });
    }

    private function notify(string $title, string $body): void
    {
        foreach (User::where('role', 'admin')->get() as $admin) {
            $admin->notifyNow(Notification::make()->title($title)->body($body)->actions([Action::make('invoices')->label('View invoices')->url('/manage/invoices')])->toDatabase());
        }
    }

    public function run(): array
    {
        $today = now('Africa/Casablanca')->toDateString();
        $issued = 0;
        $errors = 0;
        $reminders = 0;
        foreach (BillingSchedule::where('status', 'active')->whereDate('next_issue_on', '<=', $today)->pluck('id') as $id) {
            try {
                $issued += DB::transaction(function () use ($id, $today) {
                    $s = BillingSchedule::lockForUpdate()->findOrFail($id);
                    $count = 0;
                    $created = 0;
                    if ($s->status !== 'active') {
                        return 0;
                    }
                    while ($s->next_issue_on->toDateString() <= $today && $count < 12) {
                        if ($s->end_on && $s->next_issue_on->gt($s->end_on)) {
                            $s->status = 'ended';
                            break;
                        }
                        $quote = $s->quote;
                        if ($quote->archived_at || $quote->status !== 'accepted') {
                            throw ValidationException::withMessages(['quote' => 'The monthly quote must remain accepted and active.']);
                        }
                        $start = $s->next_issue_on->copy();
                        $next = $this->nextDate($start, $s->billing_day);
                        $manualTotal = BusinessDocument::where('source_document_id', $quote->id)->where('type', 'invoice')->whereNull('billing_schedule_id')->whereNotNull('issued_at')->where('status', '!=', 'cancelled')->where(function ($q) use ($start) {
                            $q->whereBetween('period_start', [$start->copy()->startOfMonth()->toDateString(), $start->copy()->endOfMonth()->toDateString()])->orWhere(fn ($legacy) => $legacy->whereNull('period_start')->whereBetween('issued_at', [Carbon::parse($start->format('Y-m-01'), 'Africa/Casablanca')->startOfDay()->utc(), Carbon::parse($start->format('Y-m-01'), 'Africa/Casablanca')->endOfMonth()->endOfDay()->utc()]));
                        })->sum('total_amount');
                        if (! $s->invoices()->whereDate('period_start', $start)->exists() && $manualTotal < $quote->total_amount) {

                            if ($manualTotal > 0) {
                                throw ValidationException::withMessages(['invoice' => 'This month has a partial historical invoice. Reconcile the remaining amount before automatic billing.']);
                            }
                            $s->save();
                            $w = app(DocumentWorkflow::class);
                            $invoice = $w->duplicate($quote, 'invoice', 100);
                            $invoice->update(['document_date' => $start->toDateString(), 'billing_schedule_id' => $s->id, 'period_start' => $start, 'period_end' => $next->copy()->subDay(), 'due_on' => $start->copy()->addDays($s->payment_due_days)]);
                            $invoice = $w->issue($invoice);
                            $created++;
                            $this->notify('Monthly invoice issued', 'Invoice N°'.$invoice->number.' · '.$invoice->display_total.' · due '.$invoice->due_on->format('d/m/Y'));
                        }
                        $count++;
                        $s->next_issue_on = $next;
                    }
                    $s->last_error = null;
                    $s->save();

                    return $created;
                }, 5);
            } catch (\Throwable $e) {
                $errors++;
                $s = BillingSchedule::findOrFail($id);
                $message = $e instanceof ValidationException ? implode(' ', Arr::flatten($e->errors())) : 'Automatic billing failed. Review the application log.';
                if ($s->last_error !== $message) {
                    $this->notify('Monthly billing needs attention', 'Schedule #'.$id.': '.$message);
                }
                $s->update(['last_error' => $message]);
                report($e);
            }
        }
        foreach (BusinessDocument::where('type', 'invoice')->whereNotNull('issued_at')->whereNull('archived_at')->where('status', '!=', 'cancelled')->whereDate('due_on', '<=', Carbon::parse($today)->addDays(7))->get() as $invoice) {
            DB::transaction(function () use ($invoice, $today, &$reminders) {
                $invoice = BusinessDocument::lockForUpdate()->findOrFail($invoice->id);
                if ($invoice->balanceAmount() === 0 || $invoice->archived_at || $invoice->status === 'cancelled') {
                    return;
                }
                $days = (int) Carbon::parse($today)->diffInDays($invoice->due_on, false);
                $kind = $days > 0 ? 'upcoming' : ($days === 0 ? 'due' : 'overdue-'.intdiv(abs($days), 7));
                if (DB::table('billing_reminders')->where('business_document_id', $invoice->id)->where('kind', $kind)->exists()) {
                    return;
                }
                DB::table('billing_reminders')->insert(['business_document_id' => $invoice->id, 'kind' => $kind, 'created_at' => now(), 'updated_at' => now()]);
                $this->notify($days > 0 ? 'Payment due soon' : ($days === 0 ? 'Payment due today' : 'Payment overdue'), 'Invoice N°'.$invoice->number.' · outstanding '.Money::decimal($invoice->balanceAmount()).' '.$invoice->currency.' · due '.$invoice->due_on->format('d/m/Y'));
                $reminders++;
            }, 5);
        }

        return compact('issued', 'errors', 'reminders');
    }
}
