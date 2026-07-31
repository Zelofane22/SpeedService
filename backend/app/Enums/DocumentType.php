<?php

namespace App\Enums;

/**
 * Documents requis pour une candidature livreur, avec libellé d'affichage.
 */
enum DocumentType: string
{
    case NationalId       = 'national_id_front';
    case NationalIdBack   = 'national_id_back';
    case Passport         = 'passport';
    case DriverLicense    = 'driver_license';
    case VehicleCard      = 'vehicle_registration_card';
    case Insurance        = 'insurance';
    case ProfilePhoto     = 'profile_photo';
    case VehiclePhoto     = 'vehicle_photo';

    public function label(): string
    {
        return match($this) {
            self::NationalId     => 'CNI (recto)',
            self::NationalIdBack => 'CNI (verso)',
            self::Passport       => 'Passeport',
            self::DriverLicense  => 'Permis de conduire',
            self::VehicleCard    => 'Carte grise',
            self::Insurance      => 'Attestation d\'assurance',
            self::ProfilePhoto   => 'Photo de profil',
            self::VehiclePhoto   => 'Photo du véhicule',
        };
    }
}
