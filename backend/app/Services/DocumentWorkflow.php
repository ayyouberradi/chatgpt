<?php

namespace App\Services;

use App\Models\AuditEvent;
use App\Models\BusinessDocument;
use App\Models\BusinessSetting;
use App\Models\Payment;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class DocumentWorkflow
{
    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['document' => $message]);
    }

    public function issue(BusinessDocument $original): BusinessDocument
    {
        return DB::transaction(function () use ($original) {
            $document = BusinessDocument::lockForUpdate()->findOrFail($original->id);
            if ($document->status !== 'draft' || $document->issued_at) {
                $this->fail('Only drafts can be issued.');
            }
            $settings = BusinessSetting::current();
            if (! $settings->legal_name || ! $settings->address || ! $settings->email || ! $settings->business_type || $settings->tax_mode === 'not_configured') {
                $this->fail('Complete issuer identity and tax settings before issuing documents.');
            }
            if ($settings->tax_mode !== 'vat' && $document->tax_basis_points !== 0) {
                $this->fail('Tax must be zero when the issuer is not configured for VAT.');
            }
            if (! $document->client->address) {
                $this->fail('Add the client billing address before issuing.');
            }
            if ($document->items->isEmpty()) {
                $this->fail('Add at least one line item.');
            }
            foreach ($document->items as $item) {
                if ($item->quantity_milli < 1 || $item->quantity_milli > 10000000 || $item->unit_amount > 99999999999) {
                    $this->fail('A line item quantity or price is invalid.');
                }
                if ($item->billing_period !== $document->billing_period) {
                    $this->fail('Separate one-time and recurring services into different documents.');
                }
            }
            $totals = $document->totals();
            if ($totals['total_amount'] < 1) {
                $this->fail('Document total must be greater than zero.');
            }
            if ($document->type === 'quote' && ! $document->due_on) {
                $this->fail('Set a quote expiry date.');
            }
            if ($document->type === 'invoice' && ! $document->due_on) {
                $this->fail('Set an invoice due date.');
            }
            if ($document->type === 'invoice' && ! $document->source_document_id) {
                $this->fail('Select an accepted quote to create the invoice.');
            }
            if ($document->source_document_id) {
                $source = BusinessDocument::lockForUpdate()->findOrFail($document->source_document_id);
                if ($source->business_client_id !== $document->business_client_id || $source->currency !== $document->currency || $source->billing_period !== $document->billing_period) {
                    $this->fail('The source document must have the same client, currency and billing period.');
                }
                if ($document->type === 'contract' && ($source->type !== 'quote' || $source->status !== 'accepted')) {
                    $this->fail('Contracts must reference an accepted quote.');
                }
                if ($document->type === 'invoice') {
                    if ($source->type !== 'quote' || $source->status !== 'accepted') {
                        $this->fail('Linked invoices must reference an accepted quote.');
                    }
                    $this->validateInvoiceCopy($document, $source);
                    $already = (int) BusinessDocument::where('source_document_id', $source->id)->where('type', 'invoice')->whereNotNull('issued_at')->sum('total_amount');
                    if ($already + $totals['total_amount'] > $source->total_amount) {
                        $this->fail('Issued invoices would exceed the accepted quote. Use an approved revised quote for additional work.');
                    }
                }
                if ($document->type === 'credit_note') {
                    if ($source->type !== 'invoice' || ! $source->issued_at) {
                        $this->fail('Credit notes must reference an issued invoice.');
                    }
                    if ($totals['total_amount'] > $source->balanceAmount()) {
                        $this->fail('Credit note exceeds the unpaid invoice balance. Refunds of paid invoices require a separate accounting process.');
                    }
                }
            } elseif (in_array($document->type, ['contract', 'credit_note'])) {
                $this->fail('Select the source document.');
            }
            if ($document->type === 'contract') {
                if (! $document->template?->is_approved) {
                    $this->fail('Choose an approved contract template.');
                }
                if ($document->template->language !== $document->language) {
                    $this->fail('Contract template language must match the document.');
                }
                if (! trim($document->terms ?? '')) {
                    $this->fail('Complete the contract terms before issuing.');
                }
            }
            $issuedAt = now();
            if (in_array($document->type, ['quote', 'invoice'], true)) {
                $localDate = $issuedAt->copy()->setTimezone('Africa/Casablanca');
                $day = $localDate->format('Y-m-d');
                DB::table('daily_document_sequences')->insertOrIgnore(['type' => $document->type, 'issued_on' => $day, 'next_value' => 1]);
                $sequence = DB::table('daily_document_sequences')->where('type', $document->type)->where('issued_on', $day)->lockForUpdate()->first();
                DB::table('daily_document_sequences')->where('id', $sequence->id)->update(['next_value' => $sequence->next_value + 1]);
                $number = $localDate->format('jmY').'/'.$sequence->next_value;
            } else {
                $year = (int) $issuedAt->format('Y');
                DB::table('document_sequences')->insertOrIgnore(['type' => $document->type, 'year' => $year, 'next_value' => 1]);
                $sequence = DB::table('document_sequences')->where('type', $document->type)->where('year', $year)->lockForUpdate()->first();
                DB::table('document_sequences')->where('id', $sequence->id)->update(['next_value' => $sequence->next_value + 1]);
                $prefix = ['contract' => 'CTR', 'credit_note' => 'AV'][$document->type] ?? throw new \LogicException('Unknown document type');
                $number = $prefix.'-'.$year.'-'.str_pad((string) $sequence->next_value, 4, '0', STR_PAD_LEFT);
            }
            $document->fill($totals + [
                'number' => $number,
                'status' => 'issued', 'issued_at' => $issuedAt,
                'issuer_snapshot' => $settings->only(['legal_name', 'address', 'email', 'phone', 'business_type', 'tax_mode', 'tax_identifier', 'registration_number', 'payment_instructions', 'pdf_footer']),
                'client_snapshot' => $document->client->only(['name', 'company', 'email', 'phone', 'address', 'tax_identifier']),
            ])->save();
            AuditEvent::record('document.issued', $document, ['number' => $document->number, 'type' => $document->type, 'total_amount' => $document->total_amount, 'currency' => $document->currency]);

            return $document;
        }, 5);
    }

    public function decideQuote(BusinessDocument $original, bool $accepted): BusinessDocument
    {
        return DB::transaction(function () use ($original, $accepted) {
            $document = BusinessDocument::lockForUpdate()->findOrFail($original->id);
            if ($document->type !== 'quote') {
                $this->fail('Only quotes can be accepted or rejected.');
            }
            if ($document->status === 'draft') {
                $document = $this->issue($document);
            }

            return $accepted ? $this->accept($document) : $this->decline($document);
        }, 5);
    }

    public function accept(BusinessDocument $original): BusinessDocument
    {
        return DB::transaction(function () use ($original) {
            $document = BusinessDocument::lockForUpdate()->findOrFail($original->id);
            if ($document->type !== 'quote' || $document->status !== 'issued') {
                $this->fail('Only issued quotes can be accepted.');
            }
            if ($document->due_on?->endOfDay()->isPast()) {
                $this->fail('Quote has expired. Create a new draft revision.');
            }
            $document->update(['status' => 'accepted', 'accepted_at' => now()]);
            AuditEvent::record('quote.accepted_manually', $document);

            return $document;
        });
    }

    public function markSigned(BusinessDocument $original): BusinessDocument
    {
        return DB::transaction(function () use ($original) {
            $document = BusinessDocument::lockForUpdate()->findOrFail($original->id);
            if ($document->type !== 'contract' || $document->status !== 'issued') {
                $this->fail('Only issued contracts can be marked signed.');
            }
            $document->update(['status' => 'signed', 'signed_at' => now()]);
            AuditEvent::record('contract.signature_recorded_manually', $document);

            return $document;
        });
    }

    public function decline(BusinessDocument $original): BusinessDocument
    {
        return DB::transaction(function () use ($original) {
            $document = BusinessDocument::lockForUpdate()->findOrFail($original->id);
            if ($document->type !== 'quote' || $document->status !== 'issued') {
                $this->fail('Only issued quotes can be declined.');
            }
            $document->update(['status' => 'declined']);
            AuditEvent::record('quote.declined', $document);

            return $document;
        });
    }

    public function duplicate(BusinessDocument $source, string $type, int $paymentPercent = 100): BusinessDocument
    {
        return DB::transaction(function () use ($source, $type, $paymentPercent) {
            $source = BusinessDocument::lockForUpdate()->findOrFail($source->id);
            if (! in_array($type, ['quote', 'invoice', 'contract', 'credit_note'])) {
                $this->fail('Unknown document type.');
            }
            if (in_array($type, ['invoice', 'contract']) && ($source->type !== 'quote' || $source->status !== 'accepted')) {
                $this->fail('Accept the quote before generating invoices or contracts.');
            }
            if ($type === 'credit_note' && ($source->type !== 'invoice' || ! $source->issued_at)) {
                $this->fail('Select an issued invoice.');
            }
            if ($type === 'invoice' && ! in_array($paymentPercent, [50, 100], true)) {
                $this->fail('Choose full payment (100%) or deposit (50%).');
            }
            $portion = $type === 'invoice' ? $paymentPercent : 100;
            $discount = Money::rounded($source->discount_amount * $portion, 100);
            $targetSubtotal = Money::rounded($source->total_amount * $portion, 100) - Money::rounded($source->tax_amount * $portion, 100) + $discount;
            $draft = BusinessDocument::create([
                'type' => $type, 'business_client_id' => $source->business_client_id, 'source_document_id' => $type === 'quote' ? null : $source->id, 'title' => $source->title,
                'currency' => $source->currency, 'language' => $source->language, 'billing_period' => $source->billing_period, 'due_on' => now()->addDays(30)->toDateString(),
                'payment_percent' => $type === 'invoice' ? $portion : null,
                'discount_amount' => $discount, 'tax_basis_points' => $source->tax_basis_points, 'terms' => $type === 'contract' ? null : $source->terms, 'created_by' => auth()->id(),
            ]);
            $cumulative = 0;
            $allocated = 0;
            $largest = null;
            foreach ($source->items as $item) {
                $attributes = $item->only(['catalogue_service_id', 'description', 'scope', 'billing_period', 'quantity_milli', 'unit_amount', 'position', 'billed_amount']);
                if ($type === 'invoice') {
                    $cumulative += $item->lineAmount();
                    $next = Money::rounded($cumulative * $portion, 100);
                    $attributes['billed_amount'] = $next - $allocated;
                    $allocated = $next;
                }
                $copied = $draft->items()->create($attributes);
                if ($type === 'invoice' && ($largest === null || $copied->billed_amount > $largest->billed_amount)) {
                    $largest = $copied;
                }
            }
            if ($type === 'invoice' && $largest && $allocated !== $targetSubtotal) {
                $largest->update(['billed_amount' => $largest->billed_amount + $targetSubtotal - $allocated]);
            }
            AuditEvent::record('document.draft_created', $draft, ['source_id' => $source->id]);

            return $draft;
        });
    }

    private function checkPaidDeposit(BusinessDocument $deposit, BusinessDocument $quote, ?int $finalId = null): void
    {
        if ($deposit->type !== 'invoice' || ! $deposit->issued_at || $deposit->payment_percent !== 50 || $deposit->source_document_id !== $quote->id || $quote->status !== 'accepted') {
            $this->fail('Select an issued 50% deposit invoice linked to an accepted quote.');
        }
        if ($deposit->paidAmount() < $deposit->total_amount || $deposit->creditAmount() > 0) {
            $this->fail('Record the full deposit payment before creating or issuing its final balance invoice.');
        }
        if (BusinessDocument::where('source_document_id', $quote->id)->where('type', 'invoice')->whereNotNull('issued_at')->where('id', '!=', $deposit->id)->when($finalId, fn ($query) => $query->where('id', '!=', $finalId))->exists()) {
            $this->fail('Another invoice already bills this quote. Review its invoices before creating a final balance.');
        }
    }

    public function finalInvoice(BusinessDocument $original): BusinessDocument
    {
        return DB::transaction(function () use ($original) {
            $quoteId = BusinessDocument::findOrFail($original->id)->source_document_id;
            if (! $quoteId) {
                $this->fail('The deposit must be linked to a quote.');
            }
            $quote = BusinessDocument::lockForUpdate()->findOrFail($quoteId);
            $deposit = BusinessDocument::lockForUpdate()->findOrFail($original->id);
            $this->checkPaidDeposit($deposit, $quote);
            if (BusinessDocument::where('deposit_invoice_id', $deposit->id)->exists()) {
                $this->fail('A final balance invoice already exists for this deposit. Open that invoice instead.');
            }
            $draft = $this->duplicate($quote, 'invoice', 100);
            $draft->update([
                'deposit_invoice_id' => $deposit->id,
                'payment_percent' => null,
                'discount_amount' => $quote->discount_amount - $deposit->discount_amount,
            ]);
            $depositItems = $deposit->items->values();
            foreach ($draft->items->values() as $index => $item) {
                $item->update(['billed_amount' => $quote->items->values()[$index]->lineAmount() - $depositItems[$index]->lineAmount()]);
            }
            AuditEvent::record('invoice.final_balance_created', $draft, ['quote_id' => $quote->id, 'deposit_invoice_id' => $deposit->id]);

            return $draft->fresh();
        }, 5);
    }

    private function validateInvoiceCopy(BusinessDocument $invoice, BusinessDocument $quote): void
    {
        if ($invoice->deposit_invoice_id) {
            $deposit = BusinessDocument::lockForUpdate()->findOrFail($invoice->deposit_invoice_id);
            $this->checkPaidDeposit($deposit, $quote, $invoice->id);
        } elseif (! in_array((int) $invoice->payment_percent, [50, 100], true)) {
            $this->fail('Choose full payment (100%) or deposit (50%).');
        }
        $expectedDiscount = isset($deposit) ? $quote->discount_amount - $deposit->discount_amount : Money::rounded($quote->discount_amount * $invoice->payment_percent, 100);
        if ($invoice->tax_basis_points !== $quote->tax_basis_points || $invoice->discount_amount !== $expectedDiscount) {
            $this->fail('Invoice prices and tax must come from the accepted quote.');
        }
        $fields = ['catalogue_service_id', 'description', 'scope', 'billing_period', 'quantity_milli', 'unit_amount', 'position'];
        if ($invoice->items->map->only($fields)->values()->all() !== $quote->items->map->only($fields)->values()->all()) {
            $this->fail('Invoice services must match the accepted quote. Create a revised quote to change services.');
        }
        $expectedTotal = isset($deposit) ? $quote->total_amount - $deposit->total_amount : Money::rounded($quote->total_amount * $invoice->payment_percent, 100);
        if ($invoice->totals()['total_amount'] !== $expectedTotal) {
            $this->fail('Invoice amount must match the selected quote payment portion.');
        }
    }

    public function recordPayment(BusinessDocument $original, array $data): Payment
    {
        return DB::transaction(function () use ($original, $data) {
            $document = BusinessDocument::lockForUpdate()->findOrFail($original->id);
            if ($document->type !== 'invoice' || ! $document->issued_at) {
                $this->fail('Record payments only against issued invoices.');
            }
            $amount = Money::scaled($data['amount']);
            if ($amount < 1 || $amount > $document->balanceAmount()) {
                $this->fail('Payment must be positive and cannot exceed the outstanding balance.');
            }
            validator($data, ['paid_on' => 'required|date|before_or_equal:today', 'method' => 'required|in:bank_transfer,cash,card,other', 'reference' => 'nullable|string|max:200', 'notes' => 'nullable|string|max:2000'])->validate();
            $payment = $document->payments()->create(['amount' => $amount, 'paid_on' => $data['paid_on'], 'method' => $data['method'], 'reference' => $data['reference'] ?? null, 'notes' => $data['notes'] ?? null, 'recorded_by' => auth()->id()]);
            AuditEvent::record('payment.recorded', $payment, ['document_id' => $document->id, 'amount' => $amount]);

            return $payment;
        }, 5);
    }

    public function voidPayment(Payment $original, string $reason): void
    {
        DB::transaction(function () use ($original, $reason) {
            BusinessDocument::lockForUpdate()->findOrFail($original->business_document_id);
            $payment = Payment::lockForUpdate()->findOrFail($original->id);
            if ($payment->voided_at) {
                $this->fail('This payment was already voided.');
            }
            if (mb_strlen(trim($reason)) < 5) {
                $this->fail('Explain why this payment is being voided.');
            }
            $payment->update(['voided_at' => now(), 'void_reason' => $reason]);
            AuditEvent::record('payment.voided', $payment, ['document_id' => $payment->business_document_id]);
        });
    }
}
