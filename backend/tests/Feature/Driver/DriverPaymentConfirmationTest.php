<?php

namespace Tests\Feature\Driver;

use App\Enums\DeliveryStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Delivery;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class DriverPaymentConfirmationTest extends TestCase
{
    use RefreshDatabase;

    public function test_driver_must_send_payment_confirmation_keyword(): void
    {
        Notification::fake();

        $driver = User::factory()->driver()->create();
        $delivery = $this->cashMissionFor($driver);

        $this->actingAs($driver, 'sanctum')
            ->postJson("/api/driver/missions/{$delivery->id}/confirm-payment", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('confirmation');

        $this->assertDatabaseHas('deliveries', [
            'id' => $delivery->id,
            'status' => DeliveryStatus::PickingUp->value,
        ]);
    }

    public function test_driver_confirms_cash_payment_with_keyword(): void
    {
        Notification::fake();

        $driver = User::factory()->driver()->create();
        $delivery = $this->cashMissionFor($driver);

        $this->actingAs($driver, 'sanctum')
            ->postJson("/api/driver/missions/{$delivery->id}/confirm-payment", [
                'confirmation' => 'PAIEMENTRECU',
            ])
            ->assertOk()
            ->assertJsonPath('status', DeliveryStatus::InDelivery->value)
            ->assertJsonPath('payment.status', PaymentStatus::Succeeded->value);

        $this->assertDatabaseHas('payments', [
            'delivery_id' => $delivery->id,
            'status' => PaymentStatus::Succeeded->value,
            'validated_by' => $driver->id,
        ]);
    }

    public function test_driver_cannot_skip_cash_payment_confirmation_with_status_update(): void
    {
        Notification::fake();

        $driver = User::factory()->driver()->create();
        $delivery = $this->cashMissionFor($driver);

        $this->actingAs($driver, 'sanctum')
            ->patchJson("/api/driver/missions/{$delivery->id}/status", [
                'status' => DeliveryStatus::InDelivery->value,
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Confirmez d’abord le paiement physique avec le code PAIEMENTRECU.');

        $this->assertDatabaseHas('deliveries', [
            'id' => $delivery->id,
            'status' => DeliveryStatus::PickingUp->value,
        ]);

        $this->assertDatabaseHas('payments', [
            'delivery_id' => $delivery->id,
            'status' => PaymentStatus::Pending->value,
        ]);
    }

    private function cashMissionFor(User $driver): Delivery
    {
        $delivery = Delivery::factory()->create([
            'driver_id' => $driver->id,
            'status' => DeliveryStatus::PickingUp,
        ]);

        Payment::create([
            'delivery_id' => $delivery->id,
            'amount' => $delivery->price,
            'method' => PaymentMethod::CashOnDelivery,
            'status' => PaymentStatus::Pending,
        ]);

        return $delivery;
    }
}
