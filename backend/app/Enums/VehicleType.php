<?php

namespace App\Enums;

enum VehicleType: string
{
    case Bicycle  = 'bicycle';
    case Motorcycle = 'motorcycle';
    case Car      = 'car';
    case Van      = 'van';

    public function label(): string
    {
        return match($this) {
            self::Bicycle   => 'Vélo',
            self::Motorcycle => 'Moto',
            self::Car       => 'Voiture',
            self::Van       => 'Camionnette',
        };
    }

    public function requiresVehicleDocuments(): bool
    {
        return $this !== self::Bicycle;
    }
}
