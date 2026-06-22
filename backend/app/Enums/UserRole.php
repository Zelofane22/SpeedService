<?php

namespace App\Enums;

enum UserRole: string
{
    case Client = 'client';
    case Driver = 'driver';
    case Admin  = 'admin';
}
