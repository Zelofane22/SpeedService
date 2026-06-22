<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(Auth::user());
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($request->filled('password')) {
            if (! Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Le mot de passe actuel est incorrect.',
                    'errors'  => ['current_password' => ['Le mot de passe actuel est incorrect.']],
                ], 422);
            }

            $user->password = $request->password;
        }

        $user->name  = $request->name;
        $user->phone = $request->phone;
        $user->save();

        return response()->json($user);
    }
}
