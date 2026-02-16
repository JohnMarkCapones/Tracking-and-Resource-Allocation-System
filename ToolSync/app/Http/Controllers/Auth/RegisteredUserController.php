<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\PendingRegistrationVerification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('welcome');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => [
                'required',
                'confirmed',
                Rules\Password::min(8)
                    ->uncompromised(),
                function ($attribute, $value, $fail) {
                    $characterTypes = 0;
                    $characterTypes += preg_match('/[A-Z]/', $value) ? 1 : 0;
                    $characterTypes += preg_match('/[a-z]/', $value) ? 1 : 0;
                    $characterTypes += preg_match('/\d/', $value) ? 1 : 0;
                    $characterTypes += preg_match('/[^A-Za-z0-9]/', $value) ? 1 : 0;

                    if ($characterTypes < 3) {
                        $fail('Password is too weak. Use at least 3 of these: uppercase, lowercase, number, special character.');
                    }
                },
            ],
        ], [
            'password.min' => 'Password is too weak. Use at least 8 characters.',
            'password.uncompromised' => 'This password has appeared in a data leak. Please choose a different one.',
        ]);

        $email = strtolower($validated['email']);
        $payload = Crypt::encryptString((string) json_encode([
            'name' => $validated['name'],
            'email' => $email,
            'password_hash' => Hash::make($validated['password']),
        ]));
        $verificationUrl = URL::temporarySignedRoute(
            'registration.verify',
            now()->addMinutes(60),
            ['payload' => $payload],
        );

        try {
            Log::info('Sending registration verification email', ['email' => $email]);
            Notification::route('mail', $email)
                ->notify(new PendingRegistrationVerification($verificationUrl, $email));
            Log::info('Registration verification email sent successfully', [
                'email' => $email,
                'mail_driver' => config('mail.default'),
                'note' => config('mail.default') === 'log' ? 'Email content is in storage/logs/laravel.log' : null,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to send registration verification email', [
                'email' => $email,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }

        $request->session()->put('pending_registration', [
            'payload' => $payload,
            'email' => $email,
        ]);

        return redirect()
            ->route('home')
            ->with('status', 'verification-link-sent')
            ->with('verification_email', $email);
    }

    public function resendVerification(Request $request): RedirectResponse
    {
        $pending = $request->session()->get('pending_registration');

        if (! is_array($pending) || ! isset($pending['payload'], $pending['email'])) {
            return redirect()
                ->route('home')
                ->withErrors(['email' => 'Your verification session expired. Please register again.']);
        }

        $verificationUrl = URL::temporarySignedRoute(
            'registration.verify',
            now()->addMinutes(60),
            ['payload' => $pending['payload']],
        );

        $resendEmail = (string) $pending['email'];
        try {
            Log::info('Resending registration verification email', ['email' => $resendEmail]);
            Notification::route('mail', $resendEmail)
                ->notify(new PendingRegistrationVerification($verificationUrl, $resendEmail));
            Log::info('Registration verification email resent successfully', [
                'email' => $resendEmail,
                'mail_driver' => config('mail.default'),
                'note' => config('mail.default') === 'log' ? 'Email content is in storage/logs/laravel.log' : null,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to resend registration verification email', [
                'email' => $resendEmail,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }

        return redirect()
            ->route('home')
            ->with('status', 'verification-link-sent')
            ->with('verification_email', $resendEmail);
    }

    public function verifyRegistration(Request $request): RedirectResponse
    {
        $payload = $request->string('payload')->toString();

        if ($payload === '') {
            return redirect()->route('home');
        }

        try {
            $decrypted = Crypt::decryptString($payload);
            $data = json_decode($decrypted, true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            return redirect()->route('home');
        }

        if (! is_array($data) || ! isset($data['name'], $data['email'], $data['password_hash'])) {
            return redirect()->route('home');
        }

        $email = strtolower((string) $data['email']);
        $user = User::where('email', $email)->first();

        if (! $user) {
            $user = User::create([
                'name' => (string) $data['name'],
                'email' => $email,
                'password' => (string) $data['password_hash'],
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
        } else {
            if (! $user->hasVerifiedEmail()) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }
            if (method_exists($user, 'hasPassword') && ! $user->hasPassword()) {
                $user->forceFill(['password' => (string) $data['password_hash']])->save();
            }
        }

        Auth::login($user);
        $request->session()->forget('pending_registration');

        if (method_exists($user, 'isAdmin') && $user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('dashboard');
    }
}
