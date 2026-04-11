# Déploiement Backend — O2switch

Ce document décrit la configuration manuelle à effectuer une seule fois sur O2switch (cPanel) pour mettre le backend Laravel en production.

## Prérequis

- Domaine acheté (ex: `safoulee.fr`)
- Accès cPanel O2switch
- Clé SSH générée en local

---

## 1. Configuration SSH

### Générer une clé SSH dédiée au déploiement

```bash
ssh-keygen -t ed25519 -C "github-actions-safoulee" -f ~/.ssh/safoulee_deploy
```

### Ajouter la clé publique sur O2switch

1. cPanel → **Accès SSH** → **Gérer les clés SSH**
2. Importer la clé publique (`safoulee_deploy.pub`)
3. Autoriser la clé

### Ajouter les secrets GitHub

Dans le repository GitHub → **Settings → Secrets and variables → Actions** :

| Secret                     | Valeur                                         |
| -------------------------- | ---------------------------------------------- |
| `O2SWITCH_SSH_HOST`        | IP ou hostname O2switch                        |
| `O2SWITCH_SSH_USERNAME`    | Nom d'utilisateur cPanel                       |
| `O2SWITCH_SSH_PRIVATE_KEY` | Contenu de `safoulee_deploy` (clé privée)      |
| `O2SWITCH_SSH_PORT`        | `22` (ou port SSH O2switch)                    |
| `O2SWITCH_DEPLOY_PATH`     | Chemin absolu ex: `/home/user/api.safoulee.fr` |
| `API_DOMAIN`               | `api.safoulee.fr`                              |

---

## 2. Sous-domaine API

1. cPanel → **Sous-domaines**
2. Créer `api.safoulee.fr` pointant vers `/home/user/api.safoulee.fr/public`
3. O2switch provisionne automatiquement le SSL Let's Encrypt (24-48h max)

> Vérifier que HTTPS est actif : `curl -I https://api.safoulee.fr/up`

---

## 3. Déploiement initial (une seule fois)

Se connecter en SSH et exécuter :

```bash
ssh user@o2switch_ip

# Cloner le repository dans le dossier du sous-domaine
git clone https://github.com/NotUndefind/saFoulee.git /home/user/api.safoulee.fr
cd /home/user/api.safoulee.fr/backend

# Copier et compléter le fichier d'environnement
cp .env.example .env
nano .env   # Remplir APP_KEY, DB_*, MAIL_*, R2_*, FRONTEND_URL

# Générer la clé applicative
php8.2 artisan key:generate

# Installer les dépendances
php8.2 $(which composer) install --no-dev --optimize-autoloader

# Migrations initiales
php8.2 artisan migrate --force

# Cache
php8.2 artisan config:cache
php8.2 artisan route:cache
php8.2 artisan storage:link
```

### Variables .env production (valeurs sensibles)

```dotenv
APP_NAME="La Neuville TAF sa Foulée"
APP_ENV=production
APP_KEY=              # généré par key:generate
APP_DEBUG=false
APP_URL=https://api.safoulee.fr

DB_CONNECTION=mysql
DB_HOST=localhost     # O2switch : toujours localhost
DB_PORT=3306
DB_DATABASE=          # créer via cPanel → Bases de données MySQL
DB_USERNAME=
DB_PASSWORD=

FRONTEND_URL=https://safoulee.fr   # ou URL Vercel

MAIL_MAILER=resend
RESEND_API_KEY=
MAIL_FROM_ADDRESS=noreply@safoulee.fr
MAIL_FROM_NAME="sa Foulée"

FILESYSTEM_DISK=r2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=safoulee-documents
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
```

---

## 4. Cron O2switch — Laravel Scheduler

1. cPanel → **Tâches Cron**
2. Ajouter une tâche **chaque minute** :

```
* * * * * cd /home/user/api.safoulee.fr/backend && php8.2 artisan schedule:run >> /dev/null 2>&1
```

> Le scheduler gère ensuite les tâches internes (ex: queue monitor, nettoyage tokens expirés).

---

## 5. Queue Workers (optionnel)

O2switch (shared hosting) ne supporte pas les workers persistants. La queue `database` est traitée via le cron :

```
* * * * * cd /home/user/api.safoulee.fr/backend && php8.2 artisan queue:work --stop-when-empty --max-time=55 >> /dev/null 2>&1
```

---

## 6. Vérification post-déploiement

```bash
# Health check Laravel
curl https://api.safoulee.fr/up
# Réponse attendue : HTTP 200

# Test endpoint public
curl https://api.safoulee.fr/api/v1/posts
# Réponse attendue : HTTP 200, JSON

# Test CORS (depuis le domaine Vercel)
curl -H "Origin: https://safoulee.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS https://api.safoulee.fr/api/v1/posts -I
# Réponse attendue : Access-Control-Allow-Origin: https://safoulee.vercel.app
```

---

## 7. Déploiements suivants (automatique)

Après la configuration initiale, chaque push sur `main` déclenche automatiquement :

1. **backend.yml** — CI (tests + lint)
2. **deploy-backend.yml** — déploiement sur O2switch (si CI vert)

Le workflow exécute `backend/scripts/deploy.sh` sur le serveur : `git pull`, `composer install`, `migrate --force`, `config:cache`, `route:cache`, `queue:restart`.
