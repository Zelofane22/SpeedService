<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference')->unique();
            $table->foreignUuid('client_id')->constrained('users');
            $table->foreignUuid('driver_id')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('status', [
                'draft', 'awaiting_payment', 'awaiting_validation',
                'confirmed', 'assigned', 'picking_up', 'in_delivery',
                'delivered', 'cancelled',
            ])->default('draft');

            $table->enum('package_type', ['document', 'small', 'medium', 'large']);
            $table->enum('content_category', ['document', 'clothing', 'electronics', 'food', 'other']);
            $table->text('package_description')->nullable();
            $table->decimal('package_weight', 8, 2)->nullable();

            $table->enum('delivery_type', ['standard', 'express'])->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('distance', 10, 2)->nullable();

            $table->string('sender_name');
            $table->string('sender_phone');
            $table->text('pickup_address');
            $table->decimal('pickup_latitude', 10, 7);
            $table->decimal('pickup_longitude', 10, 7);

            $table->string('recipient_name');
            $table->string('recipient_phone');
            $table->text('delivery_address');
            $table->decimal('delivery_latitude', 10, 7);
            $table->decimal('delivery_longitude', 10, 7);

            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['client_id', 'status']);
            $table->index(['driver_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
