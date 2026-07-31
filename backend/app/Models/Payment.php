<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Paiement associé à une livraison : méthode (MoMo, carte, COD, agence),
 * statut, référence de transaction et validation manuelle le cas échéant.
 */
class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'delivery_id',
        'amount',
        'method',
        'status',
        'transaction_reference',
        'validated_by',
        'validated_at',
    ];

    protected function casts(): array
    {
        return [
            'method'       => PaymentMethod::class,
            'status'       => PaymentStatus::class,
            'amount'       => 'decimal:2',
            'validated_at' => 'datetime',
        ];
    }

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class);
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
