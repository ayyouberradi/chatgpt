<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->string('role')->default('admin'));
        Schema::create('business_settings', function (Blueprint $t) {
            $t->id();
            $t->string('legal_name')->nullable();
            $t->text('address')->nullable();
            $t->string('email')->nullable();
            $t->string('phone')->nullable();
            $t->string('business_type')->nullable();
            $t->string('tax_mode')->default('not_configured');
            $t->unsignedInteger('tax_basis_points')->default(0);
            $t->string('tax_identifier')->nullable();
            $t->string('registration_number')->nullable();
            $t->string('currency', 3)->default('MAD');
            $t->string('language', 2)->default('fr');
            $t->text('payment_instructions')->nullable();
            $t->text('default_terms')->nullable();
            $t->timestamps();
        });
        Schema::create('business_clients', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('company')->nullable();
            $t->string('email')->unique();
            $t->string('phone')->nullable();
            $t->text('address')->nullable();
            $t->string('tax_identifier')->nullable();
            $t->string('currency', 3)->default('MAD');
            $t->string('language', 2)->default('fr');
            $t->text('notes')->nullable();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });
        Schema::create('leads', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email');
            $t->string('phone')->nullable();
            $t->string('service')->nullable();
            $t->string('business')->nullable();
            $t->string('budget')->nullable();
            $t->string('timeline')->nullable();
            $t->text('message')->nullable();
            $t->string('source')->default('website');
            $t->string('status')->default('new')->index();
            $t->text('notes')->nullable();
            $t->date('follow_up_on')->nullable();
            $t->foreignId('business_client_id')->nullable()->constrained()->nullOnDelete();
            $t->timestamps();
        });
        Schema::create('catalogue_services', function (Blueprint $t) {
            $t->id();
            $t->string('source_key')->nullable()->unique();
            $t->string('name');
            $t->text('description')->nullable();
            $t->text('scope')->nullable();
            $t->text('exclusions')->nullable();
            $t->unsignedInteger('revision_limit')->default(2);
            $t->unsignedBigInteger('unit_amount')->default(0);
            $t->string('currency', 3)->default('MAD');
            $t->string('billing_period')->default('one_time');
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });
        Schema::create('contract_templates', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('language', 2)->default('fr');
            $t->text('body');
            $t->boolean('is_approved')->default(false);
            $t->timestamps();
        });
        Schema::create('business_documents', function (Blueprint $t) {
            $t->id();
            $t->string('type')->index();
            $t->string('number')->nullable()->unique();
            $t->foreignId('business_client_id')->constrained()->restrictOnDelete();
            $t->foreignId('source_document_id')->nullable()->constrained('business_documents')->restrictOnDelete();
            $t->foreignId('contract_template_id')->nullable()->constrained()->restrictOnDelete();
            $t->string('title');
            $t->string('status')->default('draft')->index();
            $t->string('currency', 3)->default('MAD');
            $t->string('language', 2)->default('fr');
            $t->string('billing_period')->default('one_time');
            $t->date('due_on')->nullable();
            $t->unsignedBigInteger('discount_amount')->default(0);
            $t->unsignedInteger('tax_basis_points')->default(0);
            $t->unsignedBigInteger('subtotal_amount')->default(0);
            $t->unsignedBigInteger('tax_amount')->default(0);
            $t->unsignedBigInteger('total_amount')->default(0);
            $t->text('terms')->nullable();
            $t->text('notes')->nullable();
            $t->json('issuer_snapshot')->nullable();
            $t->json('client_snapshot')->nullable();
            $t->timestamp('issued_at')->nullable();
            $t->timestamp('accepted_at')->nullable();
            $t->timestamp('signed_at')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
        Schema::create('document_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('business_document_id')->constrained()->cascadeOnDelete();
            $t->foreignId('catalogue_service_id')->nullable()->constrained()->nullOnDelete();
            $t->string('description');
            $t->text('scope')->nullable();
            $t->string('billing_period')->default('one_time');
            $t->unsignedBigInteger('quantity_milli')->default(1000);
            $t->unsignedBigInteger('unit_amount')->default(0);
            $t->unsignedInteger('position')->default(0);
            $t->timestamps();
        });
        Schema::create('document_sequences', function (Blueprint $t) {
            $t->id();
            $t->string('type');
            $t->unsignedInteger('year');
            $t->unsignedBigInteger('next_value')->default(1);
            $t->unique(['type', 'year']);
        });
        Schema::create('payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('business_document_id')->constrained()->restrictOnDelete();
            $t->unsignedBigInteger('amount');
            $t->date('paid_on');
            $t->string('method');
            $t->string('reference')->nullable();
            $t->text('notes')->nullable();
            $t->timestamp('voided_at')->nullable();
            $t->text('void_reason')->nullable();
            $t->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
        Schema::create('audit_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('action');
            $t->string('subject_type');
            $t->unsignedBigInteger('subject_id');
            $t->json('metadata')->nullable();
            $t->timestamp('created_at')->useCurrent();
        });
        DB::table('business_settings')->insert(['id' => 1, 'currency' => 'MAD', 'language' => 'fr', 'tax_mode' => 'not_configured', 'created_at' => now(), 'updated_at' => now()]);
        $content = DB::table('site_settings')->where('id', 1)->value('content');
        foreach ((json_decode($content ?? '{}', true)['admin_data']['services'] ?? []) as $service) {
            $price = $service['startingPrice'] ?? ($service['priceOptions'][0]['price'] ?? '0');
            preg_match('/[\d,]+(?:\.\d{1,2})?/', $price, $match);
            $amount = (int) round((float) str_replace(',', '', $match[0] ?? '0') * 100);
            DB::table('catalogue_services')->insert(['source_key' => $service['id'] ?? null, 'name' => $service['title'], 'description' => $service['description'] ?? null, 'scope' => implode("\n", $service['features'] ?? []), 'unit_amount' => $amount, 'currency' => 'MAD', 'billing_period' => str_contains($price, '/month') ? 'monthly' : 'one_time', 'revision_limit' => 2, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach (['fr' => "CONTRAT DE PRESTATION DE SERVICES\n\nDéfinir les livrables, les échéances, le nombre de révisions incluses, les responsabilités du client et les conditions de paiement.\n\nPréciser les règles concernant les modifications de périmètre, la propriété intellectuelle, la confidentialité et la résiliation.\n\nCe modèle doit être complété et approuvé avant utilisation.", 'en' => "SERVICE AGREEMENT\n\nDefine deliverables, milestones, included revisions, client responsibilities and payment schedule.\n\nSpecify scope changes, intellectual property, confidentiality and termination terms.\n\nComplete and approve this template before use."] as $language => $body) {
            DB::table('contract_templates')->insert(['name' => $language === 'fr' ? 'Prestations de services — à compléter' : 'Service agreement — complete before use', 'language' => $language, 'body' => $body, 'is_approved' => false, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        foreach (['audit_events', 'payments', 'document_sequences', 'document_items', 'business_documents', 'contract_templates', 'catalogue_services', 'leads', 'business_clients', 'business_settings'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('role'));
    }
};
