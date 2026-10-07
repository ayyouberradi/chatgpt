<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('business_documents', fn (Blueprint $table) => $table->unsignedSmallInteger('payment_percent')->nullable());
        Schema::table('document_items', fn (Blueprint $table) => $table->unsignedBigInteger('billed_amount')->nullable());
    }

    public function down(): void
    {
        Schema::table('document_items', fn (Blueprint $table) => $table->dropColumn('billed_amount'));
        Schema::table('business_documents', fn (Blueprint $table) => $table->dropColumn('payment_percent'));
    }
};
