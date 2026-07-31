<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Profil utilisateur authentifié : consultation, mise à jour et changement de mot de passe.
 */
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

        // Changement de mot de passe optionnel lors de la mise à jour profil
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

    /** Changement de mot de passe dédié (ex. après reset admin avec must_change_password). */
    public function changePassword(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate([
            'current_password'      => ['required', 'string'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        /** @var User $user */
        $user = Auth::user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.',
                'errors'  => ['current_password' => ['Le mot de passe actuel est incorrect.']],
            ], 422);
        }

        $user->password             = $request->password;
        $user->must_change_password = false;
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }
}
