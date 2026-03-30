<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\SendNewsletterEmail;
use App\Models\NewsletterCampaign;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'subject'   => ['required', 'string', 'max:255'],
            'body_html' => ['required', 'string'],
        ]);

        $campaign = NewsletterCampaign::create([
            'created_by' => $request->user()->id,
            'subject'    => $data['subject'],
            'body_html'  => $data['body_html'],
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

        $data = $request->validate([
            'subject'   => ['sometimes', 'string', 'max:255'],
            'body_html' => ['sometimes', 'string'],
        ]);

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

        $subscribers = User::whereNotNull('newsletter_subscribed_at')
            ->whereNotNull('newsletter_unsubscribe_token')
            ->get();

        if ($subscribers->isEmpty()) {
            return response()->json(['message' => 'Aucun abonné à contacter.'], 422);
        }

        foreach ($subscribers as $user) {
            SendNewsletterEmail::dispatch($user, $campaign)->onQueue('default');
        }

        $campaign->update([
            'sent_at'         => now(),
            'recipient_count' => $subscribers->count(),
        ]);

        return response()->json([
            'message'         => "Campagne envoyée à {$subscribers->count()} abonné(s).",
            'recipient_count' => $subscribers->count(),
            'sent_at'         => $campaign->fresh()->sent_at,
        ]);
    }
}
