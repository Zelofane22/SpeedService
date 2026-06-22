<?php

namespace App\Enums;

enum ContentCategory: string
{
    case Document    = 'document';
    case Clothing    = 'clothing';
    case Electronics = 'electronics';
    case Food        = 'food';
    case Other       = 'other';
}
