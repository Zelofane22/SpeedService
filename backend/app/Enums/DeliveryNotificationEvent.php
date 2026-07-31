<?php

namespace App\Enums;

/**
 * Événements métier déclenchant une notification au client (email / SMS / in-app).
 */
enum DeliveryNotificationEvent: string
{
    case OrderConfirmed = 'order_confirmed';
    case DriverAssigned = 'driver_assigned';
    case PackagePickedUp = 'package_picked_up';
    case PackageDelivered = 'package_delivered';
    case OrderCreated = 'order_created';
    case AwaitingValidation = 'awaiting_validation';
    case OrderCancelled = 'order_cancelled';
}
