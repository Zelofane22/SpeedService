<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    private array $validPayload = [
        'name'                  => 'Koffi Mensah',
        'email'                 => 'koffi@example.com',
        'phone'                 => '+22997000000',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
    ];

    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'phone', 'role'], 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'koffi@example.com',
            'phone' => '+22997000000',
            'role'  => 'client',
        ]);
    }

    public function test_user_can_register_without_email(): void
    {
        $payload = $this->validPayload;
        unset($payload['email']);

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'phone', 'role'], 'token']);

        $this->assertDatabaseHas('users', [
            'email' => null,
            'phone' => '+22997000000',
            'role'  => 'client',
        ]);
    }

    public function test_password_is_not_returned_in_response(): void
    {
        $response = $this->postJson('/api/auth/register', $this->validPayload);

        $response->assertStatus(201);
        $this->assertArrayNotHasKey('password', $response->json('user'));
    }

    public function test_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'koffi@example.com']);

        $response = $this->postJson('/api/auth/register', $this->validPayload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_fails_with_duplicate_phone(): void
    {
        User::factory()->create(['phone' => '+22997000000']);

        $response = $this->postJson('/api/auth/register', $this->validPayload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_registration_fails_when_passwords_do_not_match(): void
    {
        $response = $this->postJson('/api/auth/register', [
            ...$this->validPayload,
            'password_confirmation' => 'differentpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_registration_fails_with_missing_required_fields(): void
    {
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'phone', 'password']);
    }

    public function test_registration_fails_with_password_too_short(): void
    {
        $response = $this->postJson('/api/auth/register', [
            ...$this->validPayload,
            'password'              => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
