<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catalogue_services', function (Blueprint $t) {
            $t->string('contract_category')->nullable();
        });
        Schema::table('business_documents', function (Blueprint $t) {
            $t->boolean('contract_generated')->default(false);
            $t->boolean('contract_terms_reviewed')->default(false);
            $t->date('contract_start_on')->nullable();
            $t->date('contract_end_on')->nullable();
            $t->string('contract_payment_plan')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('business_documents', fn (Blueprint $t) => $t->dropColumn(['contract_generated', 'contract_terms_reviewed', 'contract_start_on', 'contract_end_on', 'contract_payment_plan']));
        Schema::table('catalogue_services', fn (Blueprint $t) => $t->dropColumn('contract_category'));
    }
};
