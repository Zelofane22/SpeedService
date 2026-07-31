<?php

namespace App\Enums;

/**
 * Type de livraison : Standard ou Express (tarif majoré).
 */
enum DeliveryType: string
{
    case Standard = 'standard';
    case Express  = 'express';
}
