<?php

namespace Database\Factories;

use App\Enums\DriverApplicationStatus;
use App\Enums\VehicleType;
use Illuminate\Database\Eloquent\Factories\Factory;

class DriverApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name'     => fake()->firstName(),
            'last_name'      => fake()->lastName(),
            'email'          => fake()->unique()->safeEmail(),
            'phone'          => '+229' . fake()->numerify('#########'),
            'city'           => fake()->randomElement(['Cotonou', 'Porto-Novo', 'Parakou']),
            'vehicle_type'   => VehicleType::Motorcycle->value,
            'vehicle_brand'  => 'Honda',
            'vehicle_plate'  => 'AB ' . fake()->numerify('####') . ' BJ',
            'payment_method' => 'mtn_momo',
            'payment_number' => '+229' . fake()->numerify('#########'),
            'status'         => DriverApplicationStatus::Pending->value,
            'submitted_at'   => now(),
        ];
    }
}
