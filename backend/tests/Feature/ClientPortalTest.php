<?php

namespace Tests\Feature;

use App\Filament\Pages\SalesPipeline as PipelinePage;
use App\Filament\Resources\Pages\ManageClients;
use App\Models\BusinessClient;
use App\Models\BusinessDocument;
use App\Models\BusinessSetting;
use App\Models\ClientPortalAccess;
use App\Models\Lead;
use App\Models\User;
use App\Services\ClientPortal;
use App\Services\DocumentWorkflow;
use App\Services\SalesPipeline;
use Filament\Facades\Filament;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class ClientPortalTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
        $this->admin->forceFill(['role' => 'admin'])->save();
        $this->actingAs($this->admin);
        BusinessSetting::current()->update(['legal_name' => 'Studio', 'address' => 'Casablanca', 'email' => 'studio@example.test', 'business_type' => 'Company', 'tax_mode' => 'no_vat']);
    }

    private function client(string $company = 'Portal Company'): BusinessClient
    {
        return BusinessClient::create(['company' => $company, 'language' => 'en']);
    }

    private function quote(BusinessClient $client, ?Lead $lead = null): BusinessDocument
    {
        $q = BusinessDocument::create(['type' => 'quote', 'business_client_id' => $client->id, 'lead_id' => $lead?->id, 'title' => 'Public project scope', 'currency' => 'MAD', 'language' => 'en', 'billing_period' => 'one_time', 'due_on' => now()->addDays(30), 'notes' => 'PRIVATE ADMIN SECRET']);
        $q->items()->create(['description' => 'Website', 'scope' => 'Five pages', 'quantity' => '1', 'unit_price' => '1000', 'billing_period' => 'one_time']);

        return app(DocumentWorkflow::class)->issue($q);
    }

    private function guest(): void
    {
        auth()->forgetGuards();
        $this->app['auth']->guard()->logout();
    }

    public function test_private_portal_scopes_documents_and_does_not_expose_admin_notes_or_grant_admin_access(): void
    {
        $a = $this->client();
        $b = $this->client('Other Private Company');
        $qa = $this->quote($a);
        $qb = $this->quote($b);
        $draft = app(DocumentWorkflow::class)->duplicate($qa, 'quote');
        $url = app(ClientPortal::class)->generate($a);
        $token = basename($url);
        $this->assertNotSame($token, ClientPortalAccess::first()->token_hash);
        $this->assertSame(hash('sha256', $token), ClientPortalAccess::first()->token_hash);
        $this->guest();
        $this->get('/client')->assertForbidden();
        $this->get($url)->assertRedirect('/client')->assertHeader('Referrer-Policy', 'no-referrer');
        $this->get('/client')->assertOk()->assertSee('Portal Company')->assertDontSee('Other Private Company')->assertDontSee('PRIVATE ADMIN SECRET')->assertHeader('Cache-Control', 'no-store, private');
        $this->get('/client/documents/'.$qa->id.'/pdf')->assertOk()->assertHeader('Content-Type', 'application/pdf');
        $this->get('/client/documents/'.$qb->id.'/pdf')->assertNotFound();
        $this->get('/client/documents/'.$draft->id.'/pdf')->assertNotFound();
        $this->get('/manage')->assertRedirect('/manage/login');
    }

    public function test_quote_acceptance_is_explicit_audited_notifies_admin_and_advances_linked_inquiry(): void
    {
        $client = $this->client();
        $lead = Lead::create(['name' => 'Client contact', 'email' => 'contact@example.test', 'business_client_id' => $client->id, 'status' => 'quote_sent']);
        $quote = $this->quote($client, $lead);
        $url = app(ClientPortal::class)->generate($client);
        $this->guest();
        $this->get($url);
        $this->post('/client/quotes/'.$quote->id.'/accept', [])->assertSessionHasErrors('agreement');
        $this->assertSame('issued', $quote->fresh()->status);
        config(['queue.default' => 'database']);
        $this->post('/client/quotes/'.$quote->id.'/accept', ['agreement' => 1, 'total_amount' => 1])->assertRedirect('/client');
        $this->assertSame('accepted', $quote->fresh()->status);
        $this->assertSame(100000, $quote->fresh()->total_amount);
        $this->assertSame('accepted', $lead->fresh()->status);
        $this->assertDatabaseHas('audit_events', ['action' => 'quote.accepted_client_portal', 'subject_id' => $quote->id]);
        $this->assertSame(1, $this->admin->notifications()->count());
        $this->assertSame(0, DB::table('jobs')->count());
        $this->post('/client/quotes/'.$quote->id.'/accept', ['agreement' => 1])->assertSessionHasErrors('document');
        $this->assertSame(1, $this->admin->notifications()->count());
    }

    public function test_revoked_expired_and_inactive_links_cannot_access_or_accept_documents(): void
    {
        $c = $this->client();
        $q = $this->quote($c);
        $url = app(ClientPortal::class)->generate($c);
        $this->guest();
        $this->get($url);
        $this->actingAs($this->admin);
        app(ClientPortal::class)->revoke($c);
        $this->guest();
        $this->get('/client')->assertForbidden();
        $this->post('/client/quotes/'.$q->id.'/accept', ['agreement' => 1])->assertForbidden();
        $this->get($url)->assertNotFound();
        $this->actingAs($this->admin);
        $url = app(ClientPortal::class)->generate($c);
        ClientPortalAccess::latest('id')->first()->update(['expires_at' => now()->subDay()]);
        $this->guest();
        $this->get($url)->assertNotFound();
        $this->actingAs($this->admin);
        $url = app(ClientPortal::class)->generate($c);
        $c->update(['is_active' => false]);
        $this->guest();
        $this->get($url)->assertNotFound();
    }

    public function test_wrong_client_archived_and_expired_quotes_cannot_be_accepted(): void
    {
        $a = $this->client();
        $b = $this->client('Other');
        $qa = $this->quote($a);
        $qb = $this->quote($b);
        $url = app(ClientPortal::class)->generate($a);
        $this->guest();
        $this->get($url);
        $this->post('/client/quotes/'.$qb->id.'/accept', ['agreement' => 1])->assertNotFound();
        app(DocumentWorkflow::class)->archive($qa);
        $this->post('/client/quotes/'.$qa->id.'/accept', ['agreement' => 1])->assertNotFound();
        $qa2 = $this->quote($a);
        $this->travel(31)->days();
        $this->post('/client/quotes/'.$qa2->id.'/accept', ['agreement' => 1])->assertSessionHasErrors('document');
    }

    public function test_admin_can_move_pipeline_and_generate_client_link_without_email(): void
    {
        $c = $this->client();
        $l = Lead::create(['name' => 'Lead', 'email' => 'lead@example.test', 'business_client_id' => $c->id, 'status' => 'new', 'notes' => 'Internal note']);
        Filament::setCurrentPanel(Filament::getPanel('manage'));
        Livewire::test(PipelinePage::class)->assertSee('Sales pipeline')->call('move', $l->id, 'contacted')->assertSee('Lead');
        $this->assertSame('contacted', $l->fresh()->status);
        $this->assertDatabaseHas('audit_events', ['action' => 'lead.stage_changed', 'subject_id' => $l->id]);
        Livewire::test(ManageClients::class)->callTableAction('portal', $c)->assertHasNoTableActionErrors();
        $this->assertSame(1, ClientPortalAccess::count());
        $nonAdmin = User::factory()->create();
        $nonAdmin->forceFill(['role' => 'client'])->save();
        $this->actingAs($nonAdmin);
        $this->get('/manage/sales-pipeline')->assertForbidden();
        $this->expectException(AuthorizationException::class);
        app(SalesPipeline::class)->move($l->id, 'completed');
    }

    public function test_portal_displays_paid_deposit_final_balance_and_hides_deleted_invoices(): void
    {
        $client = $this->client();
        $workflow = app(DocumentWorkflow::class);
        $quote = $workflow->accept($this->quote($client));
        $deposit = $workflow->issue($workflow->duplicate($quote, 'invoice', 50));
        $workflow->recordPayment($deposit, ['amount' => '500.00', 'paid_on' => today()->toDateString(), 'method' => 'bank_transfer']);
        $final = $workflow->issue($workflow->finalInvoice($deposit));
        $url = app(ClientPortal::class)->generate($client);
        $this->guest();
        $this->get($url);
        $this->get('/client')->assertOk()->assertSee('Outstanding balance')->assertSee('500.00')->assertSee('Paid')->assertSee('N°'.$final->number)->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $workflow->archive($final);
        $this->get('/client')->assertOk()->assertDontSee('N°'.$final->number)->assertSee('0.00');
        $this->get('/client/documents/'.$final->id.'/pdf')->assertNotFound();
    }

    public function test_generating_new_link_revokes_prior_sessions_and_does_not_grant_access_without_token(): void
    {
        $client = $this->client();
        $url = app(ClientPortal::class)->generate($client);
        $this->guest();
        $this->get($url);
        $this->actingAs($this->admin);
        $newUrl = app(ClientPortal::class)->generate($client);
        $this->guest();
        $this->get('/client')->assertForbidden();
        $this->get($url)->assertNotFound();
        $this->get($newUrl)->assertRedirect('/client');
        $this->get('/client')->assertOk();
        $this->post('/client/logout')->assertRedirect('/');
        $this->get('/client')->assertForbidden();
    }

    public function test_lead_link_copies_to_invoices_and_rejects_different_clients(): void
    {
        $a = $this->client();
        $b = $this->client('Other');
        $l = Lead::create(['name' => 'Lead', 'email' => 'lead@example.test', 'business_client_id' => $a->id, 'status' => 'new']);
        $w = app(DocumentWorkflow::class);
        $q = $w->accept($this->quote($a, $l));
        $i = $w->issue($w->duplicate($q, 'invoice'));
        $this->assertSame($l->id, $i->lead_id);
        $this->assertSame('accepted', $l->fresh()->status);
        app(SalesPipeline::class)->move($l->id, 'in_progress');
        $w->accept($this->quote($a, $l));
        $this->assertSame('in_progress', $l->fresh()->status);
        $this->expectException(ValidationException::class);
        $this->quote($b, $l);
    }
}
