# 00 — Synthèse de l'audit saFoulée

**Date** : 11 juin 2026 · **Périmètre** : monorepo complet (frontend Next.js 16 / Vercel, backend Laravel 11 / O2switch mutualisé, MySQL 8, CI GitHub Actions).
**Méthode** : lecture du code + outils exécutés (`composer audit`, `npm audit`, Larastan, ESLint, `tsc --noEmit`, `next build`, `artisan route:list`). Chaque constat des rapports cite une preuve `fichier:ligne`. Accessibilité/RGAA hors périmètre (choix assumé).

## Verdict global

Le projet est **sain dans ses fondations** (migrations exemplaires, contrôles d'ownership corrects — aucun IDOR confirmé, CI structurée, ISR déjà en place sur la home) mais **ses garde-fous sont débranchés** : 165 erreurs TypeScript masquées par `ignoreBuildErrors`, 64 erreurs Larastan gelées en baseline, CI « verte » avec zéro test, et des features à moitié retirées (14 routes vers des controllers supprimés, pusher-js mort). Les risques les plus concrets pour une asso : **emails de newsletter potentiellement jamais envoyés**, **aucune sauvegarde BDD maîtrisée**, **XSS stocké sur le blog** combiné au token en localStorage, et un **site quasi invisible des moteurs de recherche**.

## Scoring par section

| Section | Rapport | État | 🔴 | 🟠 | 🟡 | Lecture rapide |
| --- | --- | --- | --- | --- | --- | --- |
| Architecture & qualité | [01-architecture.md](01-architecture.md) | 🟠 | 3 | 4 | 3 | Fondations BDD/models solides, garde-fous neutralisés, conventions CLAUDE.md non appliquées |
| Sécurité | [02-securite.md](02-securite.md) | 🟠 | 1 | 5 | 4 | Pas d'IDOR ; chaîne XSS blog → token localStorage à fermer, CVE à patcher |
| Performance | [03-performance.md](03-performance.md) | 🟢 | 0 | 2 | 4 | N+1 corrigeables en une ligne, build sain, assets légers |
| SEO | [04-seo.md](04-seo.md) | 🔴 | 2 | 2 | 2 | Contenu invisible des crawlers, aucune URL d'article |
| Déploiement & exploitation | [05-deploiement-exploitation.md](05-deploiement-exploitation.md) | 🔴 | 2 | 3 | 3 | Newsletter en file sans worker garanti, zéro backup, zéro monitoring |

## Top 10 priorisé (impact × effort)

| # | Action | Source | Sévérité | Effort |
| --- | --- | --- | --- | --- |
| 1 | `npm audit fix` (Next.js HIGH) + `composer update` (9 advisories dont symfony/mime HIGH) | 02 | 🔴 | S |
| 2 | Vérifier le cron `queue:work` en prod (`SELECT COUNT(*) FROM jobs`) — la newsletter est marquée « envoyée » avant tout envoi réel | 05 | 🔴 | S |
| 3 | Mettre en place les sauvegardes BDD (spatie/laravel-backup → R2) + `mysqldump` avant `migrate --force` | 05 | 🔴 | M |
| 4 | Restaurer les génériques TypeScript supprimés (35 fichiers, via `git log -p`) puis retirer `ignoreBuildErrors: true` | 01 | 🔴 | M |
| 5 | Supprimer les 14 routes mortes chat/notifications/strava (`route:cache` actuellement impossible, 500 garanties) | 01 | 🔴 | S |
| 6 | Sanitiser le HTML Tiptap (HTMLPurifier côté Laravel + DOMPurify au rendu) — ferme la chaîne XSS → vol de token localStorage | 02 | 🟠 | M |
| 7 | Rate limiting sur `register` / `forgot-password` / `reset-password` (`throttle:6,1`) | 02 | 🟠 | S |
| 8 | Passer `/blog`, `/evenements`, `/activites` en fetch serveur (ISR comme la home) et créer `/blog/[slug]` avec `generateMetadata` | 03+04 | 🔴 | M |
| 9 | Ajouter `sitemap.ts`, `robots.ts` (+ noindex dashboard), corriger `NEXT_PUBLIC_APP_URL` (safoulee.fr ≠ prod) | 04 | 🟠 | S |
| 10 | Premiers tests : 6 tests Pest (auth, RBAC, ownership, endpoints publics) + installer Vitest (scripts présents, paquet absent) | 05 | 🟠 | M |

## Roadmap proposée

**Semaine 1 — Quick wins sécurité/exploitation (tout en S)** : actions 1, 2, 5, 7 + en-têtes de sécurité étendus à toutes les pages (CSP) + secret webhook HelloAsso obligatoire hors local.

**Semaines 2-3 — Fiabilité** : actions 3, 4, 6, 10 + brancher Sentry (gratuit) + corriger `sent_at` de la newsletter.

**Mois suivant — Visibilité & dette** : actions 8, 9 + JSON-LD Event, puis résorption progressive de la baseline Larastan, migration des 15 `validate()` inline vers des Form Requests, et introduction de Policies/API Resources sur les ressources les plus chaudes (Event, BudgetEntry).

## Points forts à préserver

- Migrations avec FK contraintes et indexes alignés sur les requêtes réelles (01)
- Contrôles d'ownership systématiques — aucun IDOR trouvé ; `hash_equals` sur le webhook, `strava_token` chiffré, URLs R2 signées 15 min (02)
- Leaderboard en agrégat SQL + `Cache::remember`, ISR sur la home : les bons patterns existent déjà, il faut les généraliser (03)
- CI backend complète (Pint + Larastan + déploiement conditionné), `.env` hors webroot, mode maintenance + health check (05)
