#!/usr/bin/env bash
# deploy.sh — Script de déploiement O2switch
# Exécuté sur le serveur par GitHub Actions (ou manuellement via SSH)
# Usage : bash scripts/deploy.sh

set -euo pipefail

PHP="php8.2"
COMPOSER="$PHP $(which composer)"

echo "========================================"
echo " saFoulee — Déploiement O2switch"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# 1. Récupération du code
echo "[1/8] git pull origin main"
git fetch origin main
git checkout main
git pull origin main

# 2. Dépendances PHP (sans dev, optimisé)
echo "[2/8] composer install --no-dev"
$COMPOSER install --no-dev --optimize-autoloader --no-interaction --no-ansi

# 3. Mode maintenance
echo "[3/8] Mise en maintenance"
$PHP artisan down --retry=60 || true

# 4. Migrations
echo "[4/8] php artisan migrate --force"
$PHP artisan migrate --force

# 5. Cache production
echo "[5/8] Cache config / routes / views"
$PHP artisan config:cache
$PHP artisan route:cache
$PHP artisan view:cache
$PHP artisan event:cache

# 6. Lien stockage public (si nécessaire)
echo "[6/8] storage:link"
$PHP artisan storage:link --quiet || true

# 7. Redémarrage queue workers
echo "[7/8] queue:restart"
$PHP artisan queue:restart

# 8. Retour en ligne
echo "[8/8] Retour en ligne"
$PHP artisan up

echo ""
echo "========================================"
echo " Déploiement terminé avec succès"
echo "========================================"
