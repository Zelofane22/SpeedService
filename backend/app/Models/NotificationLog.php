<?php

namespace App\Models;

use App\Enums\DeliveryNotificationEvent;
use App\Enums\NotificationChannel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Journal d'une notification envoyée à un utilisateur pour une livraison
 * (événement + canal), utilisé pour la déduplication et la lecture in-app.
 */
class NotificationLog extends Model
{
    use HasUuids;

    protected $table = 'notification_logs';

    protected $fillable = [
        'user_id',
        'delivery_id',
        'event',
        'channel',
        'title',
        'message',
        'data',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannel::class,
            'event'   => DeliveryNotificationEvent::class,
            'data'    => 'array',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class);
    }
}
