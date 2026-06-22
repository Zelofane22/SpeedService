<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->foreignUuid('delivery_id')->nullable()->after('user_id')->constrained()->cascadeOnDelete();
            $table->string('event')->nullable()->after('delivery_id');
            $table->unique(['user_id', 'delivery_id', 'event', 'channel'], 'notification_logs_event_channel_unique');
        });
    }

    public function down(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->dropUnique('notification_logs_event_channel_unique');
            $table->dropConstrainedForeignId('delivery_id');
            $table->dropColumn('event');
        });
    }
};
