<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send(string $phone, string $message): void
    {
        $driver = config('services.sms.driver', 'log');

        if ($driver === 'array') {
            return;
        }

        if ($driver === 'http') {
            Http::withToken((string) config('services.sms.token'))
                ->post((string) config('services.sms.url'), [
                    'to' => $phone,
                    'message' => $message,
                    'sender' => config('services.sms.sender', 'SpeedService'),
                ])
                ->throw();

            return;
        }

        Log::info('SMS Speed Service', ['to' => $phone, 'message' => $message]);
    }
}
