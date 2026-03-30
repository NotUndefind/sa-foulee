<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\NewsletterCampaign;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendNewsletterEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public readonly User               $recipient,
        public readonly NewsletterCampaign $campaign,
    ) {}

    public function handle(): void
    {
        $unsubscribeToken = $this->recipient->newsletter_unsubscribe_token;

        if (! $unsubscribeToken || ! $this->recipient->newsletter_subscribed_at) {
            return;
        }

        $unsubscribeUrl = config('app.frontend_url') . '/desabonnement?token=' . $unsubscribeToken;

        Mail::send(
            'emails.newsletter',
            [
                'subject'         => $this->campaign->subject,
                'bodyHtml'        => $this->campaign->body_html,
                'unsubscribeUrl'  => $unsubscribeUrl,
                'recipientName'   => $this->recipient->first_name,
            ],
            function ($message) use ($unsubscribeUrl) {
                $message
                    ->to($this->recipient->email, $this->recipient->full_name)
                    ->from(
                        config('newsletter.from_address', config('mail.from.address')),
                        config('newsletter.from_name', config('mail.from.name'))
                    )
                    ->subject($this->campaign->subject)
                    ->getHeaders()
                    ->addTextHeader('List-Unsubscribe', '<' . $unsubscribeUrl . '>');
            }
        );
    }
}
