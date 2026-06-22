<?php

namespace App\Enums;

enum NotificationChannel: string
{
    case Sms   = 'sms';
    case Email = 'email';
    case InApp = 'in_app';
}
