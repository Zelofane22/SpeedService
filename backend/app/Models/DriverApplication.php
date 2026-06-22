<?php

namespace App\Models;

use App\Enums\DriverApplicationStatus;
use App\Enums\VehicleType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DriverApplication extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'city',
        'vehicle_type',
        'vehicle_brand',
        'vehicle_plate',
        'vehicle_photo_path',
        'payment_method',
        'payment_number',
        'bank_name',
        'bank_iban',
        'profile_photo_path',
        'status',
        'rejection_reason',
        'complement_request',
        'reviewed_by',
        'reviewed_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'status'       => DriverApplicationStatus::class,
            'vehicle_type' => VehicleType::class,
            'reviewed_at'  => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DriverDocument::class, 'application_id');
    }
}
