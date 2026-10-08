<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class Project extends Model
{
    public const STATUSES = ['planned' => 'Planned', 'in_progress' => 'In progress', 'waiting_client' => 'Waiting for client', 'paused' => 'Paused', 'completed' => 'Completed'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['due_on' => 'date', 'client_visible' => 'boolean'];
    }

    public function quote()
    {
        return $this->belongsTo(BusinessDocument::class, 'source_document_id');
    }

    public function client()
    {
        return $this->belongsTo(BusinessClient::class, 'business_client_id');
    }

    public function tasks()
    {
        return $this->hasMany(ProjectTask::class);
    }

    public function documents()
    {
        return BusinessDocument::where(fn ($q) => $q->where('id', $this->source_document_id)->orWhere('source_document_id', $this->source_document_id))->whereNull('archived_at')->where('status', '!=', 'cancelled')->get();
    }

    protected static function booted(): void
    {
        static::saving(function (self $p) {
            if (! array_key_exists($p->status ?? 'planned', self::STATUSES)) {
                throw ValidationException::withMessages(['status' => 'Choose a valid project status.']);
            }if ($p->exists && $p->isDirty(['source_document_id', 'business_client_id'])) {
                throw ValidationException::withMessages(['project' => 'The quote and client cannot be changed.']);
            }
        });
        static::deleting(fn () => throw ValidationException::withMessages(['project' => 'Pause a project instead of deleting its history.']));
    }
}
