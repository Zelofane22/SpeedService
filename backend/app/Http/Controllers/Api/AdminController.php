<?php

namespace App\Http\Controllers\Api;

use App\Enums\DeliveryStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    // ── Stats ─────────────────────────────────────────────────────────────────

    public function stats(): JsonResponse
    {
        $userCounts = DB::table('users')
            ->select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role');

        $deliveryCounts = DB::table('deliveries')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $revenueTotal = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->sum('amount');

        $revenueThisMonth = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        $pendingValidations = DB::table('deliveries')
            ->where('status', DeliveryStatus::AwaitingValidation->value)
            ->count();

        $byStatus = [];
        foreach (DeliveryStatus::cases() as $case) {
            $byStatus[$case->value] = (int) ($deliveryCounts[$case->value] ?? 0);
        }

        return response()->json([
            'users' => [
                'total'   => (int) $userCounts->sum(),
                'clients' => (int) ($userCounts[UserRole::Client->value] ?? 0),
                'drivers' => (int) ($userCounts[UserRole::Driver->value] ?? 0),
            ],
            'deliveries' => [
                'total'     => (int) $deliveryCounts->sum(),
                'by_status' => $byStatus,
            ],
            'revenue' => [
                'total_xof'      => (float) $revenueTotal,
                'this_month_xof' => (float) $revenueThisMonth,
            ],
            'pending_validations' => $pendingValidations,
        ]);
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    public function listUsers(Request $request): JsonResponse
    {
        $query = User::withCount(['deliveriesAsClient as deliveries_count'])
            ->select(['id', 'name', 'email', 'role', 'created_at']);

        if ($request->filled('role')) {
            $role = UserRole::tryFrom($request->input('role'));
            if ($role !== null) {
                $query->where('role', $role);
            }
        }

        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('email', 'like', $search);
            });
        }

        $users = $query->latest()->paginate(15);

        return response()->json($users);
    }

    public function showUser(string $id): JsonResponse
    {
        $user = User::select(['id', 'name', 'email', 'phone', 'role', 'created_at'])
            ->with([
                'deliveriesAsClient' => fn ($q) => $q
                    ->select(['id', 'reference', 'status', 'price', 'created_at', 'client_id'])
                    ->latest()
                    ->limit(10),
            ])
            ->findOrFail($id);

        return response()->json($user);
    }

    public function updateUserRole(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'role' => ['required', Rule::in(array_column(UserRole::cases(), 'value'))],
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => UserRole::from($request->input('role'))]);

        return response()->json($user->only(['id', 'name', 'email', 'role', 'created_at']));
    }

    // ── Deliveries ────────────────────────────────────────────────────────────

    public function listDeliveries(Request $request): JsonResponse
    {
        $query = Delivery::with([
            'client:id,name',
            'driver:id,name',
        ])->select([
            'id', 'reference', 'client_id', 'driver_id',
            'status', 'price', 'created_at',
        ]);

        if ($request->filled('status')) {
            $status = DeliveryStatus::tryFrom($request->input('status'));
            if ($status !== null) {
                $query->where('status', $status);
            }
        }

        if ($request->filled('payment_method')) {
            $method = PaymentMethod::tryFrom($request->input('payment_method'));
            if ($method !== null) {
                $query->whereHas('payment', fn ($q) => $q->where('method', $method));
            }
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', '%' . $search . '%')
                  ->orWhere('reference', 'like', '%' . $search . '%')
                  ->orWhereHas('client', fn ($cq) => $cq->where('name', 'like', '%' . $search . '%'));
            });
        }

        $deliveries = $query->latest()->paginate(20);

        return response()->json($deliveries);
    }

    public function showDelivery(string $id): JsonResponse
    {
        $delivery = Delivery::with([
            'client:id,name,email,phone',
            'driver:id,name,email,phone',
            'statusHistories',
            'payment',
        ])->findOrFail($id);

        return response()->json($delivery);
    }

    public function updateDeliveryStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(array_column(DeliveryStatus::cases(), 'value'))],
            'note'   => ['nullable', 'string', 'max:500'],
        ]);

        $delivery = Delivery::findOrFail($id);
        $newStatus = DeliveryStatus::from($request->input('status'));

        $delivery->update(['status' => $newStatus]);

        $delivery->statusHistories()->create([
            'status' => $newStatus,
            'note'   => $request->input('note', 'Statut mis à jour par un administrateur.'),
        ]);

        return response()->json($delivery->load('statusHistories'));
    }

    public function validatePayment(string $id): JsonResponse
    {
        $delivery = Delivery::with('payment')->findOrFail($id);

        if ($delivery->status !== DeliveryStatus::AwaitingValidation) {
            return response()->json([
                'message' => 'Cette livraison n\'est pas en attente de validation.',
            ], 422);
        }

        $delivery->update(['status' => DeliveryStatus::Confirmed]);

        $delivery->statusHistories()->create([
            'status' => DeliveryStatus::Confirmed,
            'note'   => 'Paiement validé par un administrateur.',
        ]);

        if ($delivery->payment) {
            $delivery->payment->update([
                'status'       => PaymentStatus::Succeeded,
                'validated_by' => Auth::id(),
                'validated_at' => now(),
            ]);
        }

        return response()->json($delivery->load(['payment', 'statusHistories']));
    }

    // ── Drivers ───────────────────────────────────────────────────────────────

    public function listDrivers(Request $request): JsonResponse
    {
        $query = User::where('role', UserRole::Driver)
            ->withCount([
                'deliveriesAsDriver as deliveries_completed' => fn ($q) => $q->where('status', DeliveryStatus::Delivered),
            ])
            ->select(['id', 'name', 'email', 'created_at']);

        // The users table has no `is_active` column, so we filter/expose a virtual value.
        // For forward compatibility we include it in the response as always true for now.

        $drivers = $query->latest()->paginate(20);

        // Append is_active (virtual — always true until a column is added)
        $drivers->getCollection()->transform(function ($driver) {
            $driver->is_active = true;
            return $driver;
        });

        return response()->json($drivers);
    }

    public function toggleDriverStatus(string $id): JsonResponse
    {
        $driver = User::where('role', UserRole::Driver)->findOrFail($id);

        // If the column doesn't exist we return a graceful response
        if (!array_key_exists('is_active', $driver->getAttributes())) {
            return response()->json([
                'message' => 'La colonne is_active n\'existe pas encore. Migration requise.',
            ], 501);
        }

        $driver->update(['is_active' => !$driver->is_active]);

        return response()->json(array_merge(
            $driver->only(['id', 'name', 'email', 'created_at']),
            ['is_active' => $driver->is_active],
        ));
    }

    // ── Reports ───────────────────────────────────────────────────────────────

    private function monthExpr(): string
    {
        return match (DB::getDriverName()) {
            'pgsql'  => "to_char(created_at, 'YYYY-MM')",
            default  => "strftime('%Y-%m', created_at)",
        };
    }

    public function reports(): JsonResponse
    {
        $monthExpr = $this->monthExpr();

        // Revenue by month (last 6 months)
        $revenueByMonth = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->select(
                DB::raw("{$monthExpr} as month"),
                DB::raw('sum(amount) as total_xof')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => ['month' => $row->month, 'total_xof' => (float) $row->total_xof]);

        // Deliveries by month (last 6 months)
        $deliveriesByMonth = DB::table('deliveries')
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->select(
                DB::raw("{$monthExpr} as month"),
                DB::raw('count(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => ['month' => $row->month, 'count' => (int) $row->count]);

        // Top 5 clients
        $topClients = DB::table('deliveries')
            ->join('users', 'users.id', '=', 'deliveries.client_id')
            ->join('payments', 'payments.delivery_id', '=', 'deliveries.id')
            ->where('payments.status', PaymentStatus::Succeeded->value)
            ->select(
                'users.name',
                'users.email',
                DB::raw('count(deliveries.id) as count'),
                DB::raw('sum(payments.amount) as total_xof')
            )
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name'      => $row->name,
                'email'     => $row->email,
                'count'     => (int) $row->count,
                'total_xof' => (float) $row->total_xof,
            ]);

        // Delivery completion rate
        $totalDeliveries = DB::table('deliveries')
            ->whereNotIn('status', [DeliveryStatus::Draft->value, DeliveryStatus::AwaitingPayment->value])
            ->count();

        $deliveredCount = DB::table('deliveries')
            ->where('status', DeliveryStatus::Delivered->value)
            ->count();

        $completionRate = $totalDeliveries > 0
            ? round($deliveredCount / $totalDeliveries * 100, 2)
            : 0.0;

        return response()->json([
            'revenue_by_month'        => $revenueByMonth,
            'deliveries_by_month'     => $deliveriesByMonth,
            'top_clients'             => $topClients,
            'delivery_completion_rate' => $completionRate,
        ]);
    }
}
