<?php

use App\Models\User;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Mockery\MockInterface;

function mockSocialiteUser(
    string $id = '123456',
    string $name = 'Test User',
    string $email = 'test@example.com',
    string $avatar = 'https://example.com/avatar.jpg',
): SocialiteUser {
    return tap(
        Mockery::mock(SocialiteUser::class),
        function (MockInterface $mock) use ($id, $name, $email, $avatar) {
            $mock->shouldReceive('getId')->andReturn($id);
            $mock->shouldReceive('getName')->andReturn($name);
            $mock->shouldReceive('getEmail')->andReturn($email);
            $mock->shouldReceive('getAvatar')->andReturn($avatar);
        }
    );
}

test('it redirects to google', function () {
    $response = $this->get('/auth/google/redirect');

    $response->assertRedirectContains('accounts.google.com');
});

test('it redirects to github', function () {
    $response = $this->get('/auth/github/redirect');

    $response->assertRedirectContains('github.com/login');
});

test('it rejects unsupported providers', function () {
    $this->get('/auth/facebook/redirect')->assertNotFound();
    $this->get('/auth/facebook/callback')->assertNotFound();
});

test('it creates a new user from oauth callback', function () {
    $socialiteUser = mockSocialiteUser();

    Socialite::shouldReceive('driver')
        ->with('google')
        ->andReturn(Mockery::mock(Laravel\Socialite\Contracts\Provider::class, function (MockInterface $mock) use ($socialiteUser) {
            $mock->shouldReceive('user')->andReturn($socialiteUser);
        }));

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'provider' => 'google',
        'provider_id' => '123456',
        'name' => 'Test User',
    ]);
});

test('it links oauth to existing email account', function () {
    $existingUser = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    $socialiteUser = mockSocialiteUser(email: 'test@example.com');

    Socialite::shouldReceive('driver')
        ->with('github')
        ->andReturn(Mockery::mock(Laravel\Socialite\Contracts\Provider::class, function (MockInterface $mock) use ($socialiteUser) {
            $mock->shouldReceive('user')->andReturn($socialiteUser);
        }));

    $response = $this->get('/auth/github/callback');

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($existingUser);

    $existingUser->refresh();
    expect($existingUser->provider)->toBe('github');
    expect($existingUser->provider_id)->toBe('123456');
});

test('it logs in returning oauth user', function () {
    $existingUser = User::factory()->oauth('google')->create([
        'email' => 'test@example.com',
        'provider_id' => '123456',
    ]);

    $socialiteUser = mockSocialiteUser(email: 'test@example.com');

    Socialite::shouldReceive('driver')
        ->with('google')
        ->andReturn(Mockery::mock(Laravel\Socialite\Contracts\Provider::class, function (MockInterface $mock) use ($socialiteUser) {
            $mock->shouldReceive('user')->andReturn($socialiteUser);
        }));

    $response = $this->get('/auth/google/callback');

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($existingUser);
});

test('authenticated users cannot access oauth routes', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/auth/google/redirect')
        ->assertRedirect('/dashboard');
});

test('oauth users have verified email', function () {
    $socialiteUser = mockSocialiteUser();

    Socialite::shouldReceive('driver')
        ->with('google')
        ->andReturn(Mockery::mock(Laravel\Socialite\Contracts\Provider::class, function (MockInterface $mock) use ($socialiteUser) {
            $mock->shouldReceive('user')->andReturn($socialiteUser);
        }));

    $this->get('/auth/google/callback');

    $user = User::query()->where('email', 'test@example.com')->first();
    expect($user->email_verified_at)->not->toBeNull();
});

test('oauth users do not have a password', function () {
    $socialiteUser = mockSocialiteUser();

    Socialite::shouldReceive('driver')
        ->with('google')
        ->andReturn(Mockery::mock(Laravel\Socialite\Contracts\Provider::class, function (MockInterface $mock) use ($socialiteUser) {
            $mock->shouldReceive('user')->andReturn($socialiteUser);
        }));

    $this->get('/auth/google/callback');

    $user = User::query()->where('email', 'test@example.com')->first();
    expect($user->hasPassword())->toBeFalse();
});
