<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_document_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->date('issued_on');
            $table->unsignedBigInteger('next_value')->default(1);
            $table->unique(['type', 'issued_on']);
        });
        Schema::table('business_documents', function (Blueprint $table) {
            $table->dropUnique('business_documents_number_unique');
            $table->unique(['type', 'number']);
        });
    }

    public function down(): void
    {
        if (DB::table('business_documents')->whereNotNull('number')->groupBy('number')->havingRaw('COUNT(*) > 1')->exists()) {
            throw new RuntimeException('Cannot restore global numbering uniqueness while quotes and invoices share daily numbers.');
        }
        Schema::table('business_documents', function (Blueprint $table) {
            $table->dropUnique('business_documents_type_number_unique');
            $table->unique('number');
        });
        Schema::dropIfExists('daily_document_sequences');
    }
};
