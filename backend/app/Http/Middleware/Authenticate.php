<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

/** API pure token Sanctum — pas de redirection vers une page de login web. */
class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        return null;
    }
}
