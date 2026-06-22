<?php

namespace App\Http\Controllers\Api;

use App\Enums\DeliveryNotificationEvent;
use App\Enums\DeliveryStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
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

        $missions = Delivery::where('status', DeliveryStatus::Confirmed)
            ->whereNull('driver_id')
            ->with('client:id,name,phone')
            ->latest()
            ->get();

        return response()->json($missions);
    }

    public function myMissions(): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        $missions = Delivery::where('driver_id', Auth::id())
            ->with(['client:id,name,phone', 'statusHistories' => fn ($q) => $q->orderBy('created_at')])
            ->latest()
            ->get();

        return response()->json($missions);
    }

    public function acceptMission(string $id): JsonResponse
    {
        if ($err = $this->ensureDriver()) return $err;

        $delivery = Delivery::where('status', DeliveryStatus::Confirmed)
            ->whereNull('driver_id')
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

        $delivery = Delivery::where('driver_id', Auth::id())->findOrFail($id);

        $transitions = [
            DeliveryStatus::Assigned->value   => DeliveryStatus::PickingUp,
            DeliveryStatus::PickingUp->value   => DeliveryStatus::InDelivery,
            DeliveryStatus::InDelivery->value  => DeliveryStatus::Delivered,
        ];

        $next = $transitions[$delivery->status->value] ?? null;

        if ($next === null || $request->status !== $next->value) {
            return response()->json(['message' => 'Transition de statut invalide.'], 422);
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
