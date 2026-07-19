<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * Espace super administrateur — gestion des autres administrateurs
 * (privilege & access management). Toutes les routes de ce contrôleur sont
 * protégées par le middleware `superadmin` : seul un super administrateur peut
 * lister, créer, promouvoir/rétrograder ou révoquer un administrateur.
 */
class AdminManagementController extends Controller
{
    use LogsAdminActions;

    /**
     * Liste les comptes administrateurs. Les super administrateurs remontent en
     * premier, puis tri par date de création décroissante.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', UserRole::Admin)
            ->select(['id', 'name', 'email', 'phone', 'is_super_admin', 'must_change_password', 'created_at']);

        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                    ->orWhere('email', 'like', $search);
            });
        }

        $admins = $query
            ->orderByDesc('is_super_admin')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($admins);
    }

    /**
     * Crée un nouvel administrateur. Le mot de passe initial est fourni par le
     * super administrateur ; le nouvel admin devra le changer à sa première
     * connexion (`must_change_password`).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'phone'          => ['nullable', 'string', 'max:30'],
            'password'       => ['required', 'string', 'min:8'],
            'is_super_admin' => ['sometimes', 'boolean'],
        ]);

        $admin = User::create([
            'name'                 => $validated['name'],
            'email'                => $validated['email'],
            'phone'                => $validated['phone'] ?? null,
            'password'             => $validated['password'],
            'role'                 => UserRole::Admin,
            'is_super_admin'       => (bool) ($validated['is_super_admin'] ?? false),
            'must_change_password' => true,
        ]);

        $this->logAction(
            'admin.created',
            sprintf(
                'Administrateur %s (%s) créé%s.',
                $admin->name,
                $admin->email,
                $admin->is_super_admin ? ' avec le privilège super administrateur' : '',
            ),
            'user',
            $admin->id,
        );

        return response()->json(
            $admin->only(['id', 'name', 'email', 'phone', 'is_super_admin', 'must_change_password', 'created_at']),
            201,
        );
    }

    /**
     * Accorde ou retire le privilège super administrateur à un administrateur.
     * Un super administrateur ne peut pas modifier son propre privilège, et on
     * refuse de retirer le dernier super administrateur (sécurité : éviter le
     * verrouillage total de l'espace privilégié).
     */
    public function toggleSuper(string $id): JsonResponse
    {
        $admin = User::where('role', UserRole::Admin)->findOrFail($id);

        if ($admin->id === Auth::id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas modifier votre propre privilège super administrateur.',
            ], 422);
        }

        $granting = ! $admin->is_super_admin;

        if (! $granting && $this->superAdminCount() <= 1) {
            return response()->json([
                'message' => 'Impossible de retirer le dernier super administrateur.',
            ], 422);
        }

        $admin->update(['is_super_admin' => $granting]);

        $this->logAction(
            $granting ? 'admin.super_granted' : 'admin.super_revoked',
            sprintf(
                'Privilège super administrateur %s %s.',
                $granting ? 'accordé à' : 'retiré à',
                $admin->name,
            ),
            'user',
            $admin->id,
        );

        return response()->json(
            $admin->only(['id', 'name', 'email', 'phone', 'is_super_admin', 'created_at']),
        );
    }

    /**
     * Révoque l'accès administrateur : le compte est rétrogradé au rôle client
     * et toutes ses sessions sont invalidées. On refuse la révocation de soi-même
     * et celle d'un super administrateur (retirer d'abord son privilège).
     */
    public function revoke(string $id): JsonResponse
    {
        $admin = User::where('role', UserRole::Admin)->findOrFail($id);

        if ($admin->id === Auth::id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas révoquer votre propre accès administrateur.',
            ], 422);
        }

        if ($admin->is_super_admin) {
            return response()->json([
                'message' => "Retirez d'abord le privilège super administrateur avant de révoquer l'accès.",
            ], 422);
        }

        $name = $admin->name;
        $admin->update(['role' => UserRole::Client]);
        $admin->tokens()->delete();

        $this->logAction(
            'admin.revoked',
            "Accès administrateur de {$name} révoqué (rétrogradé au rôle client).",
            'user',
            $admin->id,
        );

        return response()->json(
            $admin->only(['id', 'name', 'email', 'role', 'created_at']),
        );
    }

    private function superAdminCount(): int
    {
        return User::where('role', UserRole::Admin)
            ->where('is_super_admin', true)
            ->count();
    }
}
