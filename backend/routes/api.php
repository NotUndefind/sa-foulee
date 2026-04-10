<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BudgetEntryController;
use App\Http\Controllers\Api\V1\CampaignController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\EquipmentAssignmentController;
use App\Http\Controllers\Api\V1\EquipmentController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\EventPhotoController;
use App\Http\Controllers\Api\V1\HelloAssoWebhookController;
use App\Http\Controllers\Api\V1\LeaderboardController;
use App\Http\Controllers\Api\V1\MediaUploadController;
use App\Http\Controllers\Api\V1\NewsletterController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PerformanceController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\SessionController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\StatsController;
use App\Http\Controllers\Api\V1\StravaController;
use App\Http\Controllers\Api\V1\UserController;
use App\Models\User;
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
        Route::post('helloasso', [HelloAssoWebhookController::class, 'handle'])
            ->middleware('helloasso.signature');
    });

    // ---- Auth (public) ----
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // ---- Routes publiques ----
    Route::get('stats/homepage', [StatsController::class, 'homepage']);
    Route::get('settings/public', [SettingsController::class, 'public']);
    Route::post('newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);

    Route::get('events', [EventController::class, 'index']);
    Route::get('events/{event}', [EventController::class, 'show']);
    Route::get('events/{event}/photos', [EventPhotoController::class, 'index']);
    Route::get('posts', [PostController::class, 'index']);
    Route::get('posts/{post}', [PostController::class, 'show']);
    Route::get('posts/{post}/comments', [CommentController::class, 'index']);

    // ---- Routes authentifiées ----
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Profil personnel (tous les membres)
        Route::get('me', [ProfileController::class, 'show']);
        Route::patch('me', [ProfileController::class, 'update']);
        Route::delete('me', [ProfileController::class, 'destroy']);

        // Newsletter — toggle abonnement (tous les membres)
        Route::patch('me/newsletter', [NewsletterController::class, 'toggle']);

        // ---- Membres (liste légère pour bureau+) ----
        Route::middleware('role:admin|founder|bureau')->group(function () {
            Route::get('members', function () {
                return response()->json(
                    User::orderBy('last_name')
                        ->get(['id', 'first_name', 'last_name', 'email'])
                );
            });
        });

        // ---- Inventaire [Bureau+] ----
        Route::middleware('role:admin|founder|bureau')->group(function () {
            Route::get('inventory', [EquipmentController::class, 'index']);
            Route::get('inventory/export', [EquipmentController::class, 'export']);
            Route::get('inventory/{equipment}', [EquipmentController::class, 'show']);
            Route::post('inventory', [EquipmentController::class, 'store']);
            Route::patch('inventory/{equipment}', [EquipmentController::class, 'update']);
            // Attributions
            Route::post('inventory/{equipment}/assign', [EquipmentAssignmentController::class, 'assign']);
            Route::patch('inventory/assignments/{assignment}/return', [EquipmentAssignmentController::class, 'return']);
        });

        Route::middleware('role:admin|founder')->group(function () {
            Route::delete('inventory/{equipment}', [EquipmentController::class, 'destroy']);
        });

        // ---- Budget [Bureau+] ----
        Route::middleware('role:admin|founder|bureau')->group(function () {
            Route::get('budget', [BudgetEntryController::class, 'index']);
            Route::get('budget/summary', [BudgetEntryController::class, 'summary']);
            Route::get('budget/export', [BudgetEntryController::class, 'export']);
            Route::post('budget', [BudgetEntryController::class, 'store']);
            Route::patch('budget/{entry}', [BudgetEntryController::class, 'update']);
        });

        Route::middleware('role:admin|founder')->group(function () {
            Route::delete('budget/{entry}', [BudgetEntryController::class, 'destroy']);
        });

        // ---- Settings admin [Admin|Founder] ----
        Route::middleware('role:admin|founder')->group(function () {
            Route::get('admin/settings', [SettingsController::class, 'index']);
            Route::patch('admin/settings/{key}', [SettingsController::class, 'update']);
        });

        // ---- Newsletter admin [Admin|Founder] ----
        Route::middleware('role:admin|founder')->group(function () {
            Route::get('admin/newsletter/subscribers', [NewsletterController::class, 'subscribers']);
            Route::get('admin/newsletter/subscribers/export', [NewsletterController::class, 'exportSubscribers']);
            // Campagnes
            Route::get('admin/newsletter/campaigns', [CampaignController::class, 'index']);
            Route::post('admin/newsletter/campaigns', [CampaignController::class, 'store']);
            Route::patch('admin/newsletter/campaigns/{campaign}', [CampaignController::class, 'update']);
            Route::post('admin/newsletter/campaigns/{campaign}/send', [CampaignController::class, 'send']);
        });

        // ---- Admin uniquement ----
        Route::middleware('role:admin')->group(function () {
            Route::get('users', [UserController::class, 'index']);
            Route::get('users/export', [UserController::class, 'export']);
            Route::get('users/{user}', [UserController::class, 'show']);
            Route::patch('users/{user}/role', [UserController::class, 'updateRole']);
            Route::delete('users/{user}', [UserController::class, 'destroy']);
        });

        // ---- Documents (membre sur ses propres docs, admin sur tous) ----
        Route::get('users/{user}/documents', [DocumentController::class, 'index']);
        Route::post('users/{user}/documents', [DocumentController::class, 'store']);
        Route::get('documents/{document}/download', [DocumentController::class, 'download']);
        Route::delete('documents/{document}', [DocumentController::class, 'destroy']);

        // ---- Admin & Fondateur — gestion des documents ----
        Route::middleware('role:admin|founder')->group(function () {
            Route::get('documents/pending', [DocumentController::class, 'pendingAll']);
            Route::patch('documents/{document}/status', [DocumentController::class, 'updateStatus']);
        });

        // ---- Événements ----
        // Lecture : tous les membres
        Route::get('events/{event}/participants', [EventController::class, 'participants']);
        Route::post('events/{event}/register', [EventController::class, 'register']);
        Route::delete('events/{event}/register', [EventController::class, 'unregister']);

        // ---- Photos d'événements ----
        Route::post('events/{event}/photos', [EventPhotoController::class, 'store']);
        Route::delete('event-photos/{photo}', [EventPhotoController::class, 'destroy']);

        // Création/édition : admin, founder, bureau
        Route::middleware('role:admin|founder|bureau')->group(function () {
            Route::post('events', [EventController::class, 'store']);
            Route::patch('events/{event}', [EventController::class, 'update']);
            Route::delete('events/{event}', [EventController::class, 'destroy']);
        });

        // ---- Sessions d'entraînement ----
        // Lecture : tous les membres
        Route::get('sessions', [SessionController::class, 'index']);
        Route::get('sessions/templates', [SessionController::class, 'templates']);
        Route::get('sessions/{session}', [SessionController::class, 'show']);
        Route::post('sessions/{session}/participate', [SessionController::class, 'participate']);

        // Création/édition : admin, founder, coach
        Route::middleware('role:admin|founder|coach')->group(function () {
            Route::post('sessions', [SessionController::class, 'store']);
            Route::patch('sessions/{session}', [SessionController::class, 'update']);
            Route::delete('sessions/{session}', [SessionController::class, 'destroy']);
        });

        // ---- Blog ----
        // Publication : admin, founder, coach, bureau
        Route::middleware('role:admin|founder|coach|bureau')->group(function () {
            Route::post('posts', [PostController::class, 'store']);
            Route::patch('posts/{post}', [PostController::class, 'update']);
            Route::delete('posts/{post}', [PostController::class, 'destroy']);
            Route::patch('posts/{post}/pin', [PostController::class, 'pin']);
            Route::post('uploads/media', [MediaUploadController::class, 'store']);
        });

        // Commentaires : tous les membres
        Route::post('posts/{post}/comments', [CommentController::class, 'store']);
        Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

        // ---- Performances & leaderboard ----
        Route::get('leaderboard', [LeaderboardController::class, 'index']);
        Route::get('users/{user}/performances', [PerformanceController::class, 'index']);
        Route::post('performances', [PerformanceController::class, 'store']);

        // ---- Strava ----
        Route::get('strava/connect', [StravaController::class, 'connect']);
        Route::get('strava/callback', [StravaController::class, 'callback']);
        Route::delete('strava/disconnect', [StravaController::class, 'disconnect']);

        // ---- Chat ----
        Route::get('chat/{channel}/messages', [ChatController::class, 'index']);
        Route::post('chat/{channel}/messages', [ChatController::class, 'store']);
        Route::post('chat/pusher/auth', [ChatController::class, 'pusherAuth']);

        // ---- Notifications ----
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::patch('notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::patch('notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::get('notifications/preferences', [NotificationController::class, 'preferences']);
        Route::patch('notifications/preferences', [NotificationController::class, 'updatePreferences']);
    });
});
