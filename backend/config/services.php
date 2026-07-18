<?php

return [
    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),
        'url' => env('SMS_GATEWAY_URL'),
        'token' => env('SMS_GATEWAY_TOKEN'),
        'sender' => env('SMS_SENDER', 'SpeedService'),
    ],

    'cloudinary' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
        'api_key'    => env('CLOUDINARY_API_KEY'),
        'api_secret' => env('CLOUDINARY_API_SECRET'),
        'secure'     => env('CLOUDINARY_SECURE', true),
        // Dossier racine où sont rangés les assets SpeedService sur Cloudinary.
        'folder'     => env('CLOUDINARY_FOLDER', 'speedservice'),
        // Durée de validité (secondes) des URLs signées de téléchargement des documents privés.
        'signed_url_ttl' => (int) env('CLOUDINARY_SIGNED_URL_TTL', 300),
    ],
];
