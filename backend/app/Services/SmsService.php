<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Envoi SMS via driver configurable (log, http ou array pour les tests).
 * En production, brancher un provider HTTP via SMS_DRIVER=http.
 */
class SmsService
{
    public function send(string $phone, string $message): void
    {
        $driver = config('services.sms.driver', 'log');

        // Mode test : aucun envoi réel
        if ($driver === 'array') {
            return;
        }

        // Provider HTTP externe
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

        // Fallback dev : journalisation locale
        Log::info('SMS Speed Service', ['to' => $phone, 'message' => $message]);
    }
}
