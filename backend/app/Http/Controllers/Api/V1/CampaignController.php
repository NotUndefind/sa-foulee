<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewsletterEmail;
use App\Models\NewsletterCampaign;
use App\Models\User;
use Illuminate\Bus\Batch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Stevebauman\Purify\Facades\Purify;

class CampaignController extends Controller
{
    /**
     * GET /api/v1/admin/newsletter/campaigns
     * Historique des campagnes.
     */
    public function index(): JsonResponse
    {
        $campaigns = NewsletterCampaign::with('creator:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($campaigns);
    }

    /**
     * POST /api/v1/admin/newsletter/campaigns
     * Créer un brouillon.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body_html' => ['required', 'string'],
        ]);

        $campaign = NewsletterCampaign::create([
            'created_by' => $request->user()->id,
            'subject' => $data['subject'],
            // Sanitisation du HTML riche avant stockage — défense anti-XSS.
            'body_html' => Purify::clean($data['body_html']),
        ]);

        return response()->json($campaign, 201);
    }

    /**
     * PATCH /api/v1/admin/newsletter/campaigns/{campaign}
     * Modifier un brouillon (non encore envoyé).
     */
    public function update(Request $request, NewsletterCampaign $campaign): JsonResponse
    {
        if ($campaign->isSent()) {
            return response()->json(['message' => 'Cette campagne a déjà été envoyée.'], 422);
        }

        if ($campaign->isQueued()) {
            return response()->json(['message' => "Cette campagne est en cours d'envoi."], 422);
        }

        $data = $request->validate([
            'subject' => ['sometimes', 'string', 'max:255'],
            'body_html' => ['sometimes', 'string'],
        ]);

        if (isset($data['body_html'])) {
            $data['body_html'] = Purify::clean($data['body_html']);
        }

        $campaign->update($data);

        return response()->json($campaign->fresh());
    }

    /**
     * POST /api/v1/admin/newsletter/campaigns/{campaign}/send
     * Déclencher l'envoi à tous les abonnés.
     */
    public function send(Request $request, NewsletterCampaign $campaign): JsonResponse
    {
        if ($campaign->isSent()) {
            return response()->json(['message' => 'Cette campagne a déjà été envoyée.'], 422);
        }

        if ($campaign->isQueued()) {
            return response()->json(['message' => "Cette campagne est déjà en cours d'envoi."], 422);
        }

        $subscribers = User::whereNotNull('newsletter_subscribed_at')
            ->whereNotNull('newsletter_unsubscribe_token')
            ->get();

        if ($subscribers->isEmpty()) {
            return response()->json(['message' => 'Aucun abonné à contacter.'], 422);
        }

        $jobs = $subscribers
            ->map(fn (User $user) => new SendNewsletterEmail($user, $campaign))
            ->all();

        // sent_at n'est posé qu'à la complétion du batch (callback then) pour
        // ne pas marquer la campagne « envoyée » avant l'envoi réel. queued_at
        // verrouille toute modification/réenvoi pendant le traitement.
        $batch = Bus::batch($jobs)
            ->name("newsletter-campaign-{$campaign->id}")
            ->onQueue('default')
            ->then(function (Batch $batch) use ($campaign) {
                $campaign->update(['sent_at' => now()]);
            })
            ->dispatch();

        $campaign->update([
            'queued_at' => now(),
            'batch_id' => $batch->id,
            'recipient_count' => $subscribers->count(),
        ]);

        return response()->json([
            'message' => "Campagne mise en file pour {$subscribers->count()} abonné(s). L'envoi se termine en arrière-plan.",
            'recipient_count' => $subscribers->count(),
            'queued_at' => $campaign->fresh()->queued_at,
        ]);
    }
}
