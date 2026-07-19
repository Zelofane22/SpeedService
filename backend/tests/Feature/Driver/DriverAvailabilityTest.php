<?php

namespace Tests\Feature\Driver;

use App\Enums\DeliveryStatus;
use App\Models\Delivery;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_driver_can_toggle_availability(): void
    {
        $driver = User::factory()->driver()->create(['is_online' => true]);

        $this->actingAs($driver, 'sanctum')
            ->patchJson('/api/driver/availability', ['is_online' => false])
            ->assertOk()
            ->assertJsonFragment(['is_online' => false]);

        $this->assertDatabaseHas('users', [
            'id' => $driver->id,
            'is_online' => false,
        ]);
    }

    public function test_offline_driver_does_not_receive_available_missions(): void
    {
        $driver = User::factory()->driver()->create(['is_online' => false]);
        Delivery::factory()->create(['status' => DeliveryStatus::Confirmed]);

        $this->actingAs($driver, 'sanctum')
            ->getJson('/api/driver/missions/available')
            ->assertOk()
            ->assertExactJson([]);
    }

    public function test_offline_driver_cannot_accept_a_mission(): void
    {
        $driver = User::factory()->driver()->create(['is_online' => false]);
        $delivery = Delivery::factory()->create(['status' => DeliveryStatus::Confirmed]);

        $this->actingAs($driver, 'sanctum')
            ->postJson("/api/driver/missions/{$delivery->id}/accept")
            ->assertUnprocessable()
            ->assertJsonFragment(['message' => 'Passez en ligne pour accepter une mission.']);
    }
}
