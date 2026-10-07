<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_documents', function (Blueprint $table) {
            $table->foreignId('deposit_invoice_id')->nullable()->unique()->constrained('business_documents')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('business_documents', function (Blueprint $table) {
            $table->dropForeign(['deposit_invoice_id']);
            $table->dropUnique(['deposit_invoice_id']);
            $table->dropColumn('deposit_invoice_id');
        });
    }
};
