<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): User
    {
        $user = User::factory()->create([
            'name'     => 'Koffi Mensah',
            'email'    => 'koffi@example.com',
            'phone'    => '+22997000000',
            'password' => 'password123',
        ]);

        $this->actingAs($user, 'sanctum');

        return $user;
    }

    public function test_authenticated_user_can_view_profile(): void
    {
        $user = $this->actingAsUser();

        $response = $this->getJson('/api/profile');

        $response->assertOk()
            ->assertJson([
                'id'    => $user->id,
                'name'  => 'Koffi Mensah',
                'email' => 'koffi@example.com',
                'phone' => '+22997000000',
            ]);
    }

    public function test_unauthenticated_user_cannot_view_profile(): void
    {
        $this->getJson('/api/profile')->assertUnauthorized();
    }

    public function test_user_can_update_name_and_phone(): void
    {
        $this->actingAsUser();

        $response = $this->putJson('/api/profile', [
            'name'  => 'Koffi Updated',
            'phone' => '+22997111111',
        ]);

        $response->assertOk()
            ->assertJson([
                'name'  => 'Koffi Updated',
                'phone' => '+22997111111',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'koffi@example.com',
            'name'  => 'Koffi Updated',
            'phone' => '+22997111111',
        ]);
    }

    public function test_user_can_change_password_with_correct_current_password(): void
    {
        $user = $this->actingAsUser();

        $response = $this->putJson('/api/profile', [
            'name'                  => $user->name,
            'phone'                 => $user->phone,
            'current_password'      => 'password123',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertOk();
        $this->assertTrue(
            \Illuminate\Support\Facades\Hash::check('newpassword123', $user->fresh()->password)
        );
    }

    public function test_password_change_fails_with_wrong_current_password(): void
    {
        $this->actingAsUser();

        $response = $this->putJson('/api/profile', [
            'name'                  => 'Koffi Mensah',
            'phone'                 => '+22997000000',
            'current_password'      => 'wrongpassword',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_password_change_fails_when_new_password_not_confirmed(): void
    {
        $this->actingAsUser();

        $response = $this->putJson('/api/profile', [
            'name'                  => 'Koffi Mensah',
            'phone'                 => '+22997000000',
            'current_password'      => 'password123',
            'password'              => 'newpassword123',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_update_fails_with_phone_already_taken_by_another_user(): void
    {
        $this->actingAsUser();
        User::factory()->create(['phone' => '+22997999999']);

        $response = $this->putJson('/api/profile', [
            'name'  => 'Koffi Mensah',
            'phone' => '+22997999999',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_user_can_save_profile_with_unchanged_phone(): void
    {
        $this->actingAsUser();

        $response = $this->putJson('/api/profile', [
            'name'  => 'Koffi Mensah',
            'phone' => '+22997000000',
        ]);

        $response->assertOk();
    }

    public function test_update_fails_with_missing_required_fields(): void
    {
        $this->actingAsUser();

        $response = $this->putJson('/api/profile', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'phone']);
    }
}
