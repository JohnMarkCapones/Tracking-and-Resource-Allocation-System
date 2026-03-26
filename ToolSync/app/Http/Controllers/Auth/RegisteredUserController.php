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
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                // Fix 1: Disposable/temporary email domain blocklist
                function ($attribute, $value, $fail) {
                    $domain = strtolower(substr(strrchr($value, '@'), 1));
                    $blocked = [
                        'mailinator.com','guerrillamail.com','guerrillamail.net','guerrillamail.org',
                        'guerrillamail.biz','guerrillamail.de','guerrillamail.info','grr.la',
                        'sharklasers.com','guerrillamailblock.com','spam4.me','trashmail.com',
                        'trashmail.at','trashmail.io','trashmail.me','trashmail.net','trashmail.org',
                        'tempmail.com','temp-mail.org','temp-mail.io','tempinbox.com','tempr.email',
                        'dispostable.com','disposablemail.com','discard.email','discardmail.com',
                        'mailnull.com','maildrop.cc','mailnesia.com','mailnull.com','mailscrap.com',
                        'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
                        'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf','moncourrier.fr.nf',
                        'monemail.fr.nf','monmail.fr.nf','throwam.com','throwam.net','throwam.org',
                        'throwam.info','throwam.biz','10minutemail.com','10minutemail.net',
                        '10minutemail.org','10minutemail.co.uk','10minemail.com','minuteinbox.com',
                        'getairmail.com','filzmail.com','spamgourmet.com','spamgourmet.net',
                        'spamgourmet.org','mailexpire.com','spam.la','byom.de','safetymail.info',
                        'deadaddress.com','garbagemail.org','getonemail.com','jetable.com',
                        'jetable.net','jetable.org','jetable.fr','netzidiot.de','no-spam.ws',
                        'nobulk.com','noclickemail.com','nomail.pw','nomail2me.com','nospamfor.us',
                        'nowmymail.com','objectmail.com','odaymail.com','oneoffemail.com',
                        'pookmail.com','qq.com.stopspam.org','rcpt.at','rklips.com','rmqkr.net',
                        'safe-mail.net','snkmail.com','sofort-mail.de','spamfree24.org',
                        'spamhole.com','spamify.com','spaminator.de','spamkill.info','spamoff.de',
                        'spamspot.com','spamthis.co.uk','spamtroll.net','speed.1s.fr','supergreatmail.com',
                        'suremail.info','tempalias.com','tempe-mail.com','tempinbox.net',
                        'tempsky.com','tempomail.fr','temporarily.de','temporaryemail.net',
                        'temporaryforwarding.com','temporaryinbox.com','tempymail.com','thanksnospam.info',
                        'thisisnotmyrealemail.com','throam.com','trashmail.at','trashmail.io',
                        'trashmailer.com','trashmail.me','trashmail.net','trashmail.org',
                        'trashmail.xyz','uggsrock.com','wegwerfmail.de','wegwerfmail.net',
                        'wegwerfmail.org','wh4f.org','whyspam.me','xagloo.com','xemaps.com',
                        'xents.com','xmaily.com','xoxy.net','yepmail.net','yogamaven.com',
                        'yuurok.com','z1p.biz','za.com','zehnminuten.de','zehnminutenmail.de',
                        'zippymail.info','zoemail.net','zomg.info',
                    ];
                    if (in_array($domain, $blocked, true)) {
                        $fail('Temporary or disposable email addresses are not allowed. Please use a permanent email address.');
                    }
                },
                // Fix 2: MX record check — only domains that explicitly accept email are allowed
                function ($attribute, $value, $fail) {
                    $domain = substr(strrchr($value, '@'), 1);
                    if ($domain && !checkdnsrr($domain, 'MX')) {
                        $fail('This email address cannot receive emails. Please use a valid email address (e.g. Gmail, Yahoo, Outlook).');
                    }
                },
                // Fix 2: Smart duplicate check — tell the user exactly why the email is taken
                function ($attribute, $value, $fail) {
                    $existing = User::where('email', strtolower($value))->first();
                    if (!$existing) return;
                    if ($existing->provider === 'google') {
                        $fail('This email is linked to a Google account. Please sign in with Google instead.');
                    } elseif ($existing->provider) {
                        $fail('This email is already registered via ' . ucfirst($existing->provider) . '. Please use that login method.');
                    } else {
                        $fail('This email is already registered. Please log in or use a different email.');
                    }
                },
            ],
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

        $emailSent = false;
        try {
            Log::info('Sending registration verification code', ['email' => $email]);
            Notification::route('mail', $email)
                ->notify(new PendingRegistrationVerification($verificationCode, $email, self::VERIFICATION_CODE_TTL_MINUTES));
            $emailSent = true;
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
        }

        return redirect()
            ->route('home')
            ->with('status', $emailSent ? 'verification-code-sent' : 'verification-code-send-failed')
            ->with('verification_email', $email);
    }

    public function cancelPendingRegistration(Request $request): JsonResponse
    {
        $request->session()->forget(self::PENDING_REGISTRATION_SESSION_KEY);

        return response()->json(['state' => 'cancelled']);
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
        $emailSent = false;
        try {
            Log::info('Resending registration verification code', ['email' => $resendEmail]);
            Notification::route('mail', $resendEmail)
                ->notify(new PendingRegistrationVerification($verificationCode, $resendEmail, self::VERIFICATION_CODE_TTL_MINUTES));
            $emailSent = true;
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
        }

        if ($request->expectsJson()) {
            if (! $emailSent) {
                return response()->json([
                    'state' => 'send_failed',
                    'message' => 'We could not send the verification email. Please try again shortly.',
                    'email' => $resendEmail,
                ], 503);
            }

            return response()->json([
                'state' => 'resent',
                'message' => 'A new verification code has been sent to your email.',
                'email' => $resendEmail,
            ]);
        }

        return redirect()
            ->route('home')
            ->with('status', $emailSent ? 'verification-code-resent' : 'verification-code-send-failed')
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
