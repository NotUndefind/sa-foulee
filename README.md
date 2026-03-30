# La Neuville TAF sa Foulée

Application web mobile-first pour l'association de running **La Neuville TAF sa Foulée**.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (TypeScript, App Router) |
| Styles | Tailwind CSS + Motion.dev |
| Backend | Laravel 11 (PHP 8.2+) |
| Base de données | MySQL 8.0 |
| Stockage documents | Cloudflare R2 |
| Chat temps réel | Pusher |
| Emails | Resend |
| Hébergement frontend | Vercel |
| Hébergement backend | Shared hosting (O2switch) |

## Structure du projet

```
saFoulee/
├── frontend/          # Next.js 14 (TypeScript)
│   ├── src/
│   │   ├── app/       # App Router (public, auth, dashboard)
│   │   ├── components/
│   │   ├── lib/       # API client, Pusher
│   │   ├── store/     # Zustand (auth, notifications)
│   │   └── types/     # TypeScript interfaces
│   └── .env.example
├── backend/           # Laravel 11
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/
│   │   ├── Models/
│   │   ├── Policies/
│   │   ├── Services/
│   │   └── Jobs/
│   ├── routes/api.php
│   └── .env.example
├── docs/              # Documentation BMAD
│   ├── product-brief-saFoulee-2026-03-07.md
│   ├── prd-saFoulee-2026-03-07.md
│   ├── architecture-saFoulee-2026-03-07.md
│   ├── sprint-plan-saFoulee-2026-03-07.md
│   └── sprint-status.yaml
└── .github/workflows/ # CI/CD
```

## Setup local

### Prérequis

- Node.js 22+
- PHP 8.2+
- Composer 2+
- MySQL 8.0
- Compte Cloudflare R2 (documents)
- Compte Pusher (chat)
- Compte Resend (emails)

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Remplir les variables dans .env.local
npm install
npm run dev
# → http://localhost:3000
```

### Backend

```bash
cd backend
cp .env.example .env
# Remplir les variables dans .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
# → http://localhost:8000
```

## Conventions de code

### Frontend (TypeScript)

- **ESLint** : `npm run lint`
- **Prettier** : `npm run format`
- Composants en PascalCase : `EventCard.tsx`
- Fonctions/variables en camelCase
- Types définis dans `src/types/index.ts`
- Pas de `any` TypeScript

### Backend (PHP)

- **Laravel Pint** (PSR-12) : `./vendor/bin/pint`
- Controllers fins → logique dans les Services
- Toujours utiliser les Form Requests pour la validation
- Toujours utiliser les Policies pour l'autorisation
- Eloquent uniquement (pas de SQL brut sauf cas exceptionnel)

## Tests

```bash
# Frontend
cd frontend && npm run test

# Backend
cd backend && php artisan test
```

Couverture cible : 70% sur le code critique (auth, permissions, upload).

## Déploiement

### Frontend (automatique)
Push sur `main` → Vercel déploie automatiquement.

### Backend (GitHub Actions)
Push sur `main` → lint + tests → rsync via SSH vers O2switch.

**Secrets GitHub requis :**
- `SSH_HOST` — IP ou domaine du serveur
- `SSH_USERNAME` — Utilisateur SSH
- `SSH_PRIVATE_KEY` — Clé privée SSH
- `DEPLOY_PATH` — Chemin de déploiement sur le serveur
- `NEXT_PUBLIC_API_URL` — URL de l'API en production
- `NEXT_PUBLIC_PUSHER_KEY` — Clé Pusher

## Documentation

Voir le dossier `docs/` pour la documentation complète :

- **Product Brief** — Vision et contexte
- **PRD** — Requirements fonctionnels et non-fonctionnels
- **Architecture** — Stack, composants, API, data model
- **Sprint Plan** — Stories et planning
- **Sprint Status** — Avancement du développement

## Charte graphique

| Élément | Valeur |
|---------|--------|
| Couleur principale | `#FB3936` (rouge officiel) |
| Couleur d'accent | `#FD6563` (rouge clair) |
| Fond | `#FFFFFF` (blanc) |
| Police | Inter (Google Fonts) |
| Style | Mobile-first, ludique et dynamique |

---

*Créé avec [BMAD Method v6](https://github.com/bmadcode/bmad-method)*
