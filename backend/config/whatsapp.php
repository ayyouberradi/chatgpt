<?php

return [
    'access_token' => env('WHATSAPP_ACCESS_TOKEN'), 'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
    'app_secret' => env('WHATSAPP_APP_SECRET'), 'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),
    'graph_version' => env('WHATSAPP_GRAPH_VERSION', 'v23.0'),
];
