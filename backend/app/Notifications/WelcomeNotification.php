<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;
    public function via(object $notifiable): array
    {
        return ["mail"];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = env("FRONTEND_URL", "http://localhost:3000");

        return new MailMessage()
            ->subject("Bienvenue dans sa Foulée !")
            ->greeting("Bonjour " . $notifiable->first_name . " !")
            ->line("Ton inscription à **sa Foulée** est confirmée. 🎉")
            ->line(
                "Tu peux dès maintenant accéder à l'application et découvrir les prochains événements et sessions d'entraînement.",
            )
            ->action(
                "Accéder à l'application",
                $frontendUrl . "/tableau-de-bord",
            )
            ->line("À très vite sur les sentiers !");
    }
}
