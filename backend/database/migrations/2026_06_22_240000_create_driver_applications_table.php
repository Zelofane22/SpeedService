<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable()->index();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            // Personal info (step 1)
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->index();
            $table->string('phone');
            $table->string('city');

            // Vehicle (step 3)
            $table->string('vehicle_type'); // VehicleType enum
            $table->string('vehicle_brand')->nullable();
            $table->string('vehicle_plate')->nullable();
            $table->string('vehicle_photo_path')->nullable();

            // Payment info (step 5)
            $table->string('payment_method')->nullable();
            $table->string('payment_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_iban')->nullable();

            // Profile photo (step 6)
            $table->string('profile_photo_path')->nullable();

            // Status
            $table->string('status')->default('pending'); // DriverApplicationStatus enum
            $table->text('rejection_reason')->nullable();
            $table->text('complement_request')->nullable();
            $table->uuid('reviewed_by')->nullable();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('submitted_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_applications');
    }
};
