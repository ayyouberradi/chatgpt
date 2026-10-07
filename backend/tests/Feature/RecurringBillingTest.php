<?php

namespace Tests\Feature;

use App\Filament\Resources\Pages\ManageBillingSchedules;
use App\Models\BillingSchedule;
use App\Models\BusinessClient;
use App\Models\BusinessDocument;
use App\Models\BusinessSetting;
use App\Models\User;
use App\Services\DocumentWorkflow;
use App\Services\RecurringBilling;
use Carbon\Carbon;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class RecurringBillingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-01-31 10:00:00', 'Africa/Casablanca'));
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $this->actingAs($admin);
        BusinessSetting::current()->update(['legal_name' => 'Studio', 'address' => 'Marrakech', 'email' => 'studio@example.test', 'business_type' => 'Company', 'tax_mode' => 'vat']);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function quote(): BusinessDocument
    {
        $client = BusinessClient::create(['company' => 'Monthly Client']);
        $q = BusinessDocument::create(['type' => 'quote', 'business_client_id' => $client->id, 'title' => 'Maintenance', 'due_on' => now()->addDays(30), 'currency' => 'MAD', 'language' => 'fr', 'billing_period' => 'monthly', 'tax_percent' => '20.00']);
        $q->items()->create(['description' => 'Maintenance', 'scope' => 'Monthly updates', 'quantity' => '1.000', 'unit_price' => '1000.00', 'billing_period' => 'monthly']);
        $w = app(DocumentWorkflow::class);

        return $w->accept($w->issue($q));
    }

    private function schedule(): BillingSchedule
    {
        return app(RecurringBilling::class)->create(['source_document_id' => $this->quote()->id, 'next_issue_on' => '2026-01-31', 'payment_due_days' => 7]);
    }

    public function test_auto_issue_exact_amounts_idempotency_and_short_months(): void
    {
        $s = $this->schedule();
        $r = app(RecurringBilling::class);
        $this->assertSame(1, $r->run()['issued']);
        $this->assertSame(0, $r->run()['issued']);
        $i = $s->invoices()->first();
        $this->assertNotNull($i->issued_at);
        $this->assertSame(120000, $i->total_amount);
        $this->assertSame('Maintenance', $i->items->first()->description);
        $this->assertSame('2026-02-07', $i->due_on->toDateString());
        $this->assertSame('2026-02-28', $s->fresh()->next_issue_on->toDateString());
        Carbon::setTestNow('2026-02-28 10:00:00');
        $this->assertSame(1, $r->run()['issued']);
        $this->assertSame('2026-03-31', $s->fresh()->next_issue_on->toDateString());
        $this->assertSame(2, $s->invoices()->count());
    }

    public function test_pause_resume_skips_paused_months_and_end_date_stops_billing(): void
    {
        $s = $this->schedule();
        $r = app(RecurringBilling::class);
        $r->changeStatus($s, 'paused');
        Carbon::setTestNow('2026-03-10 10:00:00');
        $this->assertSame(0, $r->run()['issued']);
        $r->changeStatus($s, 'active');
        $this->assertSame('2026-03-31', $s->fresh()->next_issue_on->toDateString());
        $s->refresh()->update(['end_on' => '2026-03-31']);
        Carbon::setTestNow('2026-05-01 10:00:00');
        $this->assertSame(1, $r->run()['issued']);
        $this->assertSame('ended', $s->fresh()->status);
    }

    public function test_failure_rolls_back_invoice_and_notifies_admin_once(): void
    {
        $s = $this->schedule();
        BusinessSetting::current()->update(['tax_mode' => 'not_configured']);
        $r = app(RecurringBilling::class);
        $this->assertSame(1, $r->run()['errors']);
        $this->assertSame(0, $s->invoices()->count());
        $this->assertNotNull($s->fresh()->last_error);
        $count = auth()->user()->notifications()->count();
        $r->run();
        $this->assertSame($count, auth()->user()->notifications()->count());
    }

    public function test_payment_reminders_deduplicate_and_stop_after_payment(): void
    {
        $s = $this->schedule();
        $r = app(RecurringBilling::class);
        $r->run();
        $this->assertSame(0, $r->run()['reminders']);
        Carbon::setTestNow('2026-02-07 10:00:00');
        $this->assertSame(1, $r->run()['reminders']);
        $this->assertSame(0, $r->run()['reminders']);
        Carbon::setTestNow('2026-02-08 10:00:00');
        $this->assertSame(1, $r->run()['reminders']);
        $i = $s->invoices()->first();
        app(DocumentWorkflow::class)->recordPayment($i, ['amount' => '1200.00', 'paid_on' => '2026-02-08', 'method' => 'bank_transfer']);
        Carbon::setTestNow('2026-02-16 10:00:00');
        $this->assertSame(0, $r->run()['reminders']);
    }

    public function test_notifications_work_without_a_queue_worker_and_exclude_deleted_invoices(): void
    {
        config(['queue.default' => 'database']);
        $s = $this->schedule();
        $r = app(RecurringBilling::class);
        $r->run();
        $this->assertGreaterThan(0, auth()->user()->notifications()->count());
        $this->assertSame(0, DB::table('jobs')->count());
        app(DocumentWorkflow::class)->archive($s->invoices()->first());
        Carbon::setTestNow('2026-02-07 10:00:00');
        $this->assertSame(0, $r->run()['reminders']);
    }

    public function test_admin_creation_form_and_manual_monthly_invoice_guard(): void
    {
        $quote = $this->quote();
        Filament::setCurrentPanel(Filament::getPanel('manage'));
        Livewire::test(ManageBillingSchedules::class)->callAction('create', data: ['source_document_id' => $quote->id, 'next_issue_on' => '2026-01-31', 'payment_due_days' => 7])->assertHasNoActionErrors();
        $this->assertSame(1, BillingSchedule::count());
        $this->expectException(ValidationException::class);
        app(DocumentWorkflow::class)->issue(app(DocumentWorkflow::class)->duplicate($quote,'invoice'));
    }
}
