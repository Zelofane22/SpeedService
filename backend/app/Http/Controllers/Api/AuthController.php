<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

/**
 * Authentification Sanctum : inscription client, login (email ou téléphone),
 * déconnexion et réinitialisation de mot de passe (client ou driver via reset_url).
 */
class AuthController extends Controller
{
    // ── Inscription et session ──────────────────────────────────────────────────

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => $request->password,
            'role'     => UserRole::Client,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $identifier = trim($request->identifier);

        if (str_contains($identifier, '@')) {
            $user = User::where('email', $identifier)->first();
        } else {
            // Les numéros existants peuvent être stockés avec des séparateurs :
            // on compare les deux côtés sans espaces, tirets ni points.
            $phone = preg_replace('/[\s.\-]/', '', $identifier);
            $user  = User::whereRaw(
                "replace(replace(replace(phone, ' ', ''), '-', ''), '.', '') = ?",
                [$phone],
            )->first();
        }

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function logout(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $user->currentAccessToken()->delete();

        return response()->json(null, 204);
    }

    // ── Réinitialisation mot de passe ───────────────────────────────────────────

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $broker = Password::broker();
        $user = $broker->getUser($request->only('email'));

        if ($user) {
            $token = $broker->createToken($user);
            $user->notify(new ResetPasswordNotification($token, $this->allowedResetUrl($request->input('reset_url'))));
        }

        // Message identique que l'email existe ou non (anti-énumération)
        return response()->json([
            'message' => 'Si un compte correspond à cette adresse, vous recevrez un lien de réinitialisation.',
        ]);
    }

    /** Vérifie que reset_url provient de FRONTEND_URL ou DRIVER_URL autorisés. */
    private function allowedResetUrl(?string $requestedUrl): ?string
    {
        if (! $requestedUrl) {
            return null;
        }

        $allowedOrigins = array_filter([
            config('app.frontend_url'),
            config('app.driver_url'),
        ]);

        $requestedOrigin = $this->origin($requestedUrl);

        foreach ($allowedOrigins as $allowedOrigin) {
            if ($requestedOrigin === $this->origin($allowedOrigin)) {
                return rtrim($requestedUrl, '/');
            }
        }

        return null;
    }

    private function origin(string $url): ?string
    {
        $parts = parse_url($url);

        if (! isset($parts['scheme'], $parts['host'])) {
            return null;
        }

        $port = isset($parts['port']) ? ':' . $parts['port'] : '';

        return strtolower($parts['scheme'] . '://' . $parts['host'] . $port);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->password = $password;
                $user->save();
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Ce lien de réinitialisation est invalide ou a expiré.',
            ], 422);
        }

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }
}
