<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billing_schedules', function (Blueprint $t) {
            $t->id();
            $t->foreignId('source_document_id')->unique()->constrained('business_documents');
            $t->date('next_issue_on');
            $t->unsignedTinyInteger('billing_day');
            $t->unsignedTinyInteger('payment_due_days')->default(7);
            $t->date('end_on')->nullable();
            $t->string('status')->default('active');
            $t->text('last_error')->nullable();
            $t->timestamps();
        });
        Schema::table('business_documents', function (Blueprint $t) {
            $t->foreignId('billing_schedule_id')->nullable()->constrained();
            $t->date('period_start')->nullable();
            $t->date('period_end')->nullable();
            $t->unique(['billing_schedule_id', 'period_start']);
        });
        Schema::create('notifications', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('type');
            $t->morphs('notifiable');
            $t->text('data');
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
        });
        Schema::create('billing_reminders', function (Blueprint $t) {
            $t->id();
            $t->foreignId('business_document_id')->constrained()->cascadeOnDelete();
            $t->string('kind');
            $t->timestamps();
            $t->unique(['business_document_id', 'kind']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_reminders');
        Schema::dropIfExists('notifications');
        Schema::table('business_documents', function (Blueprint $t) {
            $t->dropUnique(['billing_schedule_id', 'period_start']);
            $t->dropConstrainedForeignId('billing_schedule_id');
            $t->dropColumn(['period_start', 'period_end']);
        });
        Schema::dropIfExists('billing_schedules');
    }
};
