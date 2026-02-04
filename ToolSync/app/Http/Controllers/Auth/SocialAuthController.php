<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

class SocialAuthController extends Controller
{
    /** @var list<string> */
    private const PROVIDERS = ['google', 'github'];

    public function redirect(string $provider): SymfonyRedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS), 404);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, self::PROVIDERS), 404);

        $socialUser = Socialite::driver($provider)->user();

        $user = User::query()
            ->where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (! $user) {
            $user = User::query()
                ->where('email', $socialUser->getEmail())
                ->first();

            if ($user) {
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ]);
            } else {
                $user = User::query()->create([
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ]);

                $user->markEmailAsVerified();
            }
        } else {
            $user->update([
                'avatar' => $socialUser->getAvatar(),
            ]);
        }

        Auth::login($user, remember: true);

        return redirect()->intended('/dashboard');
    }
}
