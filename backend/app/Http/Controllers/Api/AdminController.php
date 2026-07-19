<?php

namespace App\Http\Controllers\Api;

use App\Enums\DeliveryNotificationEvent;
use App\Enums\DeliveryStatus;
use App\Enums\DriverApplicationStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AdminActionLog;
use App\Models\Delivery;
use App\Models\DriverApplication;
use App\Models\Payment;
use App\Models\User;
use App\Services\DeliveryNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function __construct(private readonly DeliveryNotificationService $notifications) {}

    // ── Audit ─────────────────────────────────────────────────────────────────

    private function logAction(string $action, string $description, ?string $subjectType = null, ?string $subjectId = null): void
    {
        AdminActionLog::create([
            'admin_id'     => Auth::id(),
            'action'       => $action,
            'subject_type' => $subjectType,
            'subject_id'   => $subjectId,
            'description'  => $description,
        ]);
    }

    public function activityLog(Request $request): JsonResponse
    {
        $query = AdminActionLog::with('admin:id,name,email')->latest();

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        return response()->json($query->paginate(20));
    }

    private function percentChange(float $current, float $previous): ?float
    {
        // null quand la période précédente est vide : impossible de calculer
        // une variation, le front masque alors l'indicateur.
        if ($previous == 0.0) {
            return null;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }

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

        $byStatus = [];
        foreach (DeliveryStatus::cases() as $case) {
            $byStatus[$case->value] = (int) ($deliveryCounts[$case->value] ?? 0);
        }

        // Active deliveries (in-flight: confirmed → in_delivery)
        $activeStatuses = [
            DeliveryStatus::Confirmed->value,
            DeliveryStatus::Assigned->value,
            DeliveryStatus::PickingUp->value,
            DeliveryStatus::InDelivery->value,
        ];
        $activeCount = (int) array_sum(array_map(fn ($s) => $byStatus[$s] ?? 0, $activeStatuses));

        // Today's operational stats
        $todayDeliveries = (int) DB::table('deliveries')
            ->whereDate('created_at', today())
            ->count();

        $todayDelivered = (int) DB::table('deliveries')
            ->where('status', DeliveryStatus::Delivered->value)
            ->whereDate('updated_at', today())
            ->count();

        $todayCancelled = (int) DB::table('deliveries')
            ->where('status', DeliveryStatus::Cancelled->value)
            ->whereDate('updated_at', today())
            ->count();

        // Revenue aggregates
        $revenueTotal = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->sum('amount');

        $revenueThisMonth = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        $revenueToday = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->whereDate('created_at', today())
            ->sum('amount');

        $avgBasket = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->avg('amount') ?? 0;

        // Revenue breakdown by payment method
        $revenueByMethod = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->select('method', DB::raw('sum(amount) as total'), DB::raw('count(*) as count'))
            ->groupBy('method')
            ->get()
            ->mapWithKeys(fn ($r) => [$r->method => [
                'total_xof' => (float) $r->total,
                'count'     => (int) $r->count,
            ]]);

        // Completion rate (excluding draft/awaiting_payment)
        $totalEngaged = DB::table('deliveries')
            ->whereNotIn('status', [DeliveryStatus::Draft->value, DeliveryStatus::AwaitingPayment->value])
            ->count();
        $completionRate = $totalEngaged > 0
            ? round($byStatus[DeliveryStatus::Delivered->value] / $totalEngaged * 100, 1)
            : 0.0;

        $pendingValidations = $byStatus[DeliveryStatus::AwaitingValidation->value] ?? 0;

        // Variations vs période précédente (jour/mois) pour les KPI du dashboard
        $revenueYesterday = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->whereDate('created_at', today()->subDay())
            ->sum('amount');

        $lastMonth = now()->subMonthNoOverflow();

        $revenueLastMonth = DB::table('payments')
            ->where('status', PaymentStatus::Succeeded->value)
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->sum('amount');

        $deliveriesThisMonth = (int) DB::table('deliveries')
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        $deliveriesLastMonth = (int) DB::table('deliveries')
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->count();

        $newClientsThisMonth = (int) DB::table('users')
            ->where('role', UserRole::Client->value)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        $newClientsLastMonth = (int) DB::table('users')
            ->where('role', UserRole::Client->value)
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->count();

        return response()->json([
            'users' => [
                'total'   => (int) $userCounts->sum(),
                'clients' => (int) ($userCounts[UserRole::Client->value] ?? 0),
                'drivers' => (int) ($userCounts[UserRole::Driver->value] ?? 0),
            ],
            'deliveries' => [
                'total'        => (int) $deliveryCounts->sum(),
                'by_status'    => $byStatus,
                'active_count' => $activeCount,
                'today'        => [
                    'total'     => $todayDeliveries,
                    'delivered' => $todayDelivered,
                    'cancelled' => $todayCancelled,
                ],
            ],
            'revenue' => [
                'total_xof'      => (float) $revenueTotal,
                'this_month_xof' => (float) $revenueThisMonth,
                'today_xof'      => (float) $revenueToday,
                'avg_basket_xof' => (float) round($avgBasket, 2),
                'by_method'      => $revenueByMethod,
            ],
            'pending_validations' => $pendingValidations,
            'completion_rate'     => (float) $completionRate,
            'trends' => [
                'revenue_today_pct'     => $this->percentChange((float) $revenueToday, (float) $revenueYesterday),
                'revenue_month_pct'     => $this->percentChange((float) $revenueThisMonth, (float) $revenueLastMonth),
                'deliveries_month'      => $deliveriesThisMonth,
                'deliveries_month_pct'  => $this->percentChange($deliveriesThisMonth, $deliveriesLastMonth),
                'new_clients_month'     => $newClientsThisMonth,
                'new_clients_month_pct' => $this->percentChange($newClientsThisMonth, $newClientsLastMonth),
            ],
        ], 200, [], JSON_PRESERVE_ZERO_FRACTION);
    }

    // ── Alertes backoffice ────────────────────────────────────────────────────

    public function alerts(): JsonResponse
    {
        $alerts = [];

        $pendingValidations = Delivery::where('status', DeliveryStatus::AwaitingValidation)->count();
        if ($pendingValidations > 0) {
            $alerts[] = [
                'id'       => 'pending-payment-validations',
                'severity' => 'warning',
                'kind'     => 'Paiements',
                'title'    => 'Paiements à valider manuellement',
                'message'  => "{$pendingValidations} livraison(s) en attente de validation d'un paiement (espèces ou agence).",
                'count'    => $pendingValidations,
                'action'   => '/payments',
            ];
        }

        $failedPayments = Payment::where('status', PaymentStatus::Failed)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
        if ($failedPayments > 0) {
            $alerts[] = [
                'id'       => 'failed-payments',
                'severity' => 'error',
                'kind'     => 'Paiements',
                'title'    => 'Paiements échoués (7 derniers jours)',
                'message'  => "{$failedPayments} paiement(s) en échec sur les 7 derniers jours — vérifier les transactions concernées.",
                'count'    => $failedPayments,
                'action'   => '/payments?status=failed',
            ];
        }

        $unassigned = Delivery::where('status', DeliveryStatus::Confirmed)
            ->whereNull('driver_id')
            ->where('updated_at', '<=', now()->subHours(2))
            ->count();
        if ($unassigned > 0) {
            $alerts[] = [
                'id'       => 'unassigned-deliveries',
                'severity' => 'warning',
                'kind'     => 'Livraisons',
                'title'    => 'Livraisons confirmées sans livreur',
                'message'  => "{$unassigned} livraison(s) confirmée(s) depuis plus de 2 heures sans livreur assigné.",
                'count'    => $unassigned,
                'action'   => '/orders?status=confirmed',
            ];
        }

        $stuck = Delivery::whereIn('status', [DeliveryStatus::PickingUp, DeliveryStatus::InDelivery])
            ->where('updated_at', '<=', now()->subDay())
            ->count();
        if ($stuck > 0) {
            $alerts[] = [
                'id'       => 'stuck-deliveries',
                'severity' => 'error',
                'kind'     => 'Livraisons',
                'title'    => 'Livraisons bloquées en cours',
                'message'  => "{$stuck} livraison(s) en collecte ou en livraison sans mise à jour depuis plus de 24 heures.",
                'count'    => $stuck,
                'action'   => '/orders',
            ];
        }

        $pendingApplications = DriverApplication::whereIn('status', [
            DriverApplicationStatus::Pending,
            DriverApplicationStatus::UnderReview,
        ])->count();
        if ($pendingApplications > 0) {
            $alerts[] = [
                'id'       => 'pending-driver-applications',
                'severity' => 'info',
                'kind'     => 'Candidatures',
                'title'    => 'Candidatures livreur à examiner',
                'message'  => "{$pendingApplications} candidature(s) livreur en attente d'examen.",
                'count'    => $pendingApplications,
                'action'   => '/driver-applications',
            ];
        }

        return response()->json([
            'alerts' => $alerts,
            'total'  => array_sum(array_column($alerts, 'count')),
        ]);
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    public function listUsers(Request $request): JsonResponse
    {
        $query = User::select(['id', 'name', 'email', 'role', 'is_super_admin', 'created_at'])
            ->withCount(['deliveriesAsClient as deliveries_count']);

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

    public function resetUserPassword(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::findOrFail($id);

        if ($user->is_super_admin && $user->id !== Auth::id()) {
            return response()->json([
                'message' => "Impossible de réinitialiser le mot de passe d'un autre super administrateur.",
            ], 403);
        }

        $user->update([
            'password'             => $request->input('password'),
            'must_change_password' => true,
        ]);
        // Révoque toutes les sessions existantes de l'utilisateur.
        $user->tokens()->delete();

        $this->logAction(
            'user.password_reset',
            "Mot de passe de {$user->name} réinitialisé manuellement.",
            'user',
            $user->id,
        );

        return response()->json(['message' => 'Mot de passe réinitialisé.']);
    }

    public function deleteUser(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 422);
        }

        if ($user->is_super_admin) {
            return response()->json([
                'message' => 'Impossible de supprimer un super administrateur.',
            ], 403);
        }

        $name = $user->name;
        $user->tokens()->delete();
        $user->delete();

        $this->logAction(
            'user.deleted',
            "Utilisateur {$name} supprimé.",
            'user',
            $id,
        );

        return response()->json(null, 204);
    }

    // ── Deliveries ────────────────────────────────────────────────────────────

    public function listDeliveries(Request $request): JsonResponse
    {
        $query = Delivery::with([
            'client:id,name',
            'driver:id,name',
        ])->select([
            'id', 'reference', 'client_id', 'driver_id',
            'status', 'price', 'pickup_address', 'delivery_address', 'created_at',
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

        $deliveries->getCollection()->transform(function (Delivery $delivery) {
            $delivery->from_address = $delivery->pickup_address;
            $delivery->to_address = $delivery->delivery_address;
            $delivery->amount_xof = (float) $delivery->price;

            return $delivery;
        });

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

        $event = match ($newStatus) {
            DeliveryStatus::Confirmed          => DeliveryNotificationEvent::OrderConfirmed,
            DeliveryStatus::Assigned           => DeliveryNotificationEvent::DriverAssigned,
            DeliveryStatus::InDelivery         => DeliveryNotificationEvent::PackagePickedUp,
            DeliveryStatus::Delivered          => DeliveryNotificationEvent::PackageDelivered,
            DeliveryStatus::AwaitingValidation => DeliveryNotificationEvent::AwaitingValidation,
            DeliveryStatus::Cancelled          => DeliveryNotificationEvent::OrderCancelled,
            default                            => null,
        };

        if ($event !== null) {
            $this->notifications->send($delivery->fresh(['client', 'driver']), $event);
        }

        $this->logAction(
            'delivery.status_updated',
            "Statut de la livraison {$delivery->reference} forcé à {$newStatus->value}.",
            'delivery',
            $delivery->id,
        );

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

        $this->notifications->send($delivery->fresh(['client', 'driver']), DeliveryNotificationEvent::OrderConfirmed);

        $this->logAction(
            'payment.validated',
            "Paiement de la livraison {$delivery->reference} validé manuellement.",
            'delivery',
            $delivery->id,
        );

        return response()->json($delivery->load(['payment', 'statusHistories']));
    }

    // ── Payments ─────────────────────────────────────────────────────────────

    public function listPayments(Request $request): JsonResponse
    {
        $query = Payment::with([
            'delivery:id,reference,client_id',
            'delivery.client:id,name',
        ])->select([
            'id', 'delivery_id', 'amount', 'method', 'status',
            'transaction_reference', 'created_at', 'validated_at',
        ]);

        if ($request->filled('status')) {
            $status = match ($request->input('status')) {
                'success', 'succeeded' => PaymentStatus::Succeeded,
                'pending' => PaymentStatus::Pending,
                'failed' => PaymentStatus::Failed,
                default => null,
            };

            if ($status !== null) {
                $query->where('status', $status);
            }
        }

        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', $search)
                    ->orWhere('transaction_reference', 'like', $search)
                    ->orWhereHas('delivery', fn ($dq) => $dq->where('reference', 'like', $search))
                    ->orWhereHas('delivery.client', fn ($cq) => $cq->where('name', 'like', $search));
            });
        }

        $payments = $query->latest()->paginate(20);

        $payments->getCollection()->transform(function (Payment $payment) {
            return [
                'id' => $payment->id,
                'delivery_id' => $payment->delivery_id,
                'reference' => $payment->transaction_reference
                    ?? 'PAY-' . strtoupper(substr(str_replace('-', '', $payment->id), 0, 8)),
                'delivery_reference' => $payment->delivery?->reference,
                'client_name' => $payment->delivery?->client?->name,
                'method' => $payment->method->value,
                'amount_xof' => (float) $payment->amount,
                'date' => ($payment->validated_at ?? $payment->created_at)?->toISOString(),
                'status' => $payment->status === PaymentStatus::Succeeded
                    ? 'success'
                    : $payment->status->value,
            ];
        });

        return response()->json($payments);
    }

    // ── Drivers ───────────────────────────────────────────────────────────────

    public function listDrivers(Request $request): JsonResponse
    {
        $query = User::where('role', UserRole::Driver)
            ->select(['id', 'name', 'email', 'is_active', 'created_at'])
            ->withCount([
                'deliveriesAsDriver as deliveries_completed' => fn ($q) => $q->where('status', DeliveryStatus::Delivered),
            ]);

        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                    ->orWhere('email', 'like', $search)
                    ->orWhere('phone', 'like', $search);
            });
        }

        $drivers = $query->latest()->paginate(20);

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

        $this->logAction(
            'driver.status_toggled',
            "Livreur {$driver->name} " . ($driver->is_active ? 'réactivé' : 'désactivé') . '.',
            'user',
            $driver->id,
        );

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

        // Top 5 livreurs (livraisons terminées + CA encaissé associé)
        $topDrivers = DB::table('deliveries')
            ->join('users', 'users.id', '=', 'deliveries.driver_id')
            ->leftJoin('payments', function ($join) {
                $join->on('payments.delivery_id', '=', 'deliveries.id')
                    ->where('payments.status', PaymentStatus::Succeeded->value);
            })
            ->where('deliveries.status', DeliveryStatus::Delivered->value)
            ->select(
                'users.name',
                'users.email',
                DB::raw('count(deliveries.id) as count'),
                DB::raw('coalesce(sum(payments.amount), 0) as total_xof')
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

        // Répartition des livraisons par type de colis
        $byPackageType = DB::table('deliveries')
            ->select('package_type', DB::raw('count(*) as count'))
            ->groupBy('package_type')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'package_type' => $row->package_type,
                'count'        => (int) $row->count,
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
            'revenue_by_month'           => $revenueByMonth,
            'deliveries_by_month'        => $deliveriesByMonth,
            'top_clients'                => $topClients,
            'top_drivers'                => $topDrivers,
            'deliveries_by_package_type' => $byPackageType,
            'delivery_completion_rate'   => (float) $completionRate,
        ], 200, [], JSON_PRESERVE_ZERO_FRACTION);
    }
}
