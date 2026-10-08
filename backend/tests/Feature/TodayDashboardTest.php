<?php

namespace Tests\Feature;

use App\Filament\Widgets\Today;
use App\Models\BillingSchedule;
use App\Models\BusinessClient;
use App\Models\BusinessDocument;
use App\Models\Lead;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class TodayDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_agenda_shows_active_work_and_only_outstanding_issued_invoices(): void
    {
        $this->travelTo(now('Africa/Casablanca')->setDate(2026, 10, 8)->startOfDay());
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        Filament::setCurrentPanel(Filament::getPanel('manage'));
        $client = BusinessClient::create(['company' => 'Client', 'currency' => 'MAD', 'language' => 'fr']);
        $quote = BusinessDocument::create(['type' => 'quote', 'business_client_id' => $client->id, 'title' => 'Website', 'currency' => 'MAD', 'language' => 'fr']);
        $project = Project::create(['source_document_id' => $quote->id, 'business_client_id' => $client->id, 'name' => 'Website project']);
        ProjectTask::create(['project_id' => $project->id, 'title' => 'Deadline today', 'due_on' => '2026-10-08']);
        ProjectTask::create(['project_id' => $project->id, 'title' => 'Finished task', 'status' => 'done', 'due_on' => '2026-10-07']);
        ProjectTask::create(['project_id' => $project->id, 'title' => 'Review homepage', 'kind' => 'deliverable', 'client_visible' => true, 'approval_status' => 'awaiting']);
        ProjectTask::create(['project_id' => $project->id, 'title' => 'Hidden review', 'kind' => 'deliverable', 'client_visible' => false, 'approval_status' => 'awaiting']);
        Lead::create(['name' => 'Call client', 'email' => 'call@example.test', 'source' => 'manual', 'follow_up_on' => '2026-10-08']);
        Lead::create(['name' => 'Lost client', 'email' => 'lost@example.test', 'source' => 'manual', 'status' => 'lost', 'follow_up_on' => '2026-10-07']);
        foreach (['open', 'archived', 'cancelled', 'draft', 'paid'] as $i => $state) {
            $invoice = BusinessDocument::create(['type' => 'invoice', 'business_client_id' => $client->id, 'title' => $state, 'number' => '8102026/'.($i + 1), 'currency' => 'EUR', 'language' => 'fr', 'due_on' => '2026-10-08', 'issued_at' => $state === 'draft' ? null : now(), 'archived_at' => $state === 'archived' ? now() : null, 'status' => $state === 'cancelled' ? 'cancelled' : 'issued', 'total_amount' => 10000]);
            if ($state === 'paid') {
                $invoice->payments()->create(['amount' => 10000, 'paid_on' => '2026-10-08', 'method' => 'cash']);
            }
        }
        BillingSchedule::create(['source_document_id' => $quote->id, 'next_issue_on' => '2026-10-08', 'billing_day' => 8, 'last_error' => 'Review billing settings']);
        $agenda = app(Today::class)->agenda();
        $this->assertSame([1, 1, 1, 1, 1], array_column($agenda, 'count'));
        $this->assertStringContainsString('100.00 EUR', $agenda[1]['items'][0]['detail']);
        $this->assertStringContainsString('Due 08/10/2026', $agenda[1]['items'][0]['detail']);
        Livewire::test(Today::class)->assertSee('Today')->assertSee('Call client')->assertSee('Review homepage')->assertDontSee('Finished task')->assertDontSee('Hidden review');
        $open = BusinessDocument::where('title', 'open')->sole();
        BusinessDocument::create(['type' => 'credit_note', 'source_document_id' => $open->id, 'business_client_id' => $client->id, 'title' => 'Credit', 'currency' => 'EUR', 'language' => 'fr', 'issued_at' => now(), 'total_amount' => 10000]);
        $this->assertSame(0, app(Today::class)->agenda()[1]['count']);
        BillingSchedule::sole()->update(['status' => 'paused']);
        $this->assertSame(0, app(Today::class)->agenda()[4]['count']);
        $project->update(['status' => 'paused']);
        $this->assertSame(0, app(Today::class)->agenda()[2]['count']);
        $this->assertSame(0, app(Today::class)->agenda()[3]['count']);
        $this->get('/manage')->assertOk();
    }
}
