<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Services tiers
    |--------------------------------------------------------------------------
    */

    'helloasso' => [
        'webhook_secret' => env('HELLOASSO_WEBHOOK_SECRET', ''),
        'form_url' => env('HELLOASSO_FORM_URL', ''),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY', ''),
    ],

];
