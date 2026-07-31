<?php

namespace App\Models;

use App\Enums\ContentCategory;
use App\Enums\DeliveryStatus;
use App\Enums\DeliveryType;
use App\Enums\PackageType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Commande de livraison, cœur du domaine : cycle de vie sur 9 statuts
 * (Draft → AwaitingPayment → AwaitingValidation → Confirmed → Assigned →
 * PickingUp → InDelivery → Delivered | Cancelled), prix calculé selon le colis,
 * adresses de ramassage/livraison et relations client, livreur, paiement et historique.
 */
class Delivery extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'reference',
        'client_id',
        'driver_id',
        'status',
        'package_type',
        'content_category',
        'package_description',
        'package_weight',
        'delivery_type',
        'price',
        'distance',
        'sender_name',
        'sender_phone',
        'pickup_address',
        'pickup_latitude',
        'pickup_longitude',
        'recipient_name',
        'recipient_phone',
        'delivery_address',
        'delivery_latitude',
        'delivery_longitude',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'status'           => DeliveryStatus::class,
            'package_type'     => PackageType::class,
            'content_category' => ContentCategory::class,
            'delivery_type'    => DeliveryType::class,
            'price'            => 'decimal:2',
            'distance'         => 'decimal:2',
            'package_weight'   => 'decimal:2',
            'pickup_latitude'  => 'decimal:7',
            'pickup_longitude' => 'decimal:7',
            'delivery_latitude'  => 'decimal:7',
            'delivery_longitude' => 'decimal:7',
            'paid_at'          => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(DeliveryStatusHistory::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
