<?php

namespace App\Services;

use App\Models\Lead;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class SalesPipeline
{
    public const STAGES = ['new' => 'New inquiry', 'contacted' => 'Contacted', 'quote_sent' => 'Quote sent', 'accepted' => 'Accepted', 'in_progress' => 'In progress', 'completed' => 'Completed', 'lost' => 'Lost'];

    public function move(int $id, string $stage): void
    {
        Gate::authorize('manage-business');
        if (! array_key_exists($stage, self::STAGES)) {
            throw ValidationException::withMessages(['status' => 'Choose a valid sales stage.']);
        }
        DB::transaction(function () use ($id, $stage) {
            $lead = Lead::lockForUpdate()->findOrFail($id);
            $lead->update(['status' => $stage]);
        });
    }

    public function accepted(?int $leadId): void
    {
        if (! $leadId) {
            return;
        }
        $lead = Lead::lockForUpdate()->find($leadId);
        if ($lead && in_array($lead->status, ['new', 'contacted', 'quote_sent'])) {
            $lead->update(['status' => 'accepted']);
        }
    }
}
