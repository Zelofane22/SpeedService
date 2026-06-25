<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    // Pure token API — never redirect to a login page
    protected function redirectTo(Request $request): ?string
    {
        return null;
    }
}
