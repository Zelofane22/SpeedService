<?php

namespace Tests\Feature\Notification;

use App\Enums\DeliveryNotificationEvent;
use App\Enums\DeliveryStatus;
use App\Enums\NotificationChannel;
use App\Models\Delivery;
use App\Models\NotificationLog;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\DeliveryUpdateNotification;
use App\Services\DeliveryNotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class DeliveryNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $client;
    private User $driver;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = User::factory()->create(['role' => 'client']);
        $this->driver = User::factory()->driver()->create();
    }

    private function token(User $user): array
    {
        return ['Authorization' => 'Bearer ' . $user->createToken('test')->plainTextToken];
    }

    public function test_online_payment_notifies_client_on_all_configured_channels(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/deliveries', [
            'sender_name' => 'Koffi Mensah',
            'sender_phone' => '+22997000000',
            'pickup_address' => 'Cadjèhoun, Cotonou',
            'recipient_name' => 'Aïcha Bah',
            'recipient_phone' => '+22997111111',
            'delivery_address' => 'Akpakpa, Cotonou',
            'package_type' => 'small',
            'content_category' => 'clothing',
            'delivery_type' => 'standard',
            'payment_method' => 'mtn_momo',
            'distance' => 7.2,
        ], $this->token($this->client))->assertCreated();

        $this->postJson(
            '/api/deliveries/' . $response->json('id') . '/pay',
            ['phone' => '97000000'],
            $this->token($this->client),
        )->assertOk();

        foreach (['in_app', 'email', 'sms'] as $channel) {
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $this->client->id,
                'delivery_id' => $response->json('id'),
                'event' => 'order_confirmed',
                'channel' => $channel,
            ]);
        }

        Notification::assertSentTo($this->client, DeliveryUpdateNotification::class);
    }

    public function test_order_creation_notifies_client(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/deliveries', [
            'sender_name' => 'Koffi Mensah',
            'sender_phone' => '+22997000000',
            'pickup_address' => 'Cadjèhoun, Cotonou',
            'recipient_name' => 'Aïcha Bah',
            'recipient_phone' => '+22997111111',
            'delivery_address' => 'Akpakpa, Cotonou',
            'package_type' => 'small',
            'content_category' => 'clothing',
            'delivery_type' => 'standard',
            'payment_method' => 'mtn_momo',
            'distance' => 7.2,
        ], $this->token($this->client))->assertCreated();

        foreach (['in_app', 'email', 'sms'] as $channel) {
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $this->client->id,
                'delivery_id' => $response->json('id'),
                'event' => 'order_created',
                'channel' => $channel,
            ]);
        }

        Notification::assertSentTo($this->client, DeliveryUpdateNotification::class);
    }

    public function test_cash_payment_notifies_client_of_awaiting_validation(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/deliveries', [
            'sender_name' => 'Koffi Mensah',
            'sender_phone' => '+22997000000',
            'pickup_address' => 'Cadjèhoun, Cotonou',
            'recipient_name' => 'Aïcha Bah',
            'recipient_phone' => '+22997111111',
            'delivery_address' => 'Akpakpa, Cotonou',
            'package_type' => 'small',
            'content_category' => 'clothing',
            'delivery_type' => 'standard',
            'payment_method' => 'cash_on_delivery',
            'distance' => 7.2,
        ], $this->token($this->client))->assertCreated();

        $this->postJson(
            '/api/deliveries/' . $response->json('id') . '/pay',
            [],
            $this->token($this->client),
        )->assertOk();

        foreach (['in_app', 'email', 'sms'] as $channel) {
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $this->client->id,
                'delivery_id' => $response->json('id'),
                'event' => 'awaiting_validation',
                'channel' => $channel,
            ]);
        }

        Notification::assertSentTo($this->client, DeliveryUpdateNotification::class);
    }

    public function test_order_cancellation_notifies_client(): void
    {
        Notification::fake();

        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status' => DeliveryStatus::AwaitingPayment,
        ]);

        $this->postJson(
            "/api/deliveries/{$delivery->id}/cancel",
            [],
            $this->token($this->client),
        )->assertOk();

        foreach (['in_app', 'email', 'sms'] as $channel) {
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $this->client->id,
                'delivery_id' => $delivery->id,
                'event' => 'order_cancelled',
                'channel' => $channel,
            ]);
        }

        Notification::assertSentTo($this->client, DeliveryUpdateNotification::class);
    }

    public function test_driver_transitions_generate_expected_client_notifications(): void
    {
        Notification::fake();

        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status' => DeliveryStatus::Confirmed,
        ]);
        $headers = $this->token($this->driver);

        $this->postJson("/api/driver/missions/{$delivery->id}/accept", [], $headers)
            ->assertOk()
            ->assertJsonPath('status', 'assigned');

        $this->patchJson("/api/driver/missions/{$delivery->id}/status", ['status' => 'picking_up'], $headers)
            ->assertOk();
        $this->patchJson("/api/driver/missions/{$delivery->id}/status", ['status' => 'in_delivery'], $headers)
            ->assertOk();
        $this->patchJson("/api/driver/missions/{$delivery->id}/status", ['status' => 'delivered'], $headers)
            ->assertOk();

        foreach (['driver_assigned', 'package_picked_up', 'package_delivered'] as $event) {
            $this->assertDatabaseHas('notification_logs', [
                'user_id' => $this->client->id,
                'delivery_id' => $delivery->id,
                'event' => $event,
                'channel' => 'in_app',
            ]);
        }

        Notification::assertSentToTimes($this->client, DeliveryUpdateNotification::class, 3);
    }

    public function test_client_can_list_and_mark_own_in_app_notifications_as_read(): void
    {
        $delivery = Delivery::factory()->create(['client_id' => $this->client->id]);
        $notification = NotificationLog::create([
            'user_id' => $this->client->id,
            'delivery_id' => $delivery->id,
            'event' => 'order_confirmed',
            'channel' => NotificationChannel::InApp,
            'title' => 'Commande validée',
            'message' => 'Votre commande a été validée.',
            'data' => ['delivery_id' => $delivery->id],
        ]);

        $headers = $this->token($this->client);

        $this->getJson('/api/notifications', $headers)
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('notifications.0.id', $notification->id);

        $this->patchJson("/api/notifications/{$notification->id}/read", [], $headers)
            ->assertOk();

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_same_delivery_event_is_not_sent_twice(): void
    {
        Notification::fake();

        $delivery = Delivery::factory()->create([
            'client_id' => $this->client->id,
            'status' => DeliveryStatus::Confirmed,
        ]);
        $service = app(DeliveryNotificationService::class);

        $service->send($delivery, DeliveryNotificationEvent::OrderConfirmed);
        $service->send($delivery, DeliveryNotificationEvent::OrderConfirmed);

        $this->assertDatabaseCount('notification_logs', 3);
        Notification::assertSentToTimes($this->client, DeliveryUpdateNotification::class, 1);
    }

    public function test_client_cannot_read_another_users_notification(): void
    {
        $other = User::factory()->create();
        $delivery = Delivery::factory()->create(['client_id' => $other->id]);
        $notification = NotificationLog::create([
            'user_id' => $other->id,
            'delivery_id' => $delivery->id,
            'event' => 'order_confirmed',
            'channel' => NotificationChannel::InApp,
            'title' => 'Commande validée',
            'message' => 'Votre commande a été validée.',
        ]);

        $this->patchJson(
            "/api/notifications/{$notification->id}/read",
            [],
            $this->token($this->client),
        )->assertNotFound();
    }
}
