<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SuperAdminUserActionsTest extends TestCase
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

    // ── Autorisation ───────────────────────────────────────────────────────────

    public function test_regular_admin_cannot_reset_password(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/users/{$target->id}/password", ['password' => 'newpass123'])
            ->assertForbidden();
    }

    public function test_regular_admin_cannot_delete_user(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/users/{$target->id}")
            ->assertForbidden();
    }

    public function test_role_update_route_does_not_exist(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/users/{$target->id}/role", ['role' => 'driver'])
            ->assertNotFound();
    }

    // ── Reset password ─────────────────────────────────────────────────────────

    public function test_super_admin_can_reset_password(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/users/{$target->id}/password", ['password' => 'newpass123'])
            ->assertOk();

        $target->refresh();
        $this->assertTrue(Hash::check('newpass123', $target->password));
        $this->assertTrue($target->must_change_password);
    }

    public function test_password_must_be_at_least_8_chars(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/users/{$target->id}/password", ['password' => 'short'])
            ->assertStatus(422);
    }

    public function test_cannot_reset_another_super_admin_password(): void
    {
        $otherSuper = User::factory()->superAdmin()->create();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->patchJson("/api/admin/users/{$otherSuper->id}/password", ['password' => 'newpass123'])
            ->assertForbidden();
    }

    // ── Suppression ────────────────────────────────────────────────────────────

    public function test_super_admin_can_soft_delete_user(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->deleteJson("/api/admin/users/{$target->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('users', ['id' => $target->id]);
    }

    public function test_cannot_delete_self(): void
    {
        $this->actingAs($this->superAdmin, 'sanctum')
            ->deleteJson("/api/admin/users/{$this->superAdmin->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('users', ['id' => $this->superAdmin->id, 'deleted_at' => null]);
    }

    public function test_cannot_delete_another_super_admin(): void
    {
        $otherSuper = User::factory()->superAdmin()->create();

        $this->actingAs($this->superAdmin, 'sanctum')
            ->deleteJson("/api/admin/users/{$otherSuper->id}")
            ->assertForbidden();
    }
}
