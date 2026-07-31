<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Utilisateur de la plateforme : client, livreur ou admin (back-office).
 * is_super_admin débloque les actions sensibles côté admin, is_online gère la
 * disponibilité des livreurs, et softDeletes permet de supprimer sans perte définitive.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'is_active',
        'is_online',
        'is_super_admin',
        'must_change_password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'role'              => UserRole::class,
            'is_active'             => 'boolean',
            'is_online'             => 'boolean',
            'is_super_admin'        => 'boolean',
            'must_change_password'  => 'boolean',
        ];
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function deliveriesAsClient(): HasMany
    {
        return $this->hasMany(Delivery::class, 'client_id');
    }

    public function deliveriesAsDriver(): HasMany
    {
        return $this->hasMany(Delivery::class, 'driver_id');
    }

    public function validatedPayments(): HasMany
    {
        return $this->hasMany(Payment::class, 'validated_by');
    }

    public function notificationLogs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
