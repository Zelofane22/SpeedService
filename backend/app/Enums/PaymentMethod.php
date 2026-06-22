<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case MtnMomo        = 'mtn_momo';
    case MoovMoney      = 'moov_money';
    case Card           = 'card';
    case CashOnDelivery = 'cash_on_delivery';
    case Agency         = 'agency';
}
