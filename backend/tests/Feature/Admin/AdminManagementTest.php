<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\AdminActionLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin      = User::factory()->admin()->create();
        $this->superAdmin = User::factory()->superAdmin()->create();
    }

    // ── Access control ────────────────────────────────────────────────────────

    public function test_regular_admin_cannot_list_admins(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/admins')
            ->assertForbidden();
    }

    public function test_unauthenticated_cannot_list_admins(): void
    {
        $this->getJson('/api/admin/admins')->assertUnauthorized();
    }

    public function test_super_admin_can_list_only_admins(): void
    {
        User::factory()->create(); // client — ne doit pas apparaître
        User::factory()->driver()->create();

        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->getJson('/api/admin/admins')
            ->assertOk();

        $roles = collect($response->json('data'))->pluck('is_super_admin');
        // Seuls les 2 admins (dont 1 super) doivent remonter.
        $this->assertCount(2, $response->json('data'));
        // Le super admin remonte en premier (tri is_super_admin desc).
        $this->assertTrue($response->json('data.0.is_super_admin'));
    }

    // ── Création ──────────────────────────────────────────────────────────────

    public function test_super_admin_can_create_admin(): void
    {
        $response = $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/admin/admins', [
                'name'     => 'Nouvel Admin',
                'email'    => 'nouvel.admin@speedservice.bj',
                'password' => 'Password123!',
            ])
            ->assertCreated()
            ->assertJsonPath('is_super_admin', false);

        $this->assertDatabaseHas('users', [
            'email'                => 'nouvel.admin@speedservice.bj',
            'role'                 => UserRole::Admin->value,
            'is_super_admin'       => false,
            'must_change_password' => true,
        ]);

        $this->assertDatabaseHas('admin_action_logs', [
            'admin_id' => $this->superAdmin->id,
            'action'   => 'admin.created',
        ]);
    }

    public function test_create_admin_rejects_duplicate_email(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum')
            ->postJson('/api/admin/admins', [
                'name'     => 'X',
                'email'    => $this->admin->email,
                'password' => 'Password123!',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrorFor('email');
    }

    public function test_regular_admin_cannot_create_admin(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/admins', [
                'name'     => 'X',
                'email'    => 'x@speedservice.bj',
                'password' => 'Password123!',
            ])
            ->assertForbidden();
    }

    // ── Privilège super admin ─────────────────────────────────────────────────

    public function test_super_admin_can_grant_super_privilege(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/admins/{$this->admin->id}/super")
            ->assertOk()
            ->assertJsonPath('is_super_admin', true);

        $this->assertTrue($this->admin->fresh()->is_super_admin);
        $this->assertDatabaseHas('admin_action_logs', ['action' => 'admin.super_granted']);
    }

    public function test_super_admin_can_revoke_super_privilege(): void
    {
        $other = User::factory()->superAdmin()->create();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/admins/{$other->id}/super")
            ->assertOk()
            ->assertJsonPath('is_super_admin', false);

        $this->assertFalse($other->fresh()->is_super_admin);
        $this->assertDatabaseHas('admin_action_logs', ['action' => 'admin.super_revoked']);
    }

    public function test_cannot_toggle_own_super_privilege(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/admins/{$this->superAdmin->id}/super")
            ->assertStatus(422);

        $this->assertTrue($this->superAdmin->fresh()->is_super_admin);
    }

    public function test_cannot_revoke_last_super_admin(): void
    {
        // superAdmin est le seul super admin ; se retirer soi-même est déjà bloqué,
        // donc on teste via un second super admin qui tente de retirer le dernier.
        // Ici superAdmin est unique → on vérifie la garde "dernier super admin".
        $another = User::factory()->superAdmin()->create();
        // Retire le privilège de $another → il reste superAdmin (1 restant).
        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/admins/{$another->id}/super")
            ->assertOk();
        // $another tente de retirer le privilège de superAdmin (dernier) → 422.
        $this->actingAs($another, 'sanctum')
            ->patchJson("/api/admin/admins/{$this->superAdmin->id}/super")
            ->assertStatus(422);
    }

    // ── Révocation d'accès ────────────────────────────────────────────────────

    public function test_super_admin_can_revoke_admin_access(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/admins/{$this->admin->id}/revoke")
            ->assertOk()
            ->assertJsonPath('role', UserRole::Client->value);

        $this->assertSame(UserRole::Client, $this->admin->fresh()->role);
        $this->assertDatabaseHas('admin_action_logs', ['action' => 'admin.revoked']);
    }

    public function test_cannot_revoke_a_super_admin(): void
    {
        $other = User::factory()->superAdmin()->create();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/admins/{$other->id}/revoke")
            ->assertStatus(422);

        $this->assertSame(UserRole::Admin, $other->fresh()->role);
    }

    public function test_cannot_revoke_self(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/admins/{$this->superAdmin->id}/revoke")
            ->assertStatus(422);
    }
}
