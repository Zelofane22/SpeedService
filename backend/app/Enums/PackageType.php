<?php

namespace App\Enums;

/**
 * Taille/tarif du colis : détermine le prix de base de la livraison.
 */
enum PackageType: string
{
    case Document = 'document';
    case Small    = 'small';
    case Medium   = 'medium';
    case Large    = 'large';
}
