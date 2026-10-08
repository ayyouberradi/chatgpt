<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_portal_accesses', function (Blueprint $t) {
            $t->id();
            $t->foreignId('business_client_id')->constrained()->cascadeOnDelete();
            $t->string('token_hash', 64)->unique();
            $t->timestamp('expires_at');
            $t->timestamp('revoked_at')->nullable();
            $t->timestamps();
        });
        Schema::table('business_documents', fn (Blueprint $t) => $t->foreignId('lead_id')->nullable()->constrained()->nullOnDelete());
        DB::table('leads')->where('status', 'qualified')->update(['status' => 'contacted']);
        DB::table('leads')->where('status', 'won')->update(['status' => 'accepted']);
    }

    public function down(): void
    {
        Schema::table('business_documents', fn (Blueprint $t) => $t->dropConstrainedForeignId('lead_id'));
        Schema::dropIfExists('client_portal_accesses');
    }
};
