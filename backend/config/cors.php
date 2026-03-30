<?php

/*
|--------------------------------------------------------------------------
| CORS — Cross-Origin Resource Sharing
|--------------------------------------------------------------------------
| Autorise le frontend Vercel (et les preview deployments) à accéder à l'API.
| En production sur O2switch, FRONTEND_URL doit pointer vers le domaine Vercel.
|
| Origines autorisées :
|   - FRONTEND_URL (env var) — domaine Vercel principal ou localhost
|   - *.vercel.app            — preview deployments automatiques Vercel
*/

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:3000'),
    ]),

    /*
     * Patterns regex pour les preview deployments Vercel (ex: safoulee-xxx.vercel.app)
     * et pour localhost en dev.
     */
    'allowed_origins_patterns' => [
        '#^https://safoulee(-[a-z0-9]+)?\.vercel\.app$#',
        '#^http://localhost(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
     * Credentials = true requis pour Laravel Sanctum (cookies de session).
     * Attention : incompatible avec allowed_origins = ['*'].
     */
    'supports_credentials' => true,

];
