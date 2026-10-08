<?php

namespace Tests\Feature;

use App\Filament\Resources\Pages\ManageProjects;
use App\Filament\Resources\Pages\ManageProjectTasks;
use App\Filament\Resources\Pages\ManageQuotes;
use App\Filament\Resources\ProjectResource;
use App\Models\BusinessClient;
use App\Models\BusinessDocument;
use App\Models\BusinessSetting;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\User;
use App\Services\ClientPortal;
use App\Services\DocumentWorkflow;
use App\Services\ProjectWorkspace;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class ProjectWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    private function quote(): BusinessDocument
    {
        BusinessSetting::current()->update(['legal_name' => 'Studio', 'address' => 'Marrakech', 'email' => 'studio@example.test', 'business_type' => 'Company', 'tax_mode' => 'vat', 'tax_percent' => '20.00']);
        $c = BusinessClient::create(['company' => 'Test client', 'currency' => 'MAD', 'language' => 'en']);
        $q = BusinessDocument::create(['type' => 'quote', 'business_client_id' => $c->id, 'title' => 'Client website', 'currency' => 'MAD', 'language' => 'en', 'billing_period' => 'one_time', 'due_on' => now()->addDays(30), 'tax_percent' => '20.00']);
        $q->items()->create(['description' => 'Website', 'scope' => 'Five pages', 'quantity' => '1.000', 'unit_price' => '3000.00', 'billing_period' => 'one_time']);
        $w = app(DocumentWorkflow::class);

        return $w->accept($w->issue($q));
    }

    private function admin(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        Filament::setCurrentPanel(Filament::getPanel('manage'));
    }

    private function task(Project $p, array $data = []): ProjectTask
    {
        return ProjectTask::create($data + ['project_id' => $p->id, 'title' => 'Homepage preview', 'kind' => 'deliverable', 'client_visible' => true, 'review_url' => 'https://example.test/preview']);
    }

    private function enter(Project $p): void
    {
        $link = app(ClientPortal::class)->generate($p->client);
        $this->get($link)->assertRedirect('/client');
    }

    public function test_project_creation_is_optional_and_idempotent_and_workspace_shows_documents(): void
    {
        $this->admin();
        $q = $this->quote();
        $w = app(DocumentWorkflow::class);
        $invoice = $w->issue($w->duplicate($q, 'invoice', 50));
        $this->assertSame(0, Project::count());
        Livewire::test(ManageProjects::class)->callAction('create', ['quote_id' => $q->id])->assertHasNoActionErrors();
        $p = Project::sole();
        $this->assertSame($p->id, app(ProjectWorkspace::class)->create($q->id)->id);
        $this->assertSame(1, Project::count());
        $this->assertSame(2, $p->documents()->count());
        $page = Livewire::test(ManageProjects::class)->mountTableAction('workspace', $p)->assertSet('mountedActions.0.name', 'workspace');
        $html = $page->instance()->getMountedAction()->getModalContent()->render();
        $this->assertStringContainsString('Linked documents and payments', $html);
        $this->assertStringContainsString($invoice->number, $html);
        Livewire::test(ManageQuotes::class)->callTableAction('project', $q)->assertRedirect(ProjectResource::getUrl());
        $this->assertSame(1, Project::count());
    }

    public function test_client_sees_only_visible_work_and_can_approve_current_version(): void
    {
        $this->admin();
        $p = app(ProjectWorkspace::class)->create($this->quote()->id);
        $p->update(['notes' => 'PRIVATE PROJECT NOTES']);
        $t = $this->task($p, ['description' => 'Please review homepage', 'internal_notes' => 'PRIVATE COST NOTES']);
        $this->task($p, ['title' => 'INTERNAL TASK', 'client_visible' => false]);
        app(ProjectWorkspace::class)->submit($t->id);
        $this->enter($p);
        $this->get('/client')->assertOk()->assertSee('Please review homepage')->assertDontSee('PRIVATE PROJECT NOTES')->assertDontSee('PRIVATE COST NOTES')->assertDontSee('INTERNAL TASK');
        $this->post('/client/deliverables/'.$t->id.'/review', ['revision' => 1, 'decision' => 'approved'])->assertRedirect('/client');
        $this->assertSame('approved', $t->fresh()->approval_status);
        $this->assertSame('done', $t->fresh()->status);
        $this->post('/client/deliverables/'.$t->id.'/review', ['revision' => 1, 'decision' => 'approved'])->assertSessionHasErrors('review');
    }

    public function test_revisions_invalidate_approval_and_stale_review_is_rejected(): void
    {
        $this->admin();
        $p = app(ProjectWorkspace::class)->create($this->quote()->id);
        $t = $this->task($p);
        $w = app(ProjectWorkspace::class);
        $w->submit($t->id);
        $this->enter($p);
        $this->post('/client/deliverables/'.$t->id.'/review', ['revision' => 1, 'decision' => 'changes_requested', 'feedback' => 'Change the heading'])->assertRedirect('/client');
        $t->refresh()->update(['description' => 'Revised heading']);
        $this->assertSame(2, $t->fresh()->revision);
        $this->assertSame('draft', $t->fresh()->approval_status);
        $w->submit($t->id);
        $this->post('/client/deliverables/'.$t->id.'/review', ['revision' => 1, 'decision' => 'approved'])->assertSessionHasErrors('review');
        $this->post('/client/deliverables/'.$t->id.'/review', ['revision' => 2, 'decision' => 'approved'])->assertRedirect('/client');
    }

    public function test_portal_cannot_review_another_clients_or_hidden_deliverables(): void
    {
        $this->admin();
        $p = app(ProjectWorkspace::class)->create($this->quote()->id);
        $other = app(ProjectWorkspace::class)->create($this->quote()->id);
        $t = $this->task($other);
        app(ProjectWorkspace::class)->submit($t->id);
        $this->enter($p);
        $this->post('/client/deliverables/'.$t->id.'/review', ['revision' => 1, 'decision' => 'approved'])->assertNotFound();
        $hidden = $this->task($p, ['client_visible' => false]);
        $this->post('/client/deliverables/'.$hidden->id.'/review', ['revision' => 1, 'decision' => 'approved'])->assertNotFound();
        $p->update(['client_visible' => false]);
        $t = $this->task($p);
        $this->get('/client')->assertDontSee('Homepage preview');
        $this->post('/client/deliverables/'.$t->id.'/review', ['revision' => 1, 'decision' => 'approved'])->assertNotFound();
    }

    public function test_admin_task_form_and_review_validation(): void
    {
        $this->admin();
        $p = app(ProjectWorkspace::class)->create($this->quote()->id);
        Livewire::test(ManageProjectTasks::class)->callAction('create', ['project_id' => $p->id, 'title' => 'Homepage', 'kind' => 'deliverable', 'status' => 'in_progress', 'client_visible' => true, 'description' => 'Review this', 'review_url' => 'https://example.test/test'])->assertHasNoActionErrors();
        $t = ProjectTask::sole();
        Livewire::test(ManageProjectTasks::class)->callTableAction('submit', $t)->assertHasNoTableActionErrors();
        $this->assertSame('awaiting', $t->fresh()->approval_status);
        $this->enter($p);
        $this->post('/client/deliverables/'.$t->id.'/review', ['revision' => 1, 'decision' => 'changes_requested'])->assertSessionHasErrors('feedback');
        $this->actingAs(User::factory()->create(['role' => 'user']));
        $this->get('/manage/projects')->assertForbidden();
        $this->get('/manage/project-tasks')->assertForbidden();
    }
}
