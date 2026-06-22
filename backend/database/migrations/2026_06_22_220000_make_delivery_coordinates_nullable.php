<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->decimal('pickup_latitude', 10, 7)->nullable()->change();
            $table->decimal('pickup_longitude', 10, 7)->nullable()->change();
            $table->decimal('delivery_latitude', 10, 7)->nullable()->change();
            $table->decimal('delivery_longitude', 10, 7)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->decimal('pickup_latitude', 10, 7)->nullable(false)->change();
            $table->decimal('pickup_longitude', 10, 7)->nullable(false)->change();
            $table->decimal('delivery_latitude', 10, 7)->nullable(false)->change();
            $table->decimal('delivery_longitude', 10, 7)->nullable(false)->change();
        });
    }
};
