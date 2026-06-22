<?php

namespace Tests\Feature\Delivery;

use App\Enums\DeliveryStatus;
use App\Enums\DeliveryType;
use App\Enums\PackageType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Delivery;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeliveryTest extends TestCase
{
    use RefreshDatabase;

    private User $client;
    private string $token;

    private array $validPayload = [
        'sender_name'      => 'Koffi Mensah',
        'sender_phone'     => '+22997000000',
        'pickup_address'   => 'Cadjèhoun, Rue des Cocotiers',
        'recipient_name'   => 'Aïcha Bah',
        'recipient_phone'  => '+22997111111',
        'delivery_address' => 'Akpakpa, Carrefour Total',
        'package_type'     => 'small',
        'content_category' => 'clothing',
        'delivery_type'    => 'standard',
        'payment_method'   => 'mtn_momo',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = User::factory()->create(['role' => 'client']);
        $this->token  = $this->client->createToken('test')->plainTextToken;
    }

    private function auth(): array
    {
        return ['Authorization' => 'Bearer ' . $this->token];
    }

    // ── index ─────────────────────────────────────────────────────────────────

    public function test_index_requires_authentication(): void
    {
        $this->getJson('/api/deliveries')->assertUnauthorized();
    }

    public function test_index_returns_empty_list_for_new_client(): void
    {
        $this->getJson('/api/deliveries', $this->auth())
            ->assertOk()
            ->assertJson([]);
    }

    public function test_index_returns_only_own_deliveries(): void
    {
        $other = User::factory()->create();
        Delivery::factory()->create(['client_id' => $other->id]);

        $this->getJson('/api/deliveries', $this->auth())
            ->assertOk()
            ->assertJson([]);
    }

    // ── store ─────────────────────────────────────────────────────────────────

    public function test_store_requires_authentication(): void
    {
        $this->postJson('/api/deliveries', $this->validPayload)->assertUnauthorized();
    }

    public function test_client_can_create_delivery(): void
    {
        $response = $this->postJson('/api/deliveries', $this->validPayload, $this->auth());

        $response->assertCreated()
            ->assertJsonStructure([
                'id', 'reference', 'status', 'price',
                'sender_name', 'recipient_name',
                'payment' => ['id', 'amount', 'method', 'status'],
            ]);

        $data = $response->json();
        $this->assertEquals('awaiting_payment', $data['status']);
        $this->assertStringStartsWith('SS-', $data['reference']);
        $this->assertEquals(2500, (int) $data['price']);
    }

    public function test_price_is_correct_for_each_package_type(): void
    {
        $cases = [
            'document' => ['standard' => 1500, 'express' => 3000],
            'small'    => ['standard' => 2500, 'express' => 5000],
            'medium'   => ['standard' => 4000, 'express' => 8000],
            'large'    => ['standard' => 6500, 'express' => 13000],
        ];

        foreach ($cases as $type => $prices) {
            foreach ($prices as $deliveryType => $expected) {
                $response = $this->postJson('/api/deliveries', [
                    ...$this->validPayload,
                    'package_type'  => $type,
                    'delivery_type' => $deliveryType,
                ], $this->auth());

                $response->assertCreated();
                $this->assertEquals($expected, (int) $response->json('price'), "Failed for {$type}/{$deliveryType}");
            }
        }
    }

    public function test_payment_record_is_created_with_pending_status(): void
    {
        $response = $this->postJson('/api/deliveries', $this->validPayload, $this->auth());
        $response->assertCreated();

        $this->assertDatabaseHas('payments', [
            'delivery_id' => $response->json('id'),
            'method'      => 'mtn_momo',
            'status'      => 'pending',
        ]);
    }

    public function test_status_history_is_created_on_store(): void
    {
        $response = $this->postJson('/api/deliveries', $this->validPayload, $this->auth());
        $response->assertCreated();

        $this->assertDatabaseHas('delivery_status_histories', [
            'delivery_id' => $response->json('id'),
            'status'      => 'awaiting_payment',
        ]);
    }

    public function test_store_fails_with_missing_required_fields(): void
    {
        $this->postJson('/api/deliveries', [], $this->auth())
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'sender_name', 'sender_phone', 'pickup_address',
                'recipient_name', 'recipient_phone', 'delivery_address',
                'package_type', 'content_category', 'delivery_type', 'payment_method',
            ]);
    }

    public function test_store_fails_with_invalid_package_type(): void
    {
        $this->postJson('/api/deliveries', [
            ...$this->validPayload,
            'package_type' => 'invalid',
        ], $this->auth())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['package_type']);
    }

    public function test_store_fails_with_invalid_delivery_type(): void
    {
        $this->postJson('/api/deliveries', [
            ...$this->validPayload,
            'delivery_type' => 'next-day',
        ], $this->auth())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['delivery_type']);
    }

    public function test_store_accepts_optional_fields(): void
    {
        $response = $this->postJson('/api/deliveries', [
            ...$this->validPayload,
            'package_description' => 'Des vêtements pour enfants',
            'package_weight'      => 1.5,
        ], $this->auth());

        $response->assertCreated();
        $this->assertEquals('Des vêtements pour enfants', $response->json('package_description'));
    }

    // ── show ──────────────────────────────────────────────────────────────────

    public function test_client_can_view_own_delivery(): void
    {
        $delivery = Delivery::factory()->create(['client_id' => $this->client->id]);
        $delivery->statusHistories()->create([
            'status' => DeliveryStatus::AwaitingPayment,
            'created_at' => now()->subMinute(),
        ]);
        $delivery->statusHistories()->create([
            'status' => DeliveryStatus::Confirmed,
            'created_at' => now(),
        ]);

        $this->getJson("/api/deliveries/{$delivery->id}", $this->auth())
            ->assertOk()
            ->assertJsonPath('id', $delivery->id)
            ->assertJsonPath('status_histories.0.status', 'awaiting_payment')
            ->assertJsonPath('status_histories.1.status', 'confirmed');
    }

    public function test_client_cannot_view_another_users_delivery(): void
    {
        $other    = User::factory()->create();
        $delivery = Delivery::factory()->create(['client_id' => $other->id]);

        $this->getJson("/api/deliveries/{$delivery->id}", $this->auth())
            ->assertNotFound();
    }

    // ── cancel ────────────────────────────────────────────────────────────────

    public function test_client_can_cancel_awaiting_payment_delivery(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::AwaitingPayment,
        ]);

        $this->postJson("/api/deliveries/{$delivery->id}/cancel", [], $this->auth())
            ->assertOk()
            ->assertJsonPath('status', 'cancelled');
    }

    public function test_client_cannot_cancel_in_delivery_order(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::InDelivery,
        ]);

        $this->postJson("/api/deliveries/{$delivery->id}/cancel", [], $this->auth())
            ->assertUnprocessable();
    }

    public function test_cancellation_adds_status_history_entry(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::AwaitingPayment,
        ]);

        $this->postJson("/api/deliveries/{$delivery->id}/cancel", [], $this->auth())
            ->assertOk();

        $this->assertDatabaseHas('delivery_status_histories', [
            'delivery_id' => $delivery->id,
            'status'      => 'cancelled',
        ]);
    }
}
