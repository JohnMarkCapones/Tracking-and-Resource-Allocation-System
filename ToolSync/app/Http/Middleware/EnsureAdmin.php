<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            // API / JSON requests: return JSON 403
            if ($request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
                return response()->json([
                    'message' => 'Only administrators can perform this action.',
                ], 403);
            }
            // Web (Inertia) requests: redirect to dashboard with message
            return redirect()->route('dashboard')->with('error', 'Access denied. Administrator only.');
        }

        return $next($request);
    }
}
