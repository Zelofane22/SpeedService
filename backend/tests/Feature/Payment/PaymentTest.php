<?php

namespace Tests\Feature\Payment;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Delivery;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private User $client;
    private string $token;

    private array $deliveryPayload = [
        'sender_name'      => 'Koffi Mensah',
        'sender_phone'     => '+22997000000',
        'pickup_address'   => 'Cadjèhoun, Cotonou',
        'recipient_name'   => 'Aïcha Bah',
        'recipient_phone'  => '+22997111111',
        'delivery_address' => 'Akpakpa, Cotonou',
        'package_type'     => 'small',
        'content_category' => 'clothing',
        'delivery_type'    => 'standard',
        'payment_method'   => 'mtn_momo',
        'distance'         => 7.2,
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

    private function createDelivery(array $overrides = []): array
    {
        $response = $this->postJson(
            '/api/deliveries',
            array_merge($this->deliveryPayload, $overrides),
            $this->auth(),
        );
        $response->assertCreated();
        return $response->json();
    }

    // ── Authentication ────────────────────────────────────────────────────────

    public function test_pay_requires_authentication(): void
    {
        // Create via factory to avoid session side-effects from createDelivery()
        $delivery = Delivery::factory()->create(['client_id' => $this->client->id]);
        Payment::create([
            'delivery_id' => $delivery->id,
            'amount'      => $delivery->price,
            'method'      => PaymentMethod::MtnMomo,
            'status'      => PaymentStatus::Pending,
        ]);

        $this->postJson('/api/deliveries/' . $delivery->id . '/pay', ['phone' => '97000000'])
            ->assertUnauthorized();
    }

    // ── Mobile Money ──────────────────────────────────────────────────────────

    public function test_client_can_pay_with_mtn_momo(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'mtn_momo']);

        $this->postJson('/api/deliveries/' . $delivery['id'] . '/pay', ['phone' => '97000000'], $this->auth())
            ->assertOk()
            ->assertJsonPath('status', 'confirmed')
            ->assertJsonPath('payment.status', 'succeeded');
    }

    public function test_client_can_pay_with_moov_money(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'moov_money']);

        $this->postJson('/api/deliveries/' . $delivery['id'] . '/pay', ['phone' => '96000000'], $this->auth())
            ->assertOk()
            ->assertJsonPath('status', 'confirmed')
            ->assertJsonPath('payment.status', 'succeeded');
    }

    public function test_mobile_money_pay_requires_phone(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'mtn_momo']);

        $this->postJson('/api/deliveries/' . $delivery['id'] . '/pay', [], $this->auth())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['phone']);
    }

    // ── Card ──────────────────────────────────────────────────────────────────

    public function test_client_can_pay_with_card(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'card']);

        $this->postJson('/api/deliveries/' . $delivery['id'] . '/pay', [
            'card_number'     => '4111111111111111',
            'expiry'          => '12/28',
            'cvv'             => '123',
            'cardholder_name' => 'Koffi Mensah',
        ], $this->auth())
            ->assertOk()
            ->assertJsonPath('status', 'confirmed')
            ->assertJsonPath('payment.status', 'succeeded');
    }

    public function test_card_pay_requires_all_fields(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'card']);

        $this->postJson('/api/deliveries/' . $delivery['id'] . '/pay', [], $this->auth())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['card_number', 'expiry', 'cvv', 'cardholder_name']);
    }

    // ── Cash / Agency (paiement physique) ────────────────────────────────────

    public function test_client_can_confirm_cash_on_delivery(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'cash_on_delivery']);

        $this->postJson('/api/deliveries/' . $delivery['id'] . '/pay', [], $this->auth())
            ->assertOk()
            ->assertJsonPath('status', 'awaiting_validation')
            ->assertJsonPath('payment.status', 'pending');
    }

    public function test_client_can_confirm_agency_payment(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'agency']);

        $this->postJson('/api/deliveries/' . $delivery['id'] . '/pay', [], $this->auth())
            ->assertOk()
            ->assertJsonPath('status', 'awaiting_validation')
            ->assertJsonPath('payment.status', 'pending');
    }

    // ── Edge cases ────────────────────────────────────────────────────────────

    public function test_cannot_pay_already_confirmed_delivery(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'mtn_momo']);
        $id       = $delivery['id'];

        $this->postJson('/api/deliveries/' . $id . '/pay', ['phone' => '97000000'], $this->auth())
            ->assertOk();

        $this->postJson('/api/deliveries/' . $id . '/pay', ['phone' => '97000000'], $this->auth())
            ->assertUnprocessable()
            ->assertJsonPath('message', "Cette livraison n'est pas en attente de paiement.");
    }

    public function test_cannot_pay_another_clients_delivery(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'mtn_momo']);

        $other = User::factory()->create(['role' => 'client']);
        $this->actingAs($other, 'sanctum')
            ->postJson('/api/deliveries/' . $delivery['id'] . '/pay', ['phone' => '97000000'])
            ->assertNotFound();
    }

    public function test_electronic_payment_generates_transaction_reference(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'mtn_momo']);

        $response = $this->postJson(
            '/api/deliveries/' . $delivery['id'] . '/pay',
            ['phone' => '97000000'],
            $this->auth(),
        )->assertOk();

        $this->assertStringStartsWith('TXN-', $response->json('payment.transaction_reference'));
    }

    public function test_electronic_payment_sets_paid_at(): void
    {
        $delivery = $this->createDelivery(['payment_method' => 'mtn_momo']);

        $response = $this->postJson(
            '/api/deliveries/' . $delivery['id'] . '/pay',
            ['phone' => '97000000'],
            $this->auth(),
        )->assertOk();

        $this->assertNotNull($response->json('paid_at'));
    }
}
