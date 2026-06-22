<?php

namespace Tests\Feature\Rider;

use App\Enums\DriverApplicationStatus;
use App\Enums\UserRole;
use App\Models\DriverApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RiderApplicationTest extends TestCase
{
    use RefreshDatabase;

    // ── Public tunnel ─────────────────────────────────────────────────────────

    public function test_anyone_can_submit_application(): void
    {
        $this->postJson('/api/rider/apply', $this->validPayload())
            ->assertCreated()
            ->assertJsonStructure(['application_id', 'message']);
    }

    public function test_apply_creates_application_record(): void
    {
        $this->postJson('/api/rider/apply', $this->validPayload());

        $this->assertDatabaseHas('driver_applications', [
            'email'        => 'koffi@test.bj',
            'vehicle_type' => 'motorcycle',
            'status'       => DriverApplicationStatus::Pending->value,
        ]);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        $payload = $this->validPayload();
        $this->postJson('/api/rider/apply', $payload)->assertCreated();
        $this->postJson('/api/rider/apply', $payload)->assertUnprocessable();
    }

    public function test_apply_requires_mandatory_fields(): void
    {
        $this->postJson('/api/rider/apply', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'phone', 'city', 'vehicle_type']);
    }

    public function test_can_check_application_status(): void
    {
        $app = DriverApplication::factory()->create();

        $this->getJson('/api/rider/apply/status?application_id=' . $app->id)
            ->assertOk()
            ->assertJsonStructure(['status', 'status_label', 'documents']);
    }

    public function test_status_returns_404_for_unknown_application(): void
    {
        $this->getJson('/api/rider/apply/status?application_id=' . fake()->uuid())
            ->assertUnprocessable();
    }

    public function test_complement_rejected_when_status_is_not_complement_requested(): void
    {
        $app = DriverApplication::factory()->create([
            'status' => DriverApplicationStatus::Pending,
        ]);

        $this->postJson('/api/rider/apply/complement', [
            'application_id' => $app->id,
            'documents'      => [],
        ])->assertUnprocessable();
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    public function test_admin_can_list_applications(): void
    {
        $admin = User::factory()->admin()->create();
        DriverApplication::factory()->count(3)->create();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/riders/applications')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_non_admin_cannot_list_applications(): void
    {
        $client = User::factory()->create(['role' => UserRole::Client]);

        $this->actingAs($client, 'sanctum')
            ->getJson('/api/admin/riders/applications')
            ->assertForbidden();
    }

    public function test_admin_can_approve_application(): void
    {
        $admin = User::factory()->admin()->create();
        $app   = DriverApplication::factory()->create(['status' => DriverApplicationStatus::Pending]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/riders/applications/{$app->id}/review", [
                'action' => 'approve',
            ])
            ->assertOk()
            ->assertJsonFragment(['message' => 'Décision enregistrée.']);

        $this->assertDatabaseHas('driver_applications', [
            'id'     => $app->id,
            'status' => DriverApplicationStatus::Approved->value,
        ]);
    }

    public function test_admin_can_reject_application_with_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $app   = DriverApplication::factory()->create(['status' => DriverApplicationStatus::UnderReview]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/riders/applications/{$app->id}/review", [
                'action'           => 'reject',
                'rejection_reason' => 'Documents illisibles',
            ])
            ->assertOk();

        $this->assertDatabaseHas('driver_applications', [
            'id'               => $app->id,
            'status'           => DriverApplicationStatus::Rejected->value,
            'rejection_reason' => 'Documents illisibles',
        ]);
    }

    public function test_admin_can_request_complement(): void
    {
        $admin = User::factory()->admin()->create();
        $app   = DriverApplication::factory()->create(['status' => DriverApplicationStatus::UnderReview]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/riders/applications/{$app->id}/review", [
                'action'             => 'request_complement',
                'complement_request' => 'Merci d\'envoyer la carte grise en couleur.',
            ])
            ->assertOk();

        $this->assertDatabaseHas('driver_applications', [
            'id'     => $app->id,
            'status' => DriverApplicationStatus::ComplementRequested->value,
        ]);
    }

    public function test_reject_requires_rejection_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $app   = DriverApplication::factory()->create(['status' => DriverApplicationStatus::Pending]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/riders/applications/{$app->id}/review", [
                'action' => 'reject',
            ])
            ->assertUnprocessable();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function validPayload(): array
    {
        return [
            'first_name'   => 'Koffi',
            'last_name'    => 'Adjovi',
            'email'        => 'koffi@test.bj',
            'phone'        => '+22997000000',
            'city'         => 'Cotonou',
            'vehicle_type' => 'motorcycle',
            'vehicle_brand'=> 'Honda',
            'vehicle_plate'=> 'AB 1234 BJ',
            'payment_method' => 'mtn_momo',
            'payment_number' => '+22997111111',
        ];
    }
}
