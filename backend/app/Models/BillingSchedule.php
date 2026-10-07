<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingSchedule extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['next_issue_on' => 'date', 'end_on' => 'date', 'billing_day' => 'integer', 'payment_due_days' => 'integer'];
    }

    public function quote()
    {
        return $this->belongsTo(BusinessDocument::class, 'source_document_id');
    }

    public function invoices()
    {
        return $this->hasMany(BusinessDocument::class);
    }
}
