<?php

namespace App\Enums;

enum DeliveryNotificationEvent: string
{
    case OrderConfirmed = 'order_confirmed';
    case DriverAssigned = 'driver_assigned';
    case PackagePickedUp = 'package_picked_up';
    case PackageDelivered = 'package_delivered';
}
