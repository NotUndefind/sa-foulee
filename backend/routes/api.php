<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| saFoulee API Routes — v1
|--------------------------------------------------------------------------
|
| Hiérarchie des rôles : admin > founder > coach > bureau > member
|
*/

Route::prefix('v1')->group(function () {

    // ---- Webhooks (public, hors auth Sanctum) ----
    Route::prefix('webhooks')->group(function () {
        Route::post('helloasso', [\App\Http\Controllers\Api\V1\HelloAssoWebhookController::class, 'handle'])
            ->middleware('helloasso.signature');
    });

    // ---- Auth (public) ----
    Route::prefix('auth')->group(function () {
        Route::post('register',        [\App\Http\Controllers\Api\V1\AuthController::class, 'register']);
        Route::post('login',           [\App\Http\Controllers\Api\V1\AuthController::class, 'login']);
        Route::post('forgot-password', [\App\Http\Controllers\Api\V1\AuthController::class, 'forgotPassword']);
        Route::post('reset-password',  [\App\Http\Controllers\Api\V1\AuthController::class, 'resetPassword']);
    });

    // ---- Routes publiques ----
    Route::get('stats/homepage',          [\App\Http\Controllers\Api\V1\StatsController::class, 'homepage']);
    Route::get('settings/public',         [\App\Http\Controllers\Api\V1\SettingsController::class, 'public']);
    Route::post('newsletter/unsubscribe', [\App\Http\Controllers\Api\V1\NewsletterController::class, 'unsubscribe']);

    Route::get('events',                    [\App\Http\Controllers\Api\V1\EventController::class, 'index']);
    Route::get('events/{event}',            [\App\Http\Controllers\Api\V1\EventController::class, 'show']);
    Route::get('events/{event}/photos',     [\App\Http\Controllers\Api\V1\EventPhotoController::class, 'index']);
    Route::get('posts',                     [\App\Http\Controllers\Api\V1\PostController::class, 'index']);
    Route::get('posts/{post}',              [\App\Http\Controllers\Api\V1\PostController::class, 'show']);
    Route::get('posts/{post}/comments',     [\App\Http\Controllers\Api\V1\CommentController::class, 'index']);

    // ---- Routes authentifiées ----
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('auth/logout',  [\App\Http\Controllers\Api\V1\AuthController::class, 'logout']);

        // Profil personnel (tous les membres)
        Route::get('me',    [\App\Http\Controllers\Api\V1\ProfileController::class, 'show']);
        Route::patch('me',  [\App\Http\Controllers\Api\V1\ProfileController::class, 'update']);
        Route::delete('me', [\App\Http\Controllers\Api\V1\ProfileController::class, 'destroy']);

        // Newsletter — toggle abonnement (tous les membres)
        Route::patch('me/newsletter', [\App\Http\Controllers\Api\V1\NewsletterController::class, 'toggle']);

        // ---- Membres (liste légère pour bureau+) ----
        Route::middleware('role:admin|founder|bureau')->group(function () {
            Route::get('members', function () {
                return response()->json(
                    \App\Models\User::orderBy('last_name')
                        ->get(['id', 'first_name', 'last_name', 'email'])
                );
            });
        });

        // ---- Inventaire [Bureau+] ----
        Route::middleware('role:admin|founder|bureau')->group(function () {
            Route::get('inventory',             [\App\Http\Controllers\Api\V1\EquipmentController::class, 'index']);
            Route::get('inventory/export',      [\App\Http\Controllers\Api\V1\EquipmentController::class, 'export']);
            Route::get('inventory/{equipment}', [\App\Http\Controllers\Api\V1\EquipmentController::class, 'show']);
            Route::post('inventory',            [\App\Http\Controllers\Api\V1\EquipmentController::class, 'store']);
            Route::patch('inventory/{equipment}',[\App\Http\Controllers\Api\V1\EquipmentController::class, 'update']);
            // Attributions
            Route::post('inventory/{equipment}/assign',             [\App\Http\Controllers\Api\V1\EquipmentAssignmentController::class, 'assign']);
            Route::patch('inventory/assignments/{assignment}/return',[\App\Http\Controllers\Api\V1\EquipmentAssignmentController::class, 'return']);
        });

        Route::middleware('role:admin|founder')->group(function () {
            Route::delete('inventory/{equipment}', [\App\Http\Controllers\Api\V1\EquipmentController::class, 'destroy']);
        });

        // ---- Budget [Bureau+] ----
        Route::middleware('role:admin|founder|bureau')->group(function () {
            Route::get('budget',         [\App\Http\Controllers\Api\V1\BudgetEntryController::class, 'index']);
            Route::get('budget/summary', [\App\Http\Controllers\Api\V1\BudgetEntryController::class, 'summary']);
            Route::get('budget/export',  [\App\Http\Controllers\Api\V1\BudgetEntryController::class, 'export']);
            Route::post('budget',        [\App\Http\Controllers\Api\V1\BudgetEntryController::class, 'store']);
            Route::patch('budget/{entry}',[\App\Http\Controllers\Api\V1\BudgetEntryController::class, 'update']);
        });

        Route::middleware('role:admin|founder')->group(function () {
            Route::delete('budget/{entry}', [\App\Http\Controllers\Api\V1\BudgetEntryController::class, 'destroy']);
        });

        // ---- Settings admin [Admin|Founder] ----
        Route::middleware('role:admin|founder')->group(function () {
            Route::get('admin/settings',               [\App\Http\Controllers\Api\V1\SettingsController::class, 'index']);
            Route::patch('admin/settings/{key}',       [\App\Http\Controllers\Api\V1\SettingsController::class, 'update']);
        });

        // ---- Newsletter admin [Admin|Founder] ----
        Route::middleware('role:admin|founder')->group(function () {
            Route::get('admin/newsletter/subscribers',        [\App\Http\Controllers\Api\V1\NewsletterController::class, 'subscribers']);
            Route::get('admin/newsletter/subscribers/export', [\App\Http\Controllers\Api\V1\NewsletterController::class, 'exportSubscribers']);
            // Campagnes
            Route::get('admin/newsletter/campaigns',                    [\App\Http\Controllers\Api\V1\CampaignController::class, 'index']);
            Route::post('admin/newsletter/campaigns',                   [\App\Http\Controllers\Api\V1\CampaignController::class, 'store']);
            Route::patch('admin/newsletter/campaigns/{campaign}',       [\App\Http\Controllers\Api\V1\CampaignController::class, 'update']);
            Route::post('admin/newsletter/campaigns/{campaign}/send',   [\App\Http\Controllers\Api\V1\CampaignController::class, 'send']);
        });

        // ---- Admin uniquement ----
        Route::middleware('role:admin')->group(function () {
            Route::get('users',              [\App\Http\Controllers\Api\V1\UserController::class, 'index']);
            Route::get('users/export',       [\App\Http\Controllers\Api\V1\UserController::class, 'export']);
            Route::get('users/{user}',       [\App\Http\Controllers\Api\V1\UserController::class, 'show']);
            Route::patch('users/{user}/role',[\App\Http\Controllers\Api\V1\UserController::class, 'updateRole']);
            Route::delete('users/{user}',    [\App\Http\Controllers\Api\V1\UserController::class, 'destroy']);
        });

        // ---- Documents (membre sur ses propres docs, admin sur tous) ----
        Route::get('users/{user}/documents',          [\App\Http\Controllers\Api\V1\DocumentController::class, 'index']);
        Route::post('users/{user}/documents',         [\App\Http\Controllers\Api\V1\DocumentController::class, 'store']);
        Route::get('documents/{document}/download',    [\App\Http\Controllers\Api\V1\DocumentController::class, 'download']);
        Route::delete('documents/{document}',          [\App\Http\Controllers\Api\V1\DocumentController::class, 'destroy']);

        // ---- Admin & Fondateur — gestion des documents ----
        Route::middleware('role:admin|founder')->group(function () {
            Route::get('documents/pending',              [\App\Http\Controllers\Api\V1\DocumentController::class, 'pendingAll']);
            Route::patch('documents/{document}/status',  [\App\Http\Controllers\Api\V1\DocumentController::class, 'updateStatus']);
        });

        // ---- Événements ----
        // Lecture : tous les membres
        Route::get('events/{event}/participants', [\App\Http\Controllers\Api\V1\EventController::class, 'participants']);
        Route::post('events/{event}/register',    [\App\Http\Controllers\Api\V1\EventController::class, 'register']);
        Route::delete('events/{event}/register',  [\App\Http\Controllers\Api\V1\EventController::class, 'unregister']);

        // ---- Photos d'événements ----
        Route::post('events/{event}/photos',      [\App\Http\Controllers\Api\V1\EventPhotoController::class, 'store']);
        Route::delete('event-photos/{photo}',     [\App\Http\Controllers\Api\V1\EventPhotoController::class, 'destroy']);

        // Création/édition : admin, founder, bureau
        Route::middleware('role:admin|founder|bureau')->group(function () {
            Route::post('events',          [\App\Http\Controllers\Api\V1\EventController::class, 'store']);
            Route::patch('events/{event}', [\App\Http\Controllers\Api\V1\EventController::class, 'update']);
            Route::delete('events/{event}',[\App\Http\Controllers\Api\V1\EventController::class, 'destroy']);
        });

        // ---- Sessions d'entraînement ----
        // Lecture : tous les membres
        Route::get('sessions',              [\App\Http\Controllers\Api\V1\SessionController::class, 'index']);
        Route::get('sessions/templates',    [\App\Http\Controllers\Api\V1\SessionController::class, 'templates']);
        Route::get('sessions/{session}',    [\App\Http\Controllers\Api\V1\SessionController::class, 'show']);
        Route::post('sessions/{session}/participate', [\App\Http\Controllers\Api\V1\SessionController::class, 'participate']);

        // Création/édition : admin, founder, coach
        Route::middleware('role:admin|founder|coach')->group(function () {
            Route::post('sessions',           [\App\Http\Controllers\Api\V1\SessionController::class, 'store']);
            Route::patch('sessions/{session}',[\App\Http\Controllers\Api\V1\SessionController::class, 'update']);
            Route::delete('sessions/{session}',[\App\Http\Controllers\Api\V1\SessionController::class, 'destroy']);
        });

        // ---- Blog ----
        // Publication : admin, founder, coach, bureau
        Route::middleware('role:admin|founder|coach|bureau')->group(function () {
            Route::post('posts',            [\App\Http\Controllers\Api\V1\PostController::class, 'store']);
            Route::patch('posts/{post}',    [\App\Http\Controllers\Api\V1\PostController::class, 'update']);
            Route::delete('posts/{post}',   [\App\Http\Controllers\Api\V1\PostController::class, 'destroy']);
            Route::patch('posts/{post}/pin',[\App\Http\Controllers\Api\V1\PostController::class, 'pin']);
            Route::post('uploads/media',    [\App\Http\Controllers\Api\V1\MediaUploadController::class, 'store']);
        });

        // Commentaires : tous les membres
        Route::post('posts/{post}/comments',[\App\Http\Controllers\Api\V1\CommentController::class, 'store']);
        Route::delete('comments/{comment}', [\App\Http\Controllers\Api\V1\CommentController::class, 'destroy']);

        // ---- Performances & leaderboard ----
        Route::get('leaderboard',                    [\App\Http\Controllers\Api\V1\LeaderboardController::class, 'index']);
        Route::get('users/{user}/performances',      [\App\Http\Controllers\Api\V1\PerformanceController::class, 'index']);
        Route::post('performances',                  [\App\Http\Controllers\Api\V1\PerformanceController::class, 'store']);

        // ---- Strava ----
        Route::get('strava/connect',       [\App\Http\Controllers\Api\V1\StravaController::class, 'connect']);
        Route::get('strava/callback',      [\App\Http\Controllers\Api\V1\StravaController::class, 'callback']);
        Route::delete('strava/disconnect', [\App\Http\Controllers\Api\V1\StravaController::class, 'disconnect']);

        // ---- Chat ----
        Route::get('chat/{channel}/messages',  [\App\Http\Controllers\Api\V1\ChatController::class, 'index']);
        Route::post('chat/{channel}/messages', [\App\Http\Controllers\Api\V1\ChatController::class, 'store']);
        Route::post('chat/pusher/auth',        [\App\Http\Controllers\Api\V1\ChatController::class, 'pusherAuth']);

        // ---- Notifications ----
        Route::get('notifications',                         [\App\Http\Controllers\Api\V1\NotificationController::class, 'index']);
        Route::patch('notifications/{id}/read',             [\App\Http\Controllers\Api\V1\NotificationController::class, 'markRead']);
        Route::patch('notifications/read-all',              [\App\Http\Controllers\Api\V1\NotificationController::class, 'markAllRead']);
        Route::get('notifications/preferences',             [\App\Http\Controllers\Api\V1\NotificationController::class, 'preferences']);
        Route::patch('notifications/preferences',           [\App\Http\Controllers\Api\V1\NotificationController::class, 'updatePreferences']);
    });
});
