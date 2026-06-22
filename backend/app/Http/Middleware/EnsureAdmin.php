<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== UserRole::Admin) {
            return response()->json(['message' => 'Accès réservé aux administrateurs.'], 403);
        }

        return $next($request);
    }
}
