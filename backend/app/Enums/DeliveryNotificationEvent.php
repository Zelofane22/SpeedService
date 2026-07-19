<?php

namespace App\Enums;

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
