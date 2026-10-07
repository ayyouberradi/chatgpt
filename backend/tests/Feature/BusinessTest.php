<?php

namespace Tests\Feature;

use App\Filament\Resources\Pages\ManageInvoices;
use App\Filament\Resources\Pages\ManageQuotes;
use App\Models\BusinessClient;
use App\Models\BusinessDocument;
use App\Models\BusinessSetting;
use App\Models\ContractTemplate;
use App\Models\Lead;
use App\Models\User;
use App\Services\DocumentWorkflow;
use App\Support\Money;
use Carbon\Carbon;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class BusinessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
        BusinessSetting::current()->update(['legal_name' => 'Test Studio', 'address' => 'Marrakech', 'email' => 'studio@example.test', 'business_type' => 'Company', 'tax_mode' => 'vat', 'tax_percent' => '20.00']);
    }

    private function draft(string $type = 'quote', array $changes = []): BusinessDocument
    {
        if ($type === 'invoice') {
            $workflow = app(DocumentWorkflow::class);
            $quote = $workflow->accept($workflow->issue($this->draft('quote', $changes)));

            return $workflow->duplicate($quote, 'invoice');
        }
        $client = BusinessClient::firstOrCreate(['email' => 'client@example.test'], ['name' => 'Client', 'address' => 'Casablanca']);
        $document = BusinessDocument::create($changes + ['type' => $type, 'business_client_id' => $client->id, 'title' => 'Website', 'due_on' => now()->addDays(30), 'currency' => 'MAD', 'language' => 'fr', 'billing_period' => 'one_time', 'tax_percent' => '20.00']);
        $document->items()->create(['description' => 'Website', 'quantity' => '1.000', 'unit_price' => '1000.00', 'billing_period' => 'one_time', 'scope' => 'Five pages']);

        return $document;
    }

    private function rejected(callable $operation): void
    {
        try {
            $operation();
            $this->fail('Expected validation rejection.');
        } catch (ValidationException $e) {
            $this->assertNotEmpty($e->errors());
        }
    }

    public function test_quote_invoice_portions_copy_services_and_prevent_overbilling(): void
    {
        $w = app(DocumentWorkflow::class);
        $quote = $w->accept($w->issue($this->draft()));
        $deposit = $w->issue($w->duplicate($quote, 'invoice', 50));
        $this->assertSame(60000, $deposit->total_amount);
        $this->assertSame('Website', $deposit->items->first()->description);
        $this->assertSame(50000, $deposit->items->first()->lineAmount());
        $this->assertSame(0, $deposit->paidAmount());
        $this->rejected(fn () => $w->issue($w->duplicate($quote, 'invoice', 100)));
        $second = $w->issue($w->duplicate($quote, 'invoice', 50));
        $this->assertSame($quote->total_amount, $deposit->total_amount + $second->total_amount);
        $this->rejected(fn () => $w->duplicate($quote, 'invoice', 25));
        $tampered = $w->duplicate($quote, 'invoice', 50);
        $tampered->items()->first()->update(['description' => 'Additional service']);
        $this->rejected(fn () => $w->issue($tampered));
    }

    public function test_invoice_portion_rounding_and_quote_required(): void
    {
        $w = app(DocumentWorkflow::class);
        $quote = $this->draft();
        $quote->items()->first()->update(['quantity' => '1.125', 'unit_price' => '12.34']);
        $quote->update(['discount' => '0.38']);
        $quote = $w->accept($w->issue($quote));
        $invoice = $w->issue($w->duplicate($quote, 'invoice', 50));
        $this->assertSame(810, $invoice->total_amount);
        $this->assertSame(135, $invoice->tax_amount);
        $this->assertSame(694, $invoice->subtotal_amount);
        $this->assertSame(19, $invoice->discount_amount);
        $this->assertSame(810, $invoice->balanceAmount());
        $standalone = $this->draft();
        $standalone->update(['type' => 'invoice']);
        $this->rejected(fn () => $w->issue($standalone));
    }

    public function test_admin_creates_invoice_by_selecting_quote_and_payment_type(): void
    {
        Filament::setCurrentPanel(Filament::getPanel('manage'));
        Filament::bootCurrentPanel();
        $w = app(DocumentWorkflow::class);
        $quote = $w->accept($w->issue($this->draft()));
        Livewire::test(ManageInvoices::class)->callAction('create', ['quote_id' => $quote->id, 'payment_percent' => 50])->assertHasNoActionErrors();
        $invoice = BusinessDocument::where('type', 'invoice')->firstOrFail();
        $this->assertSame($quote->id, $invoice->source_document_id);
        $this->assertSame(50, $invoice->payment_percent);
        $this->assertSame(60000, $invoice->totals()['total_amount']);
        Livewire::test(ManageInvoices::class)->callTableAction('edit', $invoice, ['due_on' => now()->addDays(14)->toDateString(), 'notes' => 'Deposit requested'])->assertHasNoTableActionErrors();
        $this->assertSame('Deposit requested', $invoice->fresh()->notes);
        $this->assertSame(1, $invoice->items()->count());
    }

    public function test_exact_money_quantity_discount_and_tax(): void
    {
        $d = $this->draft();
        $d->items()->first()->update(['quantity' => '1.125', 'unit_price' => '12.34']);
        $d->discount = '0.38';
        $d->save();
        $this->assertSame(['subtotal_amount' => 1388, 'tax_amount' => 270, 'total_amount' => 1620], $d->fresh()->totals());
        $this->assertSame(1234, Money::scaled('12,34'));
        $this->rejected(fn () => Money::scaled('12.345'));
        $d->discount = '100.00';
        $this->rejected(fn () => $d->totals());
    }

    public function test_issued_documents_get_unique_numbers_and_keep_immutable_snapshots(): void
    {
        $w = app(DocumentWorkflow::class);
        $d = $w->issue($this->draft());
        $e = $w->issue($this->draft());
        $this->assertStringEndsWith('/1', $d->number);
        $this->assertStringEndsWith('/2', $e->number);
        $this->assertSame(120000, $d->total_amount);
        $d->client->update(['name' => 'Changed client']);
        BusinessSetting::current()->update(['legal_name' => 'Changed studio']);
        $this->assertSame('Client', $d->client_snapshot['name']);
        $this->assertSame('Test Studio', $d->issuer_snapshot['legal_name']);
        $this->rejected(fn () => $d->update(['title' => 'Changed']));
        $this->rejected(fn () => $d->items()->first()->update(['unit_price' => '1.00']));
        $this->rejected(fn () => $d->delete());
        $this->get(route('business.pdf', $d))->assertOk()->assertHeader('Content-Type', 'application/pdf')->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_quote_and_invoice_daily_numbers_reset_by_type_and_casablanca_date(): void
    {
        $w = app(DocumentWorkflow::class);
        $this->travelTo(Carbon::parse('2025-09-08 12:00:00', 'Africa/Casablanca'));
        $this->assertSame('8092025/1', $w->issue($this->draft('invoice'))->number);
        $this->assertSame('8092025/2', $w->issue($this->draft('invoice'))->number);
        $this->assertSame('8092025/3', $w->issue($this->draft('quote'))->number);
        $this->assertSame('8092025/4', $w->issue($this->draft('quote'))->number);
        // 23:30 UTC is already the next day in Casablanca.
        $this->travelTo(Carbon::parse('2025-09-08 23:30:00', 'UTC'));
        $this->assertSame('9092025/1', $w->issue($this->draft('invoice'))->number);
        $this->travelBack();
    }

    public function test_draft_quote_decisions_issue_number_and_render_heading(): void
    {
        $workflow = app(DocumentWorkflow::class);
        $accepted = $workflow->decideQuote($this->draft(), true);
        $this->assertSame('accepted', $accepted->status);
        $this->assertNotNull($accepted->number);
        $html = view('business.document', ['document' => $accepted->load('client', 'items', 'source'), 'issuer' => $accepted->issuer_snapshot, 'client' => $accepted->client_snapshot, 'totals' => $accepted->totals(), 'pdfTitle' => $accepted->pdfTitle()])->render();
        $this->assertStringContainsString('<h1>Devis N°'.$accepted->number.'</h1>', $html);
        $this->assertStringNotContainsString('BROUILLON', $html);
        $rejected = $workflow->decideQuote($this->draft(), false);
        $this->assertSame('declined', $rejected->status);
        $this->assertNotNull($rejected->number);
    }

    public function test_quote_pdf_hides_contact_subject_and_draft_numbers_but_keeps_validity(): void
    {
        $draft = $this->draft('quote', ['title' => 'Website title', 'due_on' => '2026-10-11']);
        $draft->client->update(['name' => 'Mona', 'company' => 'BE CUTE SPA']);
        $html = view('business.document', ['document' => $draft->fresh()->load('client', 'items', 'source'), 'issuer' => BusinessSetting::current()->toArray(), 'client' => $draft->client->fresh()->toArray(), 'totals' => $draft->totals(), 'pdfTitle' => $draft->pdfTitle()])->render();
        $this->assertStringContainsString('<h1>Devis</h1>', $html);
        $this->assertStringContainsString('BE CUTE SPA', $html);
        $this->assertStringContainsString('Valable jusqu’au 11/10/2026', $html);
        $this->assertStringNotContainsString('Mona', $html);
        $this->assertStringNotContainsString('Website title', $html);
        $this->assertStringNotContainsString('Draft #', $html);
    }

    public function test_quote_acceptance_contract_invoice_and_payment_workflow(): void
    {
        $w = app(DocumentWorkflow::class);
        $q = $w->issue($this->draft());
        $w->accept($q);
        $q->refresh();
        $contract = $w->duplicate($q, 'contract');
        $this->rejected(fn () => $w->issue($contract));
        $t = ContractTemplate::first();
        $t->update(['is_approved' => true]);
        $contract->update(['contract_template_id' => $t->id, 'terms' => $t->body]);
        $contract = $w->issue($contract);
        $w->markSigned($contract);
        $this->assertSame('signed', $contract->fresh()->status);
        $invoice = $w->issue($w->duplicate($q, 'invoice'));
        $payment = $w->recordPayment($invoice, ['amount' => '200.00', 'paid_on' => today()->toDateString(), 'method' => 'bank_transfer']);
        $this->assertSame(100000, $invoice->balanceAmount());
        $this->assertSame('partially_paid', $invoice->display_status);
        $this->rejected(fn () => $w->recordPayment($invoice, ['amount' => '1000.01', 'paid_on' => today()->toDateString(), 'method' => 'cash']));
        $this->rejected(fn () => $payment->update(['amount' => 1]));
        $this->rejected(fn () => $payment->delete());
        $w->voidPayment($payment, 'Incorrect reference');
        $this->assertSame(120000, $invoice->balanceAmount());
        $w->recordPayment($invoice, ['amount' => '1200.00', 'paid_on' => today()->toDateString(), 'method' => 'cash']);
        $this->assertSame('paid', $invoice->display_status);
        $this->rejected(fn () => $w->issue($w->duplicate($q, 'invoice')));
        $this->assertDatabaseHas('audit_events', ['action' => 'payment.voided']);
    }

    public function test_credit_notes_reduce_unpaid_balance_and_prevent_over_crediting(): void
    {
        $w = app(DocumentWorkflow::class);
        $invoice = $w->issue($this->draft('invoice'));
        $credit = $w->duplicate($invoice, 'credit_note');
        $credit->items()->first()->update(['unit_price' => '250.00']);
        $w->issue($credit);
        $this->assertSame(90000, $invoice->balanceAmount());
        $this->rejected(fn () => $w->issue($w->duplicate($invoice, 'credit_note')));
    }

    public function test_configuration_and_mixed_billing_and_source_checks(): void
    {
        $w = app(DocumentWorkflow::class);
        BusinessSetting::current()->update(['tax_mode' => 'not_configured']);
        $this->rejected(fn () => $w->issue($this->draft()));
        BusinessSetting::current()->update(['tax_mode' => 'vat']);
        $d = $this->draft();
        $d->items()->first()->update(['billing_period' => 'monthly']);
        $this->rejected(fn () => $w->issue($d));
        $q = $w->issue($this->draft());
        $w->accept($q);
        $q->refresh();
        $invoice = $w->duplicate($q, 'invoice');
        $invoice->update(['currency' => 'EUR']);
        $this->rejected(fn () => $w->issue($invoice));
    }

    public function test_pdf_title_filename_and_footer_use_frozen_client_and_issue_date(): void
    {
        $this->travelTo(Carbon::parse('2026-10-07 12:00:00', 'Africa/Casablanca'));
        BusinessSetting::current()->update(['pdf_footer' => 'Legal footer at issue time']);
        $draft = $this->draft();
        $draft->client->update(['name' => 'Contact', 'company' => 'Emerald Riad']);
        $this->assertSame('Emerald Riad - Devis - 07-10-2026', $draft->pdfTitle());
        $issued = app(DocumentWorkflow::class)->issue($draft);
        $this->assertSame('Legal footer at issue time', $issued->issuer_snapshot['pdf_footer']);
        $issued->client->update(['company' => 'Changed client name']);
        BusinessSetting::current()->update(['pdf_footer' => 'Changed legal footer']);
        $this->travelTo(Carbon::parse('2026-10-08 12:00:00', 'Africa/Casablanca'));
        $this->assertSame('Emerald Riad - Devis - 07-10-2026.pdf', $issued->fresh()->pdfFilename());
        $response = $this->get('/manage/documents/'.$issued->id.'/pdf')->assertOk();
        $this->assertStringContainsString('Emerald Riad - Devis - 07-10-2026.pdf', $response->headers->get('Content-Disposition'));
        $this->travelBack();
    }

    public function test_pdf_filenames_remove_path_and_header_controls_and_localize_types(): void
    {
        $draft = $this->draft('invoice', ['language' => 'en']);
        $draft->client->update(['company' => "Café / Studio\\Team\r\n"]);
        $name = $draft->pdfFilename();
        $this->assertStringContainsString('Café Studio Team - Invoice - ', $name);
        $this->assertStringNotContainsString('/', $name);
        $this->assertStringNotContainsString('\\', $name);
        $this->assertStringNotContainsString("\n", $name);
        $this->get('/manage/documents/'.$draft->id.'/pdf')->assertOk();
    }

    public function test_draft_and_issued_documents_preview_as_private_pdfs(): void
    {
        $draft = $this->draft();
        $response = $this->get('/manage/documents/'.$draft->id.'/pdf')->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringStartsWith('inline;', $response->headers->get('Content-Disposition'));
        $this->assertStringStartsWith('%PDF-', $response->getContent());
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $issued = app(DocumentWorkflow::class)->issue($draft);
        $response = $this->get('/manage/documents/'.$issued->id.'/pdf')->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringStartsWith('inline;', $response->headers->get('Content-Disposition'));
        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }

    public function test_non_admins_cannot_access_business_or_content_and_guest_pdf_is_private(): void
    {
        $d = $this->draft();
        $user = User::factory()->create(['role' => 'client']);
        $this->actingAs($user);
        $this->get('/manage')->assertForbidden();
        $this->get(route('business.pdf', $d))->assertForbidden();
        $this->patchJson('/api/settings', [])->assertForbidden();
        $this->getJson('/api/media')->assertForbidden();
        auth()->logout();
        $this->getJson(route('business.pdf', $d))->assertUnauthorized();
    }

    public function test_enquiries_are_saved_and_invalid_submissions_rejected(): void
    {
        $data = ['name' => 'Jane', 'email' => 'jane@example.test', 'service' => 'website', 'business' => 'other', 'budget' => '5000-10000', 'timeline' => 'flexible', 'message' => 'Need a website.', 'honeypot' => ''];
        $this->postJson('/api/enquiries', $data)->assertCreated();
        $this->assertDatabaseHas('leads', ['email' => 'jane@example.test', 'status' => 'new']);
        $this->postJson('/api/enquiries', array_replace($data, ['honeypot' => 'bot']))->assertUnprocessable();
        $this->postJson('/api/enquiries', array_replace($data, ['service' => 'invalid']))->assertUnprocessable();
        $lead = Lead::first();
        $lead->convertToClient();
        $this->assertNotNull($lead->fresh()->business_client_id);
    }

    public function test_panel_resource_pages_and_edit_virtual_values_render(): void
    {
        Filament::setCurrentPanel(Filament::getPanel('manage'));
        Filament::bootCurrentPanel();
        $this->draft();
        foreach (['', 'clients', 'services', 'leads', 'templates', 'settings', 'quotes', 'invoices', 'contracts', 'credit-notes', 'payments', 'audits'] as $path) {
            $this->get('/manage'.($path ? '/'.$path : ''))->assertOk();
        }
        Livewire::test(ManageQuotes::class)->assertCanSeeTableRecords(BusinessDocument::all())->mountTableAction('edit', BusinessDocument::first())->assertTableActionDataSet(['tax_percent' => '20.00', 'discount' => '0.00']);
    }

    public function test_quote_can_be_created_with_relationship_items_in_admin(): void
    {
        Filament::setCurrentPanel(Filament::getPanel('manage'));
        Filament::bootCurrentPanel();
        $client = BusinessClient::create(['name' => 'Client', 'email' => 'new@example.test', 'address' => 'Casablanca']);
        Livewire::test(ManageQuotes::class)->callAction('create', data: [
            'business_client_id' => $client->id, 'title' => 'Website quote', 'currency' => 'MAD', 'language' => 'fr', 'billing_period' => 'one_time', 'due_on' => now()->addDays(30)->toDateString(), 'discount' => '0.00', 'tax_percent' => '20.00',
            'items' => [['description' => 'Landing page', 'quantity' => '1.000', 'unit_price' => '1500.00', 'billing_period' => 'one_time', 'scope' => 'One page']],
        ])->assertHasNoActionErrors();
        $d = BusinessDocument::firstOrFail();
        $this->assertSame('quote', $d->type);
        $this->assertSame(150000, $d->items()->firstOrFail()->unit_amount);
    }

    public function test_oversized_totals_and_expired_quotes_are_rejected(): void
    {
        $d = $this->draft();
        $d->items()->first()->update(['quantity' => '10000.000', 'unit_price' => '999999999.99']);
        $this->rejected(fn () => app(DocumentWorkflow::class)->issue($d));
        $q = $this->draft('quote', ['due_on' => today()->subDay()]);
        $q = app(DocumentWorkflow::class)->issue($q);
        $this->rejected(fn () => app(DocumentWorkflow::class)->accept($q));
    }

    public function test_admin_workflow_actions_can_issue_accept_and_create_invoice(): void
    {
        Filament::setCurrentPanel(Filament::getPanel('manage'));
        Filament::bootCurrentPanel();
        $q = $this->draft();
        Livewire::test(ManageQuotes::class)->callTableAction('issue', $q)->assertHasNoTableActionErrors();
        $this->assertNotNull($q->fresh()->issued_at);
        Livewire::test(ManageQuotes::class)->callTableAction('accept', $q)->assertHasNoTableActionErrors();
        $this->assertSame('accepted', $q->fresh()->status);
        Livewire::test(ManageQuotes::class)->callTableAction('invoice', $q, ['payment_percent' => 100])->assertHasNoTableActionErrors();
        $this->assertDatabaseHas('business_documents', ['type' => 'invoice', 'source_document_id' => $q->id, 'status' => 'draft']);
        Livewire::test(ManageQuotes::class)->mountTableAction('view', $q)->assertHasNoTableActionErrors();
    }
}
