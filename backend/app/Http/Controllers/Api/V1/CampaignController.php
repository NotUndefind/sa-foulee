<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\CampaignNotSendableException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Newsletter\StoreCampaignRequest;
use App\Http\Requests\Newsletter\UpdateCampaignRequest;
use App\Models\NewsletterCampaign;
use App\Services\NewsletterCampaignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $data = $request->validated();

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
    public function update(UpdateCampaignRequest $request, NewsletterCampaign $campaign): JsonResponse
    {
        if ($campaign->isSent()) {
            return response()->json(['message' => 'Cette campagne a déjà été envoyée.'], 422);
        }

        if ($campaign->isQueued()) {
            return response()->json(['message' => "Cette campagne est en cours d'envoi."], 422);
        }

        $data = $request->validated();

        if (isset($data['body_html'])) {
            $data['body_html'] = Purify::clean($data['body_html']);
        }

        $campaign->update($data);

        return response()->json($campaign->fresh());
    }

    /**
     * POST /api/v1/admin/newsletter/campaigns/{campaign}/send
     * Déclencher l'envoi à tous les abonnés (traitement en arrière-plan).
     */
    public function send(
        Request $request,
        NewsletterCampaign $campaign,
        NewsletterCampaignService $service,
    ): JsonResponse {
        try {
            $count = $service->queue($campaign);
        } catch (CampaignNotSendableException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => "Campagne mise en file pour {$count} abonné(s). L'envoi se termine en arrière-plan.",
            'recipient_count' => $count,
            'queued_at' => $campaign->queued_at,
        ]);
    }
}
