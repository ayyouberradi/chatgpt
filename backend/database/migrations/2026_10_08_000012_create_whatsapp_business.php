<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_settings', function (Blueprint $t) {
            $t->id();
            $t->boolean('enabled')->default(false);
            $t->boolean('confirmations')->default(true);
            $t->boolean('followups')->default(false);
            $t->string('confirmation_template')->nullable();
            $t->string('followup_template')->nullable();
            $t->string('language')->default('fr');
            $t->unsignedBigInteger('started_after_lead_id')->default(0);
            $t->timestamps();
        });
        Schema::table('leads', fn (Blueprint $t) => $t->timestamp('last_whatsapp_reply_at')->nullable());
        Schema::create('whatsapp_messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $t->string('dedupe_key')->unique();
            $t->string('phone');
            $t->string('kind');
            $t->boolean('automatic')->default(true);
            $t->string('template');
            $t->string('language');
            $t->json('parameters');
            $t->string('status')->default('queued')->index();
            $t->unsignedTinyInteger('attempts')->default(0);
            $t->timestamp('available_at');
            $t->timestamp('expires_at');
            $t->timestamp('claimed_at')->nullable();
            $t->timestamp('submitted_at')->nullable();
            $t->timestamp('delivered_at')->nullable();
            $t->timestamp('read_at')->nullable();
            $t->string('provider_message_id')->nullable()->unique();
            $t->text('last_error')->nullable();
            $t->timestamps();
        });
        Schema::create('whatsapp_status_events', function (Blueprint $t) {
            $t->id();
            $t->string('event_key', 64)->unique();
            $t->string('provider_message_id')->index();
            $t->string('status');
            $t->timestamp('occurred_at');
            $t->string('error_code')->nullable();
            $t->timestamps();
        });
        Schema::create('whatsapp_replies', function (Blueprint $t) {
            $t->id();
            $t->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $t->string('provider_message_id')->unique();
            $t->string('phone');
            $t->string('kind');
            $t->text('message')->nullable();
            $t->timestamp('received_at');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_replies');
        Schema::dropIfExists('whatsapp_status_events');
        Schema::dropIfExists('whatsapp_messages');
        Schema::table('leads', fn (Blueprint $t) => $t->dropColumn('last_whatsapp_reply_at'));
        Schema::dropIfExists('whatsapp_settings');
    }
};
