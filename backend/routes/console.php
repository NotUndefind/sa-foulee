<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Diagnostic e-mail
|--------------------------------------------------------------------------
| `php artisan mail:test toi@exemple.fr` — vérifie la config SMTP sur le
| serveur (tinker n'est pas installé en prod : composer --no-dev).
*/

Artisan::command('mail:test {email}', function (string $email) {
    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error("Adresse invalide : {$email}");

        return 1;
    }

    Mail::raw(
        'E-mail de test envoyé depuis '.config('app.url').'.',
        fn ($message) => $message->to($email)->subject('Test d\'envoi — sa Foulée'),
    );

    $this->info("E-mail de test envoyé à {$email} (mailer : ".config('mail.default').').');

    return 0;
})->purpose('Envoie un e-mail de test pour vérifier la configuration mail');

/*
|--------------------------------------------------------------------------
| Tâches planifiées (cron)
|--------------------------------------------------------------------------
| Déclenchées par `php artisan schedule:run`, exécuté chaque minute par le
| cron O2switch. Sur hébergement mutualisé (pas de worker permanent), on
| draine la file d'attente ici plutôt que via un `queue:work` daemon.
*/

// Traite la file (newsletters, notifications). --stop-when-empty pour rendre
// la main au cron, --max-time pour ne jamais dépasser la minute suivante.
Schedule::command('queue:work --stop-when-empty --max-time=50 --tries=3')
    ->everyMinute()
    // Verrou de 5 min (défaut : 24 h). Si l'hébergeur tue le process, le
    // mutex expire vite au lieu de bloquer la file toute une journée.
    ->withoutOverlapping(5);

// Nettoyage quotidien des jetons de réinitialisation de mot de passe expirés.
Schedule::command('auth:clear-resets')->daily();

// Purge des jobs échoués (> 7 jours) et des batchs terminés (> 48 h).
Schedule::command('queue:prune-failed --hours=168')->daily();
Schedule::command('queue:prune-batches --hours=48')->daily();

// Sauvegarde quotidienne de la BDD vers R2 (config/backup.php), puis rotation
// et contrôle de santé. Mail envoyé uniquement en cas d'échec.
Schedule::command('backup:run --only-db')->dailyAt('02:00');
Schedule::command('backup:clean')->dailyAt('03:00');
Schedule::command('backup:monitor')->dailyAt('03:30');
