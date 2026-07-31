<?php

namespace App\Enums;

/**
 * Cycle de vie d'une livraison, dans l'ordre des transitions :
 * Draft → AwaitingPayment → AwaitingValidation → Confirmed → Assigned →
 * PickingUp → InDelivery → Delivered | Cancelled.
 */
enum DeliveryStatus: string
{
    case Draft               = 'draft';
    case AwaitingPayment     = 'awaiting_payment';
    case AwaitingValidation  = 'awaiting_validation';
    case Confirmed           = 'confirmed';
    case Assigned            = 'assigned';
    case PickingUp           = 'picking_up';
    case InDelivery          = 'in_delivery';
    case Delivered           = 'delivered';
    case Cancelled           = 'cancelled';
}
