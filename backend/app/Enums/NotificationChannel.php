<?php

namespace App\Enums;

/**
 * Canal de diffusion d'une notification : SMS, email ou in-app.
 */
enum NotificationChannel: string
{
    case Sms   = 'sms';
    case Email = 'email';
    case InApp = 'in_app';
}
