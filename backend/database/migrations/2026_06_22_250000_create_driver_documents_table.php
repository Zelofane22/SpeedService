<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('application_id')->index();
            $table->foreign('application_id')->references('id')->on('driver_applications')->cascadeOnDelete();

            $table->string('document_type'); // DocumentType enum
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type')->nullable();
            $table->string('validation_status')->default('pending'); // pending | approved | rejected
            $table->text('rejection_note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_documents');
    }
};
