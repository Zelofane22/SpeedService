<?php

namespace App\Http\Controllers\Api;

use App\Enums\DeliveryNotificationEvent;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\DriverApplication;
use App\Services\DeliveryNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DriverController extends Controller
{
    public function __construct(private readonly DeliveryNotificationService $notifications) {}

    private function ensureDriver(): ?JsonResponse
    {
        if (Auth::user()->role !== UserRole::Driver) {
            return response()->json(['message' => 'Accès réservé aux livreurs.'], 403);
        }
        return null;
    }

    public function availableMissions(): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        if (! Auth::user()->is_online) {
            return response()->json([]);
        }

        $missions = Delivery::whereNull('driver_id')
            ->where(function ($q) {
                $q->where('status', DeliveryStatus::Confirmed)
                  ->orWhere(function ($q2) {
                      // Cash-on-delivery and agency orders pending admin validation
                      // are immediately visible to drivers since payment is collected on delivery
                      $q2->where('status', DeliveryStatus::AwaitingValidation)
                         ->whereHas('payment', fn ($p) => $p->whereIn('method', [
                             PaymentMethod::CashOnDelivery->value,
                             PaymentMethod::Agency->value,
                         ]));
                  });
            })
            ->with('client:id,name,phone')
            ->latest()
            ->get();

        return response()->json($missions);
    }

    public function profile(): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        $user = Auth::user();
        $application = DriverApplication::where('user_id', $user->id)
            ->latest()
            ->first();

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'phone', 'role', 'is_active', 'is_online']),
            'application' => $application?->only([
                'city',
                'vehicle_type',
                'vehicle_brand',
                'vehicle_plate',
                'payment_method',
                'payment_number',
                'bank_name',
                'bank_iban',
                'status',
            ]),
        ]);
    }

    public function updateAvailability(Request $request): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        $data = $request->validate([
            'is_online' => ['required', 'boolean'],
        ]);

        $user = Auth::user();
        $user->forceFill(['is_online' => $data['is_online']])->save();

        return response()->json([
            'id' => $user->id,
            'is_online' => $user->is_online,
        ]);
    }

    public function myMissions(): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        $missions = Delivery::where('driver_id', Auth::id())
            ->with([
                'client:id,name,phone',
                'payment:id,delivery_id,method,status',
                'statusHistories' => fn ($q) => $q->orderBy('created_at'),
            ])
            ->latest()
            ->get();

        return response()->json($missions);
    }

    public function confirmPayment(Request $request, string $id): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        $request->validate([
            'confirmation' => ['required', 'string', 'in:PAIEMENTRECU'],
        ]);

        $delivery = Delivery::where('driver_id', Auth::id())
            ->where('status', DeliveryStatus::PickingUp)
            ->with('payment')
            ->findOrFail($id);

        $cashMethods = [PaymentMethod::CashOnDelivery->value, PaymentMethod::Agency->value];

        if (!$delivery->payment || !in_array($delivery->payment->method->value, $cashMethods)) {
            return response()->json(['message' => 'Confirmation de paiement non applicable pour ce mode de paiement.'], 422);
        }

        if ($delivery->payment->status === PaymentStatus::Succeeded) {
            return response()->json(['message' => 'Paiement déjà confirmé.'], 422);
        }

        $delivery->payment->update([
            'status'       => PaymentStatus::Succeeded,
            'validated_by' => Auth::id(),
            'validated_at' => now(),
        ]);

        $delivery->update(['status' => DeliveryStatus::InDelivery]);
        $delivery->statusHistories()->create([
            'status' => DeliveryStatus::InDelivery,
            'note'   => 'Paiement encaissé et confirmé par le livreur.',
        ]);

        try {
            $this->notifications->send(
                $delivery->fresh(['client', 'driver']),
                DeliveryNotificationEvent::PackagePickedUp,
            );
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json($delivery->load('client:id,name,phone', 'payment', 'statusHistories'));
    }

    public function acceptMission(string $id): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        if (! Auth::user()->is_online) {
            return response()->json(['message' => 'Passez en ligne pour accepter une mission.'], 422);
        }

        $delivery = Delivery::whereNull('driver_id')
            ->where(function ($q) {
                $q->where('status', DeliveryStatus::Confirmed)
                  ->orWhere(function ($q2) {
                      $q2->where('status', DeliveryStatus::AwaitingValidation)
                         ->whereHas('payment', fn ($p) => $p->whereIn('method', [
                             PaymentMethod::CashOnDelivery->value,
                             PaymentMethod::Agency->value,
                         ]));
                  });
            })
            ->findOrFail($id);

        $delivery->update([
            'status'    => DeliveryStatus::Assigned,
            'driver_id' => Auth::id(),
        ]);

        $delivery->statusHistories()->create([
            'status' => DeliveryStatus::Assigned,
        ]);

        try {
            $this->notifications->send(
                $delivery->fresh(['client', 'driver']),
                DeliveryNotificationEvent::DriverAssigned,
            );
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json($delivery->load('client:id,name,phone', 'statusHistories'));
    }

    public function declineMission(string $id): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        Delivery::where('status', DeliveryStatus::Confirmed)
            ->whereNull('driver_id')
            ->findOrFail($id);

        return response()->json(['message' => 'Mission refusée.']);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        $request->validate(['status' => 'required|string']);

        $delivery = Delivery::where('driver_id', Auth::id())
            ->with('payment')
            ->findOrFail($id);

        $transitions = [
            DeliveryStatus::Assigned->value   => DeliveryStatus::PickingUp,
            DeliveryStatus::PickingUp->value   => DeliveryStatus::InDelivery,
            DeliveryStatus::InDelivery->value  => DeliveryStatus::Delivered,
        ];

        $next = $transitions[$delivery->status->value] ?? null;

        if ($next === null || $request->status !== $next->value) {
            return response()->json(['message' => 'Transition de statut invalide.'], 422);
        }

        $cashMethods = [PaymentMethod::CashOnDelivery->value, PaymentMethod::Agency->value];
        if (
            $delivery->status === DeliveryStatus::PickingUp
            && $next === DeliveryStatus::InDelivery
            && $delivery->payment
            && in_array($delivery->payment->method->value, $cashMethods)
            && $delivery->payment->status !== PaymentStatus::Succeeded
        ) {
            return response()->json([
                'message' => 'Confirmez d’abord le paiement physique avec le code PAIEMENTRECU.',
            ], 422);
        }

        $delivery->update(['status' => $next]);
        $delivery->statusHistories()->create(['status' => $next]);

        $event = match ($next) {
            DeliveryStatus::InDelivery => DeliveryNotificationEvent::PackagePickedUp,
            DeliveryStatus::Delivered => DeliveryNotificationEvent::PackageDelivered,
            default => null,
        };

        if ($event !== null) {
            try {
                $this->notifications->send($delivery->fresh(['client', 'driver']), $event);
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return response()->json($delivery->load('client:id,name,phone', 'statusHistories'));
    }
}
