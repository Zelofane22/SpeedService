<?php

namespace App\Http\Controllers\Api;

use App\Enums\DeliveryNotificationEvent;
use App\Enums\DeliveryStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Mail\AdminPaymentConfirmedMail;
use App\Services\DeliveryNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(private readonly DeliveryNotificationService $notifications) {}

    public function pay(Request $request, string $id): JsonResponse
    {
        $delivery = Delivery::where('client_id', Auth::id())
            ->with('payment')
            ->findOrFail($id);

        if ($delivery->status !== DeliveryStatus::AwaitingPayment) {
            return response()->json(
                ['message' => "Cette livraison n'est pas en attente de paiement."],
                422,
            );
        }

        $payment = $delivery->payment;

        if ($payment->status !== PaymentStatus::Pending) {
            return response()->json(
                ['message' => 'Le paiement a déjà été traité.'],
                422,
            );
        }

        $method = $payment->method;

        match ($method) {
            PaymentMethod::MtnMomo, PaymentMethod::MoovMoney => $request->validate([
                'phone' => ['required', 'string', 'regex:/^[0-9+\s]{8,15}$/'],
            ]),
            PaymentMethod::Card => $request->validate([
                'card_number'     => ['required', 'string', 'digits:16'],
                'expiry'          => ['required', 'string', 'regex:/^\d{2}\/\d{2}$/'],
                'cvv'             => ['required', 'string', 'digits_between:3,4'],
                'cardholder_name' => ['required', 'string', 'max:100'],
            ]),
            default => null,
        };

        $isElectronic = in_array($method, [
            PaymentMethod::MtnMomo,
            PaymentMethod::MoovMoney,
            PaymentMethod::Card,
        ]);

        DB::transaction(function () use ($delivery, $payment, $isElectronic, $method) {
            if ($isElectronic) {
                $payment->update([
                    'status'                => PaymentStatus::Succeeded,
                    'transaction_reference' => 'TXN-' . strtoupper(Str::random(10)),
                ]);

                $delivery->update([
                    'status'  => DeliveryStatus::Confirmed,
                    'paid_at' => now(),
                ]);

                $delivery->statusHistories()->create([
                    'status' => DeliveryStatus::Confirmed,
                    'note'   => 'Paiement confirmé via ' . $method->value,
                ]);
            } else {
                $delivery->update(['status' => DeliveryStatus::AwaitingValidation]);

                $delivery->statusHistories()->create([
                    'status' => DeliveryStatus::AwaitingValidation,
                    'note'   => 'En attente de validation manuelle (' . $method->value . ')',
                ]);
            }
        });

        $adminEmail = config('mail.admin_notification_email');

        if ($isElectronic) {
            try {
                $this->notifications->send($delivery->fresh(['client', 'driver']), DeliveryNotificationEvent::OrderConfirmed);
            } catch (\Throwable $e) {
                report($e);
            }
        }

        if ($adminEmail) {
            try {
                Mail::to($adminEmail)->queue(
                    new AdminPaymentConfirmedMail(
                        $delivery->fresh(['client', 'payment']),
                        requiresValidation: ! $isElectronic,
                    ),
                );
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return response()->json(
            $delivery->fresh(['payment', 'statusHistories' => fn ($q) => $q->orderBy('created_at')]),
        );
    }
}
