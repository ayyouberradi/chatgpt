<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class ProjectTask extends Model
{
    public const STATUSES = ['todo' => 'To do', 'in_progress' => 'In progress', 'done' => 'Done'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['due_on' => 'date', 'client_visible' => 'boolean', 'revision' => 'integer', 'submitted_at' => 'datetime', 'reviewed_at' => 'datetime'];
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    protected static function booted(): void
    {
        static::saving(function (self $t) {
            if (! in_array($t->kind ?? 'task', ['task', 'deliverable']) || ! array_key_exists($t->status ?? 'todo', self::STATUSES)) {
                throw ValidationException::withMessages(['task' => 'Choose a valid task type and status.']);
            }
            if ($t->review_url && (! filter_var($t->review_url, FILTER_VALIDATE_URL) || ! in_array(parse_url($t->review_url, PHP_URL_SCHEME), ['https', 'http']))) {
                throw ValidationException::withMessages(['review_url' => 'Use a valid HTTP or HTTPS review link.']);
            }
            if ($t->exists && $t->isDirty('project_id')) {
                throw ValidationException::withMessages(['project_id' => 'Tasks cannot be moved between projects.']);
            }
            if ($t->exists && $t->isDirty(['title', 'description', 'review_url', 'kind', 'client_visible'])) {
                $t->revision = $t->getOriginal('revision') + 1;
                $t->approval_status = 'draft';
                $t->submitted_at = null;
                $t->reviewed_at = null;
                $t->client_feedback = null;
            }
        });
        static::updated(function (self $task) {
            if ($task->wasChanged('revision')) {
                AuditEvent::record('project.deliverable_revised', $task, ['previous_revision' => $task->getOriginal('revision'), 'previous_feedback' => $task->getOriginal('client_feedback')]);
            }
        });
    }
}
