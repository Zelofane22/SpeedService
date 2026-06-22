<?php

return [
    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
        'url' => env('SMS_GATEWAY_URL'),
        'token' => env('SMS_GATEWAY_TOKEN'),
        'sender' => env('SMS_SENDER', 'SpeedService'),
    ],
];
