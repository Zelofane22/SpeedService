<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    private array $credentials = [
        'identifier' => 'koffi@example.com',
        'password'   => 'password123',
    ];

    private function makeUser(): User
    {
        return User::factory()->create([
            'email'    => 'koffi@example.com',
            'phone'    => '+22997000000',
            'password' => bcrypt('password123'),
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $this->makeUser();

        $response = $this->postJson('/api/auth/login', $this->credentials);

        $response->assertStatus(200)
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'phone', 'role'], 'token']);
    }

    public function test_user_can_login_with_phone(): void
    {
        $this->makeUser();

        $response = $this->postJson('/api/auth/login', [
            'identifier' => '+22997000000',
            'password'   => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'phone', 'role'], 'token']);
    }

    public function test_user_can_login_with_formatted_phone(): void
    {
        $this->makeUser();

        $response = $this->postJson('/api/auth/login', [
            'identifier' => '+229 97 00 00 00',
            'password'   => 'password123',
        ]);

        $response->assertStatus(200);
    }

    public function test_user_can_login_with_phone_stored_with_separators(): void
    {
        User::factory()->create([
            'phone'    => '+229 97 11 11 11',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'identifier' => '+22997111111',
            'password'   => 'password123',
        ]);

        $response->assertStatus(200);
    }

    public function test_legacy_email_field_is_still_accepted(): void
    {
        $this->makeUser();

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'koffi@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_password_is_not_returned_in_response(): void
    {
        $this->makeUser();

        $response = $this->postJson('/api/auth/login', $this->credentials);

        $response->assertStatus(200);
        $this->assertArrayNotHasKey('password', $response->json('user'));
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->makeUser();

        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'koffi@example.com',
            'password'   => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Identifiants incorrects.']);
    }

    public function test_login_fails_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/auth/login', $this->credentials);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Identifiants incorrects.']);
    }

    public function test_login_fails_with_nonexistent_phone(): void
    {
        $this->makeUser();

        $response = $this->postJson('/api/auth/login', [
            'identifier' => '+22990000000',
            'password'   => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Identifiants incorrects.']);
    }

    public function test_login_fails_with_missing_fields(): void
    {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['identifier', 'password']);
    }

    public function test_user_can_logout(): void
    {
        $user = $this->makeUser();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout');

        $response->assertStatus(204);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
