<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_documents', function (Blueprint $table) {
            // 'local' pour les anciens fichiers sur disque, 'cloudinary' pour les nouveaux.
            $table->string('storage_disk')->default('local')->after('file_path');
            // 'image' | 'raw' | 'video' — nécessaire pour reconstruire l'URL signée Cloudinary.
            $table->string('resource_type')->nullable()->after('storage_disk');
            // Extension Cloudinary (jpg, png, pdf…) requise par privateDownloadUrl().
            $table->string('format')->nullable()->after('resource_type');
        });
    }

    public function down(): void
    {
        Schema::table('driver_documents', function (Blueprint $table) {
            $table->dropColumn(['storage_disk', 'resource_type', 'format']);
        });
    }
};
