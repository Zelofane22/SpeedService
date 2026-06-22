<?php

namespace Database\Factories;

use App\Enums\ContentCategory;
use App\Enums\DeliveryStatus;
use App\Enums\DeliveryType;
use App\Enums\PackageType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DeliveryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'reference'        => 'SS-' . now()->year . '-' . strtoupper(Str::random(6)),
            'client_id'        => User::factory(),
            'driver_id'        => null,
            'status'           => DeliveryStatus::AwaitingPayment,
            'package_type'     => PackageType::Small,
            'content_category' => ContentCategory::Clothing,
            'delivery_type'    => DeliveryType::Standard,
            'price'            => 2500,
            'sender_name'      => fake()->name(),
            'sender_phone'     => fake()->numerify('+229########'),
            'pickup_address'   => 'Cadjèhoun, Cotonou',
            'pickup_latitude'  => 0.0,
            'pickup_longitude' => 0.0,
            'recipient_name'   => fake()->name(),
            'recipient_phone'  => fake()->numerify('+229########'),
            'delivery_address' => 'Akpakpa, Cotonou',
            'delivery_latitude'  => 0.0,
            'delivery_longitude' => 0.0,
        ];
    }
}
