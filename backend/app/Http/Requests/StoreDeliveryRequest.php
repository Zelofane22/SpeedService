<?php

namespace App\Http\Requests;

use App\Enums\ContentCategory;
use App\Enums\DeliveryType;
use App\Enums\PackageType;
use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sender_name'      => ['required', 'string', 'max:255'],
            'sender_phone'     => ['required', 'string', 'max:20'],
            'pickup_address'   => ['required', 'string'],
            'pickup_latitude'  => ['nullable', 'numeric', 'between:-90,90'],
            'pickup_longitude' => ['nullable', 'numeric', 'between:-180,180'],

            'recipient_name'    => ['required', 'string', 'max:255'],
            'recipient_phone'   => ['required', 'string', 'max:20'],
            'delivery_address'  => ['required', 'string'],
            'delivery_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'delivery_longitude'=> ['nullable', 'numeric', 'between:-180,180'],

            'package_type'        => ['required', new Enum(PackageType::class)],
            'content_category'    => ['required', new Enum(ContentCategory::class)],
            'package_description' => ['nullable', 'string', 'max:1000'],
            'package_weight'      => ['nullable', 'numeric', 'min:0', 'max:1000'],

            'delivery_type'  => ['required', new Enum(DeliveryType::class)],
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
            'distance'       => [
                'required_without:pickup_latitude,pickup_longitude,delivery_latitude,delivery_longitude',
                'nullable',
                'numeric',
                'min:0.01',
            ],
        ];
    }
}
