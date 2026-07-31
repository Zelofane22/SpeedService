<?php

namespace App\Enums;

/**
 * Moyens de paiement acceptés. MtnMomo, MoovMoney et Card sont électroniques et
 * confirmés immédiatement ; CashOnDelivery et Agency exigent une validation admin.
 */
enum PaymentMethod: string
{
    case MtnMomo        = 'mtn_momo';
    case MoovMoney      = 'moov_money';
    case Card           = 'card';
    case CashOnDelivery = 'cash_on_delivery';
    case Agency         = 'agency';
}
