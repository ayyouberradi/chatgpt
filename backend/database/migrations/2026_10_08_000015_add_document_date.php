<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_documents', fn (Blueprint $t) => $t->date('document_date')->nullable());
    }

    public function down(): void
    {
        Schema::table('business_documents', fn (Blueprint $t) => $t->dropColumn('document_date'));
    }
};
