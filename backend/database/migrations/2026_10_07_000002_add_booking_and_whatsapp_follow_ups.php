<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $t) {
            $t->uuid('submission_key')->nullable()->unique();
            $t->string('intent')->default('enquiry')->index();
            $t->timestamp('preferred_at')->nullable();
            $t->string('booking_timezone')->nullable();
            $t->timestamp('whatsapp_consent_at')->nullable();
            $t->timestamp('last_whatsapp_follow_up_at')->nullable();
        });
        Schema::create('lead_follow_ups', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lead_id')->constrained()->restrictOnDelete();
            $t->string('phone');
            $t->text('message');
            $t->string('status')->default('draft');
            $t->timestamp('sent_at')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_follow_ups');
        Schema::table('leads', fn (Blueprint $t) => $t->dropColumn(['submission_key', 'intent', 'preferred_at', 'booking_timezone', 'whatsapp_consent_at', 'last_whatsapp_follow_up_at']));
    }
};
