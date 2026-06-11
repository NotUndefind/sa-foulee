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

        // Sans secret configuré : on ne laisse passer qu'en local/testing
        // (utile pour Postman). En prod, refuser pour éviter d'accepter
        // n'importe quel POST falsifiant cotisations et écritures budgétaires.
        if (empty($secret)) {
            abort_unless(
                app()->environment(['local', 'testing']),
                401,
                'Webhook non configuré.',
            );

            return $next($request);
        }

        $signature = $request->header('X-HelloAsso-Signature');

        if (empty($signature)) {
            return response()->json(['message' => 'Signature manquante.'], 401);
        }

        $rawBody = $request->getContent();
        $expected = base64_encode(hash_hmac('sha256', $rawBody, $secret, true));

        if (! hash_equals($expected, $signature)) {
            return response()->json(['message' => 'Signature invalide.'], 401);
        }

        return $next($request);
    }
}
