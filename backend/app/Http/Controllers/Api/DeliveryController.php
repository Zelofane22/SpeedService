<?php

namespace App\Http\Controllers\Api;

use App\Enums\ContentCategory;
use App\Enums\DeliveryStatus;
use App\Enums\DeliveryType;
use App\Enums\PackageType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeliveryRequest;
use App\Models\Delivery;
use App\Models\Payment;
use App\Mail\AdminNewOrderMail;
use App\Services\PriceCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class DeliveryController extends Controller
{
    public function index(): JsonResponse
    {
        $deliveries = Delivery::where('client_id', Auth::id())
            ->with('payment')
            ->latest()
            ->get();

        return response()->json($deliveries);
    }

    public function store(StoreDeliveryRequest $request): JsonResponse
    {
        $packageType  = PackageType::from($request->package_type);
        $deliveryType = DeliveryType::from($request->delivery_type);
        $price        = PriceCalculator::calculate($packageType, $deliveryType);
        $reference    = 'SS-' . now()->year . '-' . strtoupper(Str::random(6));

        $delivery = Delivery::create([
            'reference'           => $reference,
            'client_id'           => Auth::id(),
            'status'              => DeliveryStatus::AwaitingPayment,
            'package_type'        => $packageType,
            'content_category'    => ContentCategory::from($request->content_category),
            'package_description' => $request->package_description,
            'package_weight'      => $request->package_weight,
            'delivery_type'       => $deliveryType,
            'price'               => $price,
            'sender_name'         => $request->sender_name,
            'sender_phone'        => $request->sender_phone,
            'pickup_address'      => $request->pickup_address,
            'pickup_latitude'     => $request->pickup_latitude,
            'pickup_longitude'    => $request->pickup_longitude,
            'recipient_name'      => $request->recipient_name,
            'recipient_phone'     => $request->recipient_phone,
            'delivery_address'    => $request->delivery_address,
            'delivery_latitude'   => $request->delivery_latitude,
            'delivery_longitude'  => $request->delivery_longitude,
            'distance'            => $request->distance,
        ]);

        $delivery->statusHistories()->create(['status' => DeliveryStatus::AwaitingPayment]);

        Payment::create([
            'delivery_id' => $delivery->id,
            'amount'      => $price,
            'method'      => PaymentMethod::from($request->payment_method),
            'status'      => PaymentStatus::Pending,
        ]);

        $adminEmail = config('mail.admin_notification_email');
        if ($adminEmail) {
            try {
                Mail::to($adminEmail)->queue(new AdminNewOrderMail($delivery->load('client', 'payment')));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return response()->json($delivery->load('payment', 'statusHistories'), 201);
    }

    public function show(string $id): JsonResponse
    {
        $delivery = Delivery::where('client_id', Auth::id())
            ->with([
                'payment',
                'driver:id,name,phone',
                'statusHistories' => fn ($q) => $q->orderBy('created_at'),
            ])
            ->findOrFail($id);

        return response()->json($delivery);
    }

    public function cancel(string $id): JsonResponse
    {
        $delivery = Delivery::where('client_id', Auth::id())->findOrFail($id);

        $cancellable = [DeliveryStatus::AwaitingPayment, DeliveryStatus::AwaitingValidation];

        if (! in_array($delivery->status, $cancellable)) {
            return response()->json(['message' => 'Cette livraison ne peut plus être annulée.'], 422);
        }

        $delivery->update(['status' => DeliveryStatus::Cancelled]);
        $delivery->statusHistories()->create(['status' => DeliveryStatus::Cancelled]);

        return response()->json($delivery);
    }
}
