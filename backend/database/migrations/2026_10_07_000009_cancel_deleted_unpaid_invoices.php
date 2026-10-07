<?php

use App\Models\AuditEvent;
use App\Models\BusinessDocument;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_documents', fn (Blueprint $table) => $table->dropUnique(['deposit_invoice_id']));
        $ids = DB::table('business_documents as invoices')->where('type', 'invoice')->whereNotNull('archived_at')->where('status', '!=', 'cancelled')
            ->whereNotExists(fn ($q) => $q->selectRaw('1')->from('payments')->whereColumn('payments.business_document_id', 'invoices.id')->whereNull('voided_at')->where('amount', '>', 0))
            ->whereNotExists(fn ($q) => $q->selectRaw('1')->from('business_documents as linked')->where(fn ($q) => $q->whereColumn('linked.source_document_id', 'invoices.id')->orWhereColumn('linked.deposit_invoice_id', 'invoices.id')))
            ->pluck('id');
        foreach ($ids as $id) {
            DB::table('business_documents')->where('id', $id)->update(['status' => 'cancelled']);
            AuditEvent::record('invoice.cancelled_deleted_unpaid', BusinessDocument::findOrFail($id));
        }
    }

    public function down(): void
    {
        // Cancellation history must not be reversed by a schema rollback.
    }
};
