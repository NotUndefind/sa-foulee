<?php

namespace App\Services;

use App\Exceptions\CampaignNotSendableException;
use App\Jobs\SendNewsletterEmail;
use App\Models\NewsletterCampaign;
use App\Models\User;
use Illuminate\Bus\Batch;
use Illuminate\Support\Facades\Bus;
use Throwable;

class NewsletterCampaignService
{
    /**
     * Met la campagne en file pour tous les abonnés et renvoie le nombre de
     * destinataires.
     *
     * Cycle de vie : queued_at est réservé atomiquement avant le dispatch
     * (empêche un double envoi concurrent) ; sent_at et failed_count sont posés
     * par le callback finally(), qui s'exécute une fois tous les jobs traités,
     * succès ou échec. allowFailures() évite qu'un seul rejet SMTP n'annule le
     * batch et ne laisse la campagne verrouillée indéfiniment.
     *
     * @throws CampaignNotSendableException
     */
    public function queue(NewsletterCampaign $campaign): int
    {
        if ($campaign->isSent()) {
            throw new CampaignNotSendableException('Cette campagne a déjà été envoyée.');
        }

        if ($campaign->isQueued()) {
            throw new CampaignNotSendableException("Cette campagne est déjà en cours d'envoi.");
        }

        $subscribers = User::whereNotNull('newsletter_subscribed_at')
            ->whereNotNull('newsletter_unsubscribe_token')
            ->get();

        if ($subscribers->isEmpty()) {
            throw new CampaignNotSendableException('Aucun abonné à contacter.');
        }

        // Réservation atomique : une seule requête concurrente peut passer.
        $claimed = NewsletterCampaign::whereKey($campaign->id)
            ->whereNull('queued_at')
            ->whereNull('sent_at')
            ->update(['queued_at' => now()]);

        if ($claimed === 0) {
            throw new CampaignNotSendableException("Cette campagne est déjà en cours d'envoi.");
        }

        $campaignId = $campaign->id;
        $jobs = $subscribers
            ->map(fn (User $user) => new SendNewsletterEmail($user, $campaign))
            ->all();

        try {
            $batch = Bus::batch($jobs)
                ->name("newsletter-campaign-{$campaignId}")
                ->onQueue('default')
                ->allowFailures()
                ->finally(function (Batch $batch) use ($campaignId) {
                    NewsletterCampaign::whereKey($campaignId)->update([
                        'sent_at' => now(),
                        'failed_count' => $batch->failedJobs,
                    ]);
                })
                ->dispatch();
        } catch (Throwable $e) {
            // Dispatch impossible : libérer la réservation pour permettre un nouvel essai.
            NewsletterCampaign::whereKey($campaignId)->update(['queued_at' => null]);

            throw $e;
        }

        NewsletterCampaign::whereKey($campaignId)->update([
            'batch_id' => $batch->id,
            'recipient_count' => $subscribers->count(),
        ]);

        $campaign->refresh();

        return $subscribers->count();
    }
}
