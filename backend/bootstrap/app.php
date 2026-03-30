<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        apiPrefix: 'api',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS — doit être en premier pour répondre aux preflight OPTIONS
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);

        // Enregistrement des alias middleware
        $middleware->alias([
            'role'              => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'        => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission'=> \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'helloasso.signature' => \App\Http\Middleware\VerifyHelloAssoSignature::class,
        ]);

        $middleware->validateCsrfTokens(except: ['api/*']);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Retourner du JSON pour toutes les erreurs API
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Ressource introuvable.'], 404);
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Les données soumises sont invalides.',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Spatie\Permission\Exceptions\UnauthorizedException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Accès refusé. Rôle insuffisant.'], 403);
            }
        });
    })->create();
