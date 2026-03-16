<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\PendingRegistrationVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
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
    private const PENDING_REGISTRATION_SESSION_KEY = 'pending_registration';

    private const VERIFICATION_CODE_TTL_MINUTES = 10;

    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('welcome', [
            'status' => $request->session()->get('status'),
            'verification_email' => $request->session()->get('verification_email', $request->session()->get('pending_registration.email')),
            'has_pending_registration' => $request->session()->has(self::PENDING_REGISTRATION_SESSION_KEY),
        ]);
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
        $verificationCode = $this->generateVerificationCode();
        $this->storePendingRegistration(
            $request,
            payload: $payload,
            email: $email,
            verificationCode: $verificationCode,
        );

        try {
            Log::info('Sending registration verification code', ['email' => $email]);
            Notification::route('mail', $email)
                ->notify(new PendingRegistrationVerification($verificationCode, $email, self::VERIFICATION_CODE_TTL_MINUTES));
            Log::info('Registration verification code sent successfully', [
                'email' => $email,
                'mail_driver' => config('mail.default'),
                'note' => config('mail.default') === 'log' ? 'Email content is in storage/logs/laravel.log' : null,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to send registration verification code', [
                'email' => $email,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }

        return redirect()
            ->route('home')
            ->with('status', 'verification-code-sent')
            ->with('verification_email', $email);
    }

    public function resendVerification(Request $request): RedirectResponse|JsonResponse
    {
        $pending = $this->getPendingRegistration($request);

        if ($pending === null) {
            if ($request->expectsJson()) {
                return response()->json([
                    'state' => 'expired',
                    'message' => 'Your verification session expired. Please register again.',
                ], 410);
            }

            return redirect()->route('home')->withErrors([
                'email' => 'Your verification session expired. Please register again.',
            ]);
        }

        $verificationCode = $this->generateVerificationCode();
        $this->storePendingRegistration(
            $request,
            payload: $pending['payload'],
            email: $pending['email'],
            verificationCode: $verificationCode,
        );

        $resendEmail = $pending['email'];
        try {
            Log::info('Resending registration verification code', ['email' => $resendEmail]);
            Notification::route('mail', $resendEmail)
                ->notify(new PendingRegistrationVerification($verificationCode, $resendEmail, self::VERIFICATION_CODE_TTL_MINUTES));
            Log::info('Registration verification code resent successfully', [
                'email' => $resendEmail,
                'mail_driver' => config('mail.default'),
                'note' => config('mail.default') === 'log' ? 'Email content is in storage/logs/laravel.log' : null,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to resend registration verification code', [
                'email' => $resendEmail,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }

        if ($request->expectsJson()) {
            return response()->json([
                'state' => 'resent',
                'message' => 'A new verification code has been sent to your email.',
                'email' => $resendEmail,
            ]);
        }

        return redirect()
            ->route('home')
            ->with('status', 'verification-code-resent')
            ->with('verification_email', $resendEmail);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'digits:6'],
        ], [
            'code.required' => 'Enter the 6-digit code from your email.',
            'code.digits' => 'Verification codes must be exactly 6 digits.',
        ]);

        $pending = $this->getPendingRegistration($request);

        if ($pending === null) {
            return response()->json([
                'state' => 'expired',
                'message' => 'Your verification session expired. Please register again.',
            ], 410);
        }

        if ($pending['expires_at']->isPast()) {
            return response()->json([
                'state' => 'expired',
                'message' => 'This verification code has expired.',
            ], 410);
        }

        if (! Hash::check($validated['code'], $pending['otp_hash'])) {
            return response()->json([
                'state' => 'incorrect',
                'message' => 'The code you entered is incorrect. Please try again.',
            ], 422);
        }

        $user = $this->completePendingRegistration($pending['payload']);

        if (! $user instanceof User) {
            return response()->json([
                'state' => 'expired',
                'message' => 'Your verification session expired. Please register again.',
            ], 410);
        }

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->forget(self::PENDING_REGISTRATION_SESSION_KEY);

        return response()->json([
            'state' => 'verified',
            'message' => 'Your email was successfully verified.',
            'redirect' => route(
                method_exists($user, 'isAdmin') && $user->isAdmin() ? 'admin.dashboard' : 'dashboard'
            ),
        ]);
    }

    public function verifyRegistration(Request $request): RedirectResponse
    {
        $payload = $request->string('payload')->toString();

        if ($payload === '') {
            return redirect()->route('home');
        }

        $user = $this->completePendingRegistration($payload);

        if (! $user instanceof User) {
            return redirect()->route('home');
        }

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->forget(self::PENDING_REGISTRATION_SESSION_KEY);

        if (method_exists($user, 'isAdmin') && $user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('dashboard');
    }

    private function completePendingRegistration(string $payload): ?User
    {
        try {
            $decrypted = Crypt::decryptString($payload);
            $data = json_decode($decrypted, true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            return null;
        }

        if (! is_array($data) || ! isset($data['name'], $data['email'], $data['password_hash'])) {
            return null;
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

            return $user;
        }

        if (! $user->hasVerifiedEmail()) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        if (method_exists($user, 'hasPassword') && ! $user->hasPassword()) {
            $user->forceFill(['password' => (string) $data['password_hash']])->save();
        }

        return $user;
    }

    /**
     * @return array{payload: string, email: string, otp_hash: string, expires_at: Carbon}|null
     */
    private function getPendingRegistration(Request $request): ?array
    {
        $pending = $request->session()->get(self::PENDING_REGISTRATION_SESSION_KEY);

        if (! is_array($pending) || ! isset($pending['payload'], $pending['email'], $pending['otp_hash'], $pending['expires_at'])) {
            return null;
        }

        try {
            $expiresAt = Carbon::parse((string) $pending['expires_at']);
        } catch (\Throwable) {
            return null;
        }

        return [
            'payload' => (string) $pending['payload'],
            'email' => strtolower((string) $pending['email']),
            'otp_hash' => (string) $pending['otp_hash'],
            'expires_at' => $expiresAt,
        ];
    }

    private function generateVerificationCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function storePendingRegistration(Request $request, string $payload, string $email, string $verificationCode): void
    {
        $request->session()->put(self::PENDING_REGISTRATION_SESSION_KEY, [
            'payload' => $payload,
            'email' => $email,
            'otp_hash' => Hash::make($verificationCode),
            'expires_at' => now()->addMinutes(self::VERIFICATION_CODE_TTL_MINUTES)->toIso8601String(),
        ]);
    }
}
