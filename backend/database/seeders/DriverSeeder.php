<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'koffi.agbeko@speedservice.bj'],
            [
                'name'               => 'Koffi Agbeko',
                'phone'              => '+22961000001',
                'password'           => Hash::make('Driver123!'),
                'role'               => UserRole::Driver,
                'email_verified_at'  => now(),
            ]
        );
    }
}
