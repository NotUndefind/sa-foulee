<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Vérifie la signature HMAC-SHA256 des webhooks HelloAsso.
 *
 * HelloAsso envoie le hash dans le header X-HelloAsso-Signature.
 * Calcul : base64(HMAC-SHA256(secret, rawBody))
 */
class VerifyHelloAssoSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('services.helloasso.webhook_secret');

        // En local sans secret configuré, on laisse passer (utile pour les tests Postman)
        if (empty($secret)) {
            return $next($request);
        }

        $signature = $request->header('X-HelloAsso-Signature');

        if (empty($signature)) {
            return response()->json(['message' => 'Signature manquante.'], 401);
        }

        $rawBody  = $request->getContent();
        $expected = base64_encode(hash_hmac('sha256', $rawBody, $secret, true));

        if (! hash_equals($expected, $signature)) {
            return response()->json(['message' => 'Signature invalide.'], 401);
        }

        return $next($request);
    }
}
