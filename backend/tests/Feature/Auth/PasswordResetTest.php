<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        return User::factory()->create([
            'email'    => 'koffi@example.com',
            'password' => bcrypt('password123'),
        ]);
    }

    // ── Forgot password ────────────────────────────────────────────────────────

    public function test_forgot_password_sends_notification_for_existing_email(): void
    {
        Notification::fake();
        $user = $this->makeUser();

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'koffi@example.com',
        ]);

        $response->assertStatus(200)->assertJsonStructure(['message']);
        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_forgot_password_returns_200_for_unknown_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'unknown@example.com',
        ]);

        // Generic response prevents email enumeration.
        $response->assertStatus(200)->assertJsonStructure(['message']);
        Notification::assertNothingSent();
    }

    public function test_forgot_password_fails_with_missing_email(): void
    {
        $response = $this->postJson('/api/auth/forgot-password', []);

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_forgot_password_fails_with_invalid_email_format(): void
    {
        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'not-an-email',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    // ── Reset password ─────────────────────────────────────────────────────────

    public function test_reset_password_succeeds_with_valid_token(): void
    {
        $user  = $this->makeUser();
        $token = Password::createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'email'                 => 'koffi@example.com',
            'token'                 => $token,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)->assertJsonStructure(['message']);
    }

    public function test_reset_password_invalidates_all_tokens_on_success(): void
    {
        $user  = $this->makeUser();
        $user->createToken('session');
        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'email'                 => 'koffi@example.com',
            'token'                 => $token,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])->assertStatus(200);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        $this->makeUser();

        $response = $this->postJson('/api/auth/reset-password', [
            'email'                 => 'koffi@example.com',
            'token'                 => 'invalid-token',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(422)->assertJson(['message' => 'Ce lien de réinitialisation est invalide ou a expiré.']);
    }

    public function test_reset_password_fails_with_missing_fields(): void
    {
        $response = $this->postJson('/api/auth/reset-password', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'token', 'password']);
    }

    public function test_reset_password_fails_when_passwords_do_not_match(): void
    {
        $user  = $this->makeUser();
        $token = Password::createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'email'                 => 'koffi@example.com',
            'token'                 => $token,
            'password'              => 'newpassword123',
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['password']);
    }

    public function test_reset_password_fails_with_password_too_short(): void
    {
        $user  = $this->makeUser();
        $token = Password::createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'email'                 => 'koffi@example.com',
            'token'                 => $token,
            'password'              => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['password']);
    }
}
