<?php

namespace App\Enums;

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
