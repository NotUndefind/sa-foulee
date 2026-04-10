<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification
{
    public function __construct(private readonly string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

        $resetUrl = $frontendUrl.'/reinitialiser-mot-de-passe?'.http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        return (new MailMessage)
            ->subject('Réinitialisation de ton mot de passe — sa Foulée')
            ->greeting('Bonjour '.$notifiable->first_name.' !')
            ->line('Tu as demandé la réinitialisation de ton mot de passe.')
            ->action('Réinitialiser mon mot de passe', $resetUrl)
            ->line('Ce lien expirera dans 60 minutes.')
            ->line("Si tu n'es pas à l'origine de cette demande, ignore simplement cet e-mail.");
    }
}
