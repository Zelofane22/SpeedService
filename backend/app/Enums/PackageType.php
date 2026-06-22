<?php

namespace App\Enums;

enum PackageType: string
{
    case Document = 'document';
    case Small    = 'small';
    case Medium   = 'medium';
    case Large    = 'large';
}
