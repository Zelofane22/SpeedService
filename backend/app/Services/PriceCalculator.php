<?php

namespace App\Services;

use App\Enums\DeliveryType;
use App\Enums\PackageType;

class PriceCalculator
{
    private const BASE_PRICES = [
        PackageType::Document->value => 1500,
        PackageType::Small->value    => 2500,
        PackageType::Medium->value   => 4000,
        PackageType::Large->value    => 6500,
    ];

    public static function calculate(PackageType $packageType, DeliveryType $deliveryType): int
    {
        $base = self::BASE_PRICES[$packageType->value] ?? 2500;

        return $deliveryType === DeliveryType::Express ? $base * 2 : $base;
    }
}
