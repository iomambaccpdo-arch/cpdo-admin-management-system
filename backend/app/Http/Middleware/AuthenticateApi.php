<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApi
{
    public function handle(Request $request, Closure $next): Response
    {
        $plain = $request->bearerToken();

        if (! $plain) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $token = ApiToken::query()
            ->where('token', hash('sha256', $plain))
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        if (! $token || ! $token->user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $request->setUserResolver(fn () => $token->user);
        auth()->setUser($token->user);
        $request->attributes->set('api_token', $token);

        return $next($request);
    }
}
