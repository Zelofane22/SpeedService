<?php

namespace Tests\Feature\Admin;

use App\Enums\DeliveryStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Delivery;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $client;
    private User $driver;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin  = User::factory()->admin()->create();
        $this->client = User::factory()->create(['role' => UserRole::Client]);
        $this->driver = User::factory()->driver()->create();
    }

    // ── Access control ────────────────────────────────────────────────────────

    public function test_unauthenticated_request_returns_401(): void
    {
        $this->getJson('/api/admin/stats')
            ->assertUnauthorized();
    }

    public function test_client_cannot_access_admin_stats(): void
    {
        $this->actingAs($this->client, 'sanctum')
            ->getJson('/api/admin/stats')
            ->assertForbidden();
    }

    public function test_driver_cannot_access_admin_routes(): void
    {
        $this->actingAs($this->driver, 'sanctum')
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }

    public function test_client_cannot_access_admin_deliveries(): void
    {
        $this->actingAs($this->client, 'sanctum')
            ->getJson('/api/admin/deliveries')
            ->assertForbidden();
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    public function test_admin_can_get_stats(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/stats');

        $response->assertOk()
            ->assertJsonStructure([
                'users'               => ['total', 'clients', 'drivers'],
                'deliveries'          => ['total', 'by_status'],
                'revenue'             => ['total_xof', 'this_month_xof'],
                'pending_validations',
            ]);
    }

    public function test_stats_pending_validations_count_is_correct(): void
    {
        Delivery::factory()->count(2)->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::AwaitingValidation,
        ]);

        Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::Confirmed,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/stats');

        $response->assertOk()
            ->assertJsonPath('pending_validations', 2);
    }

    public function test_stats_revenue_counts_only_succeeded_payments(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::Confirmed,
        ]);

        Payment::create([
            'delivery_id' => $delivery->id,
            'amount'      => 5000,
            'method'      => PaymentMethod::MtnMomo,
            'status'      => PaymentStatus::Succeeded,
        ]);

        $deliveryFailed = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::AwaitingPayment,
        ]);

        Payment::create([
            'delivery_id' => $deliveryFailed->id,
            'amount'      => 3000,
            'method'      => PaymentMethod::MtnMomo,
            'status'      => PaymentStatus::Failed,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/stats');

        $response->assertOk()
            ->assertJsonPath('revenue.total_xof', 5000.0);
    }

    // ── Users listing ─────────────────────────────────────────────────────────

    public function test_admin_can_list_users_paginated(): void
    {
        User::factory()->count(20)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/users');

        $response->assertOk()
            ->assertJsonStructure([
                'data'         => [['id', 'name', 'email', 'role', 'created_at', 'deliveries_count']],
                'current_page',
                'total',
                'per_page',
            ]);

        // Default page size is 15
        $this->assertCount(15, $response->json('data'));
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/users?role=driver');

        $response->assertOk();

        foreach ($response->json('data') as $user) {
            $this->assertEquals('driver', $user['role']);
        }
    }

    public function test_admin_can_search_users_by_name(): void
    {
        User::factory()->create(['name' => 'Kwame Unique Name', 'email' => 'kwame@test.bj']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/users?search=Kwame');

        $response->assertOk();
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
        $this->assertStringContainsString('Kwame', $response->json('data.0.name'));
    }

    // ── Show user ─────────────────────────────────────────────────────────────

    public function test_admin_can_show_user_with_deliveries(): void
    {
        Delivery::factory()->count(3)->create(['client_id' => $this->client->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/users/{$this->client->id}");

        $response->assertOk()
            ->assertJsonPath('id', $this->client->id)
            ->assertJsonStructure(['deliveries_as_client']);
    }

    public function test_show_user_returns_404_for_unknown_id(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/users/00000000-0000-0000-0000-000000000000')
            ->assertNotFound();
    }

    // ── Update user role ──────────────────────────────────────────────────────

    public function test_admin_can_update_user_role(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/users/{$this->client->id}/role", ['role' => 'driver']);

        $response->assertOk()
            ->assertJsonPath('role', 'driver');

        $this->assertDatabaseHas('users', [
            'id'   => $this->client->id,
            'role' => 'driver',
        ]);
    }

    public function test_update_user_role_validates_role_value(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/users/{$this->client->id}/role", ['role' => 'superuser'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['role']);
    }

    // ── Deliveries listing ────────────────────────────────────────────────────

    public function test_admin_can_list_deliveries_paginated(): void
    {
        Delivery::factory()->count(25)->create(['client_id' => $this->client->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/deliveries');

        $response->assertOk()
            ->assertJsonStructure([
                'data'         => [[
                    'id', 'reference', 'status', 'price', 'pickup_address',
                    'delivery_address', 'from_address', 'to_address',
                    'amount_xof', 'created_at', 'client',
                ]],
                'current_page',
                'total',
                'per_page',
            ]);

        $this->assertSame('Cadjèhoun, Cotonou', $response->json('data.0.from_address'));
        $this->assertSame('Akpakpa, Cotonou', $response->json('data.0.to_address'));
        $this->assertSame(2500, (int) $response->json('data.0.amount_xof'));

        // Default page size is 20
        $this->assertCount(20, $response->json('data'));
    }

    public function test_admin_can_filter_deliveries_by_status(): void
    {
        Delivery::factory()->count(3)->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::Confirmed,
        ]);

        Delivery::factory()->count(2)->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::Delivered,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/deliveries?status=confirmed');

        $response->assertOk();
        foreach ($response->json('data') as $delivery) {
            $this->assertEquals('confirmed', $delivery['status']);
        }
    }

    // ── Show delivery ─────────────────────────────────────────────────────────

    public function test_admin_can_show_full_delivery_detail(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::AwaitingValidation,
        ]);

        Payment::create([
            'delivery_id' => $delivery->id,
            'amount'      => $delivery->price,
            'method'      => PaymentMethod::CashOnDelivery,
            'status'      => PaymentStatus::Pending,
        ]);

        $delivery->statusHistories()->create(['status' => DeliveryStatus::AwaitingValidation]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/deliveries/{$delivery->id}");

        $response->assertOk()
            ->assertJsonStructure(['id', 'client', 'status_histories', 'payment']);
    }

    // ── Update delivery status ────────────────────────────────────────────────

    public function test_admin_can_force_status_transition(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::Confirmed,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/deliveries/{$delivery->id}/status", [
                'status' => 'in_delivery',
                'note'   => 'Forcé par admin pour test.',
            ]);

        $response->assertOk()
            ->assertJsonPath('status', 'in_delivery');

        $this->assertDatabaseHas('delivery_status_histories', [
            'delivery_id' => $delivery->id,
            'status'      => 'in_delivery',
        ]);
    }

    public function test_admin_update_status_validates_value(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
        ]);

        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/deliveries/{$delivery->id}/status", ['status' => 'flying'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    // ── Validate payment ──────────────────────────────────────────────────────

    public function test_admin_can_validate_a_cash_payment(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::AwaitingValidation,
        ]);

        Payment::create([
            'delivery_id' => $delivery->id,
            'amount'      => $delivery->price ?? 2500,
            'method'      => PaymentMethod::CashOnDelivery,
            'status'      => PaymentStatus::Pending,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/admin/deliveries/{$delivery->id}/validate-payment");

        $response->assertOk()
            ->assertJsonPath('status', 'confirmed')
            ->assertJsonPath('payment.status', 'succeeded');

        $this->assertDatabaseHas('deliveries', [
            'id'     => $delivery->id,
            'status' => 'confirmed',
        ]);

        $this->assertDatabaseHas('delivery_status_histories', [
            'delivery_id' => $delivery->id,
            'status'      => 'confirmed',
        ]);
    }

    public function test_validate_payment_fails_for_non_awaiting_delivery(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::Confirmed,
        ]);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/admin/deliveries/{$delivery->id}/validate-payment")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Cette livraison n\'est pas en attente de validation.');
    }

    // ── Payments listing ─────────────────────────────────────────────────────

    public function test_admin_can_list_payments_paginated(): void
    {
        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::Confirmed,
        ]);

        Payment::create([
            'delivery_id'             => $delivery->id,
            'amount'                  => 2500,
            'method'                  => PaymentMethod::MtnMomo,
            'status'                  => PaymentStatus::Succeeded,
            'transaction_reference'   => 'TXN-TESTADMIN',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/payments');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id', 'delivery_id', 'reference', 'delivery_reference',
                    'client_name', 'method', 'amount_xof', 'date', 'status',
                ]],
                'current_page',
                'total',
                'per_page',
            ])
            ->assertJsonPath('data.0.reference', 'TXN-TESTADMIN')
            ->assertJsonPath('data.0.delivery_id', $delivery->id)
            ->assertJsonPath('data.0.delivery_reference', $delivery->reference)
            ->assertJsonPath('data.0.client_name', $this->client->name)
            ->assertJsonPath('data.0.method', 'mtn_momo')
            ->assertJsonPath('data.0.status', 'success');
    }

    public function test_admin_can_filter_payments_by_ui_status(): void
    {
        $successfulDelivery = Delivery::factory()->create(['client_id' => $this->client->id]);
        $pendingDelivery = Delivery::factory()->create(['client_id' => $this->client->id]);

        Payment::create([
            'delivery_id' => $successfulDelivery->id,
            'amount'      => 2500,
            'method'      => PaymentMethod::MtnMomo,
            'status'      => PaymentStatus::Succeeded,
        ]);

        Payment::create([
            'delivery_id' => $pendingDelivery->id,
            'amount'      => 3500,
            'method'      => PaymentMethod::CashOnDelivery,
            'status'      => PaymentStatus::Pending,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/payments?status=success');

        $response->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertSame('success', $response->json('data.0.status'));
        $this->assertSame($successfulDelivery->id, $response->json('data.0.delivery_id'));
    }

    // ── Drivers listing ───────────────────────────────────────────────────────

    public function test_admin_can_list_drivers(): void
    {
        User::factory()->driver()->count(5)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/drivers');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'name', 'email', 'is_active', 'deliveries_completed', 'created_at']],
            ]);

        foreach ($response->json('data') as $driver) {
            $this->assertTrue($driver['is_active']);
        }
    }

    // ── Reports ───────────────────────────────────────────────────────────────

    public function test_admin_can_get_reports(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/reports');

        $response->assertOk()
            ->assertJsonStructure([
                'revenue_by_month',
                'deliveries_by_month',
                'top_clients',
                'delivery_completion_rate',
            ]);
    }

    public function test_delivery_completion_rate_is_float(): void
    {
        Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::Delivered,
        ]);

        Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status'    => DeliveryStatus::Cancelled,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/reports');

        $response->assertOk();
        $this->assertIsFloat($response->json('delivery_completion_rate'));
    }
}
