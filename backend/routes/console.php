<?php

use Illuminate\Support\Facades\Schedule;

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
    ->withoutOverlapping();

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
