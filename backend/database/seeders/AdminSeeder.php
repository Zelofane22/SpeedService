<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@speedservice.bj'],
            [
                'name'               => 'Admin SpeedService',
                'phone'              => '+22900000000',
                'password'           => Hash::make('AdminPassword123!'),
                'role'               => UserRole::Admin,
                'email_verified_at'  => now(),
            ]
        );
    }
}
