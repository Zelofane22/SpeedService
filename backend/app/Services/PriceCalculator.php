<?php

namespace App\Services;

class PriceCalculator
{
    public const PRICE_PER_KM = 200;

    public static function calculate(float $distanceKm): int
    {
        if ($distanceKm <= 0) {
            return 0;
        }

        return (int) ceil($distanceKm) * self::PRICE_PER_KM;
    }

    public static function estimateDistanceKm(
        float $pickupLatitude,
        float $pickupLongitude,
        float $deliveryLatitude,
        float $deliveryLongitude,
    ): float {
        $earthRadiusKm = 6371;
        $latDelta = deg2rad($deliveryLatitude - $pickupLatitude);
        $lonDelta = deg2rad($deliveryLongitude - $pickupLongitude);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($pickupLatitude))
            * cos(deg2rad($deliveryLatitude))
            * sin($lonDelta / 2) ** 2;

        return $earthRadiusKm * 2 * atan2(sqrt($a), sqrt(1 - $a)) * 1.3;
    }
}
