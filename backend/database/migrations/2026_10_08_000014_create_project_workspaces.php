<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $t) {
            $t->id();
            $t->foreignId('source_document_id')->unique()->constrained('business_documents');
            $t->foreignId('business_client_id')->constrained('business_clients');
            $t->string('name');
            $t->string('status')->default('planned');
            $t->date('due_on')->nullable();
            $t->boolean('client_visible')->default(true);
            $t->text('notes')->nullable();
            $t->timestamps();
        });
        Schema::create('project_tasks', function (Blueprint $t) {
            $t->id();
            $t->foreignId('project_id')->constrained('projects');
            $t->string('title');
            $t->string('kind')->default('task');
            $t->string('status')->default('todo');
            $t->date('due_on')->nullable();
            $t->text('description')->nullable();
            $t->string('review_url', 2048)->nullable();
            $t->text('internal_notes')->nullable();
            $t->boolean('client_visible')->default(false);
            $t->string('approval_status')->default('draft');
            $t->unsignedInteger('revision')->default(1);
            $t->timestamp('submitted_at')->nullable();
            $t->timestamp('reviewed_at')->nullable();
            $t->text('client_feedback')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_tasks');
        Schema::dropIfExists('projects');
    }
};
