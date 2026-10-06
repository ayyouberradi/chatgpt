<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditEvent extends Model
{
    public $timestamps = false;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'created_at' => 'datetime'];
    }

    public static function record(string $action, Model $subject, array $metadata = []): void
    {
        static::create(['user_id' => auth()->id(), 'action' => $action, 'subject_type' => $subject->getMorphClass(), 'subject_id' => $subject->getKey(), 'metadata' => $metadata]);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
