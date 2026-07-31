<?php

namespace App\Enums;

/**
 * Rôles utilisateur de la plateforme : client, livreur ou admin (back-office).
 */
enum UserRole: string
{
    case Client = 'client';
    case Driver = 'driver';
    case Admin  = 'admin';
}
