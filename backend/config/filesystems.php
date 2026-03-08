<?php

return [

    'default' => env('FILESYSTEM_DISK', 'local'),

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root'   => storage_path('app/private'),
            'serve'  => true,
            'throw'  => false,
        ],

        'public' => [
            'driver'     => 'local',
            'root'       => storage_path('app/public'),
            'url'        => env('APP_URL') . '/storage',
            'visibility' => 'public',
            'throw'      => false,
        ],

        /*
        |----------------------------------------------------------------------
        | Cloudflare R2 — stockage des documents membres
        |----------------------------------------------------------------------
        | Compatible AWS S3 SDK. Utiliser le endpoint R2 (sans egress fees).
        | Bucket : safoulee-documents (privé, accès par URL signée)
        */
        'r2' => [
            'driver'                  => 's3',
            'key'                     => env('R2_ACCESS_KEY_ID'),
            'secret'                  => env('R2_SECRET_ACCESS_KEY'),
            'region'                  => 'auto',
            'bucket'                  => env('R2_BUCKET', 'safoulee-documents'),
            'url'                     => env('R2_URL'),
            'endpoint'                => env('R2_ENDPOINT'),
            'use_path_style_endpoint' => true,
            'throw'                   => true,
        ],

    ],

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
