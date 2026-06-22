<?php

namespace Database\Factories;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'               => fake()->name(),
            'email'              => fake()->unique()->safeEmail(),
            'phone'              => fake()->unique()->numerify('+229########'),
            'password'           => Hash::make('password'),
            'role'               => UserRole::Client,
            'email_verified_at'  => now(),
        ];
    }

    public function driver(): static
    {
        return $this->state(['role' => UserRole::Driver]);
    }

    public function admin(): static
    {
        return $this->state(['role' => UserRole::Admin]);
    }

    public function unverified(): static
    {
        return $this->state(['email_verified_at' => null]);
    }
}
