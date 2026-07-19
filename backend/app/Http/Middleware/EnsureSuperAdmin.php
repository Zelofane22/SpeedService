<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->role !== UserRole::Admin || ! $user->is_super_admin) {
            return response()->json(['message' => 'Accès réservé au super administrateur.'], 403);
        }

        return $next($request);
    }
}
