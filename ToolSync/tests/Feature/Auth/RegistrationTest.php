<?php

use App\Models\User;
use App\Notifications\PendingRegistrationVerification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    Notification::fake();

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'ToolSync#2026!Xy9',
        'password_confirmation' => 'ToolSync#2026!Xy9',
    ]);

    $this->assertGuest();
    expect(User::where('email', 'test@example.com')->exists())->toBeFalse();
    $response->assertRedirect(route('home', absolute: false));
    $response->assertSessionHas('status', 'verification-link-sent');

    Notification::assertSentOnDemand(PendingRegistrationVerification::class);
});

test('verification link creates verified user and logs them in', function () {
    Notification::fake();

    $this->post('/register', [
        'name' => 'Test User',
        'email' => 'verifyme@example.com',
        'password' => 'ToolSync#2026!Xy9',
        'password_confirmation' => 'ToolSync#2026!Xy9',
    ]);

    expect(User::where('email', 'verifyme@example.com')->exists())->toBeFalse();

    $payload = session('pending_registration.payload');
    $verificationUrl = URL::temporarySignedRoute(
        'registration.verify',
        now()->addMinutes(60),
        ['payload' => $payload]
    );

    $response = $this->get($verificationUrl);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticated();
    expect(User::where('email', 'verifyme@example.com')->exists())->toBeTrue();
    expect(User::where('email', 'verifyme@example.com')->first()->hasVerifiedEmail())->toBeTrue();
});
