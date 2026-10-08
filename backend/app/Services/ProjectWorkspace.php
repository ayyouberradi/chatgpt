<?php

namespace App\Services;

use App\Models\AuditEvent;
use App\Models\BusinessDocument;
use App\Models\ClientPortalAccess;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\User;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ProjectWorkspace
{
    public function create(int $quoteId): Project
    {
        Gate::authorize('manage-business');

        return DB::transaction(function () use ($quoteId) {
            $q = BusinessDocument::lockForUpdate()->findOrFail($quoteId);
            if ($q->type !== 'quote' || $q->status !== 'accepted' || ! $q->issued_at || $q->archived_at) {
                throw ValidationException::withMessages(['quote_id' => 'Choose an active accepted quote.']);
            }
            $p = Project::firstOrCreate(['source_document_id' => $q->id], ['business_client_id' => $q->business_client_id, 'name' => $q->title]);
            if ($p->wasRecentlyCreated) {
                AuditEvent::record('project.created_from_quote', $p, ['quote_id' => $q->id]);
            }

            return $p->fresh();
        }, 5);
    }

    public function submit(int $taskId): void
    {
        Gate::authorize('manage-business');
        DB::transaction(function () use ($taskId) {
            $t = ProjectTask::lockForUpdate()->findOrFail($taskId);
            if ($t->kind !== 'deliverable' || ! $t->client_visible || ! $t->project->client_visible || $t->approval_status !== 'draft') {
                throw ValidationException::withMessages(['task' => 'Only a visible draft deliverable can be submitted for review.']);
            }
            $t->update(['approval_status' => 'awaiting', 'submitted_at' => now(), 'reviewed_at' => null, 'client_feedback' => null]);
            AuditEvent::record('project.deliverable_submitted', $t, ['revision' => $t->revision]);
        }, 5);
    }

    public function review(ClientPortalAccess $access, int $taskId, int $revision, string $decision, ?string $feedback): void
    {
        DB::transaction(function () use ($access, $taskId, $revision, $decision, $feedback) {
            $access = ClientPortalAccess::lockForUpdate()->findOrFail($access->id);
            abort_if($access->revoked_at || $access->expires_at->isPast() || ! $access->client()->where('is_active', true)->exists(), 403);
            $t = ProjectTask::whereHas('project', fn ($q) => $q->where('business_client_id', $access->business_client_id)->where('client_visible', true))->where('client_visible', true)->where('kind', 'deliverable')->lockForUpdate()->findOrFail($taskId);
            if ($t->revision !== $revision || $t->approval_status !== 'awaiting') {
                throw ValidationException::withMessages(['review' => 'This deliverable changed or was already reviewed. Refresh the page before reviewing.']);
            }
            validator(['decision' => $decision, 'feedback' => $feedback], ['decision' => 'required|in:approved,changes_requested', 'feedback' => 'nullable|required_if:decision,changes_requested|string|max:4000'])->validate();
            $t->update(['approval_status' => $decision, 'reviewed_at' => now(), 'client_feedback' => $feedback, 'status' => $decision === 'approved' ? 'done' : 'in_progress']);
            AuditEvent::record('project.client_review', $t, ['revision' => $revision, 'decision' => $decision, 'portal_access_id' => $access->id, 'feedback' => $feedback]);
            foreach (User::where('role', 'admin')->get() as $admin) {
                $admin->notifyNow(Notification::make()->title($decision === 'approved' ? 'Client approved a deliverable' : 'Client requested changes')->body($t->title)->toDatabase());
            }
        }, 5);
    }
}
