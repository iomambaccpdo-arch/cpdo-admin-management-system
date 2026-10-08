<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('records', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no');
            $table->string('title');
            $table->string('sender');
            $table->dateTime('received_at');
            $table->string('received_by');
            $table->string('oic')->nullable();
            $table->string('venue')->nullable();
            $table->string('remarks')->nullable();
            $table->dateTime('routed_at')->nullable();
            $table->string('routed_to')->nullable();
            $table->string('document_label')->nullable();
            $table->string('file_path')->nullable();
            $table->date('due_on')->nullable();
            $table->string('status')->default('Pending');
            $table->timestamps();

            $table->index('received_at');
            $table->index('status');
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('extension')->default('pdf');
            $table->string('location')->nullable();
            $table->string('stored_path')->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
        Schema::dropIfExists('records');
        Schema::dropIfExists('api_tokens');
    }
};
