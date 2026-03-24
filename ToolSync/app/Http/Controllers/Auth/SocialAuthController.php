<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class SocialAuthController extends Controller
{
    /** @var list<string> */
    private const PROVIDERS = ['google', 'github', 'facebook'];

    public function redirect(string $provider): SymfonyRedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS), 404);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS), 404);

        // Error 1: InvalidStateException — session state mismatch (back button, direct URL, cookie issue)
        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (InvalidStateException $e) {
            Log::warning("Socialite InvalidStateException for provider [{$provider}]", ['message' => $e->getMessage()]);

            return redirect()->route('register')
                ->withErrors(['email' => 'Sign-in was cancelled or expired. Please try again.']);
        } catch (\Throwable $e) {
            Log::error("Socialite callback error for provider [{$provider}]", ['message' => $e->getMessage()]);

            return redirect()->route('register')
                ->withErrors(['email' => 'Something went wrong during sign-in. Please try again.']);
        }

        // Error 2: email can be null (some accounts don't share it)
        $email = $socialUser->getEmail();
        if (! $email) {
            return redirect()->route('register')
                ->withErrors(['email' => 'Your ' . ucfirst($provider) . ' account did not share an email address. Please register manually.']);
        }

        // Error 4: name can be null
        $name = $socialUser->getName() ?? $socialUser->getNickname() ?? 'User';

        // Error 5: avatar URL can exceed 255 chars — truncate safely
        $avatar = $socialUser->getAvatar();
        if ($avatar && strlen($avatar) > 255) {
            $avatar = null;
        }

        $user = User::query()
            ->where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (! $user) {
            $user = User::query()
                ->where('email', $email)
                ->first();

            if ($user) {
                // Error 3: existing unverified user — mark email verified when linking OAuth
                $user->update([
                    'provider'    => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar'      => $avatar,
                ]);

                if (! $user->hasVerifiedEmail()) {
                    $user->markEmailAsVerified();
                }
            } else {
                $user = User::query()->create([
                    'name'        => $name,
                    'email'       => $email,
                    'provider'    => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar'      => $avatar,
                ]);

                $user->markEmailAsVerified();
            }
        } else {
            $user->update([
                'avatar' => $avatar,
            ]);
        }

        Auth::login($user, remember: true);

        return redirect()->intended('/dashboard');
    }
}
