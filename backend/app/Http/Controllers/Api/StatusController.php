<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/** Health check API — utilisé par Railway, CI et monitoring. */
class StatusController extends Controller
{
    public function check(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }
}
