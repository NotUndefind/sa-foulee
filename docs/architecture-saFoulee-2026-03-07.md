# System Architecture: saFoulee

**Date:** 2026-03-07
**Architect:** julesbourin
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This document defines the system architecture for saFoulee. It provides the technical blueprint for implementation, addressing all functional and non-functional requirements from the PRD.

**Related Documents:**
- Product Requirements Document: `docs/prd-saFoulee-2026-03-07.md`
- Product Brief: `docs/product-brief-saFoulee-2026-03-07.md`

---

## Executive Summary

saFoulee adopte une architecture **SPA découplée + API REST** : un frontend Next.js déployé sur Vercel communique avec un backend Laravel hébergé sur shared hosting via une API REST versionnée. Le chat temps réel est délégué à Pusher (free tier). Les documents des adhérents sont stockés sur Cloudflare R2 (S3-compatible, gratuit). Cette architecture est simple, économique, maintenable par un développeur solo, et extensible pour accueillir de nouveaux contributeurs.

---

## Architectural Drivers

Les NFRs suivants influencent le plus fortement les décisions architecturales :

1. **NFR-002 (Sécurité)** — Documents personnels chiffrés, accès par URLs signées, JWT. → Impose une architecture API avec gestion fine des autorisations.
2. **NFR-003 (RGPD)** — Données hébergées en Europe, droit à la suppression. → Choix des services (Cloudflare R2 EU, hébergeur européen).
3. **NFR-004 (Fiabilité)** — Aucune perte de document. → Stockage externe dédié (R2) avec sauvegardes, indépendant du serveur web.
4. **NFR-007 (Maintenabilité)** — Code structuré pour développeurs futurs. → Architecture en couches claires, conventions strictes, documentation.
5. **NFR-008 (Coût)** — Budget minimal. → Vercel free tier, shared hosting, Pusher free tier, Cloudflare R2 free tier.

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│              Mobile (iOS/Android browsers)                  │
│              Desktop (Chrome, Firefox, Safari)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
  ┌───────────────┐ ┌────────────┐  ┌──────────────┐
  │  Next.js SPA  │ │  Pusher    │  │ Cloudflare R2│
  │  (Vercel)     │ │ (WebSocket)│  │ (Documents)  │
  └───────┬───────┘ └─────┬──────┘  └──────────────┘
          │               │
          │ REST API       │ Events (broadcast)
          ▼               │
  ┌───────────────────────┴──────┐
  │     Laravel REST API         │
  │     (Shared hosting)         │
  │                              │
  │  ┌──────────┐ ┌──────────┐  │
  │  │  MySQL   │ │  Queue   │  │
  │  │   DB     │ │  (Jobs)  │  │
  │  └──────────┘ └──────────┘  │
  └──────────────────────────────┘
          │
          ▼
  ┌───────────────┐
  │ Resend/SMTP   │
  │ (Emails)      │
  └───────────────┘
```

### Architecture Diagram

```
┌─────────────────── VERCEL (CDN global) ────────────────────┐
│                                                             │
│  Next.js 14+ (App Router, TypeScript)                      │
│  ├── /app                                                   │
│  │   ├── (public)/ — pages publiques (blog, events)        │
│  │   ├── (auth)/ — login, register                         │
│  │   └── (dashboard)/ — espace membre (protégé)            │
│  ├── /components — UI (Tailwind + Motion.dev)               │
│  ├── /lib — API client, auth helpers                        │
│  └── /types — TypeScript interfaces                         │
│                                                             │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS REST (JSON)
                             │ Authorization: Bearer {JWT}
                             ▼
┌──────────── SHARED HOSTING (O2switch) ─────────────────────┐
│                                                             │
│  Laravel 11 (PHP 8.2+)                                     │
│  ├── app/                                                   │
│  │   ├── Http/Controllers/Api/v1/                          │
│  │   ├── Http/Middleware/ (auth, role, CORS)               │
│  │   ├── Models/                                           │
│  │   ├── Services/ (logique métier)                        │
│  │   ├── Policies/ (autorisation par rôle)                 │
│  │   └── Jobs/ (emails async, notifications)               │
│  ├── database/migrations/                                   │
│  └── routes/api.php                                        │
│                                                             │
│  MySQL 8.0                                                  │
│  Queue : Database driver (fichiers cron)                    │
│                                                             │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌──────────────┐ ┌──────────┐ ┌─────────────┐
     │Cloudflare R2 │ │  Pusher  │ │   Resend    │
     │ (documents)  │ │ (chat RT)│ │  (emails)   │
     └──────────────┘ └──────────┘ └─────────────┘
```

### Architectural Pattern

**Pattern:** Decoupled SPA + REST API (Layered Architecture)

**Rationale:** Pour un projet Level 2 avec un développeur solo, une architecture découplée frontend/backend offre la séparation de responsabilités optimale sans la complexité des microservices. Laravel avec une API REST versionnée est idiomatique et maintenable. Next.js sur Vercel offre des performances CDN gratuites. Les services tiers (Pusher, R2, Resend) externalisent les problèmes complexes (temps réel, stockage, emails) sans coût de maintenance.

---

## Technology Stack

### Frontend

**Choice:** Next.js 14+ (App Router, TypeScript)

**Rationale:** SSR/SSG pour SEO sur les pages publiques (blog, événements), hydratation côté client pour l'espace membre. TypeScript impose la rigueur nécessaire pour accueillir de futurs développeurs. App Router permet le code-splitting automatique et les Server Components pour la performance.

**Libraries:**
- `tailwindcss` — Styles utilitaires, mobile-first par défaut
- `motion` (Motion.dev) — Animations fluides et performantes
- `axios` ou `fetch` natif — Client API REST
- `zustand` — State management léger (auth, notifications)
- `react-hook-form` + `zod` — Formulaires avec validation typée
- `date-fns` — Manipulation des dates
- `pusher-js` — Client WebSocket pour le chat

**Trade-offs:**
- ✓ SSR/SSG gratuit sur Vercel, CDN global
- ✓ TypeScript = meilleure maintenabilité
- ✗ App Router : courbe d'apprentissage plus élevée que Pages Router

---

### Backend

**Choice:** Laravel 11 (PHP 8.2+)

**Rationale:** Laravel est le framework PHP le plus structuré et maintenable. Eloquent ORM, Policies pour RBAC, Sanctum pour JWT/token auth, Jobs pour les tâches async — tout est inclus. Compatible shared hosting. La communauté et la documentation facilitent l'onboarding de nouveaux développeurs.

**Key packages:**
- `laravel/sanctum` — Authentification API (tokens)
- `spatie/laravel-permission` — Gestion RBAC (rôles et permissions)
- `spatie/laravel-media-library` — Gestion des uploads et fichiers
- `league/flysystem-aws-s3-v3` — Adaptateur Cloudflare R2
- `pusher/pusher-php-server` — Broadcast vers Pusher
- `laravel/horizon` (optionnel v2) — Dashboard de queues

**Trade-offs:**
- ✓ Très lisible, conventions fortes, excellent pour onboarding
- ✓ Compatible shared hosting
- ✗ Shared hosting : pas de Redis, pas de WebSocket natif → mitigé par Pusher + DB queue

---

### Database

**Choice:** MySQL 8.0

**Rationale:** Standard sur les shared hosting, natif dans Laravel, suffisant pour les besoins relationnels de saFoulee (50 membres, données structurées). Les relations entre membres, événements, documents et performances sont bien modélisées en relationnel.

**Configuration:**
- Charset : `utf8mb4` (support emojis)
- Collation : `utf8mb4_unicode_ci`
- Indexes sur toutes les foreign keys et colonnes filtrées fréquemment

---

### Infrastructure

**Frontend:** Vercel (free tier)
- Déploiement automatique depuis GitHub
- CDN global, HTTPS automatique
- Previews par PR

**Backend:** Shared hosting O2switch (ou équivalent)
- PHP 8.2+, MySQL 8.0
- HTTPS via Let's Encrypt
- Cron jobs pour les queues Laravel

**Storage:** Cloudflare R2 (free tier : 10 GB/mois gratuits)
- Compatible S3 API
- Datacenters EU disponibles (conformité RGPD)
- Pas de frais d'egress (avantage majeur vs AWS S3)

---

### Third-Party Services

| Service | Usage | Tier | Coût |
|---------|-------|------|------|
| **Pusher** | Chat WebSocket temps réel | Free (200 connexions, 200k messages/jour) | 0€ |
| **Cloudflare R2** | Stockage documents | Free (10 GB) | 0€ |
| **Resend** | Emails transactionnels | Free (3000 emails/mois) | 0€ |
| **Strava API** | Sync activités sportives | Free (usage limité) | 0€ (conditionnel) |
| **Vercel** | Hébergement frontend | Free (Hobby) | 0€ |

---

### Development & Deployment

- **Version control:** Git + GitHub
- **CI/CD Frontend:** Vercel (auto-deploy sur push `main`)
- **CI/CD Backend:** GitHub Actions → rsync/SSH vers shared hosting
- **Linting Frontend:** ESLint + Prettier
- **Linting Backend:** PHP-CS-Fixer (PSR-12)
- **Tests:** Pest (Laravel) + Jest/Vitest (Next.js)

---

## System Components

### Component 1 — Next.js Frontend

**Purpose:** Interface utilisateur SPA/SSR servie via CDN

**Responsibilities:**
- Rendu des pages publiques (SSG : blog, événements, présentation)
- Rendu de l'espace membre (SSR/CSR : dashboard, profil, chat)
- Communication avec l'API Laravel via REST
- Connexion WebSocket via Pusher-js pour le chat
- Gestion de l'état auth (tokens JWT en cookie httpOnly)

**Interfaces:**
- HTTPS vers l'API Laravel (`/api/v1/*`)
- WebSocket vers Pusher (`wss://ws-eu.pusher.com`)

**FRs Addressed:** FR-001, FR-004, FR-005, FR-006, FR-007, FR-009, FR-010

---

### Component 2 — Laravel REST API

**Purpose:** Toute la logique métier, exposition d'une API REST versionnée

**Responsibilities:**
- Authentification et gestion des tokens (Sanctum)
- Application des règles métier et des politiques d'accès (Policies)
- CRUD sur toutes les ressources (membres, documents, événements, etc.)
- Dispatch des events vers Pusher (broadcast)
- Envoi des jobs en queue (emails, notifications)
- Génération des URLs signées pour accès documents R2

**Interfaces:**
- REST API `https://api.safoulee.fr/api/v1/*`
- Connexion MySQL (PDO)
- SDK Cloudflare R2 (S3-compatible)
- SDK Pusher PHP
- SMTP Resend

**FRs Addressed:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-011, FR-012

---

### Component 3 — MySQL Database

**Purpose:** Persistance de toutes les données relationnelles

**Responsibilities:**
- Stockage des utilisateurs, rôles, événements, sessions, posts, performances
- Transactions ACID pour les opérations critiques
- Indexes pour les requêtes fréquentes

**FRs Addressed:** Tous les FRs impliquant de la persistance

---

### Component 4 — Cloudflare R2 (Document Storage)

**Purpose:** Stockage sécurisé des documents des adhérents

**Responsibilities:**
- Stockage des fichiers (licences, fiches d'adhésion, certificats médicaux)
- Accès via URLs signées (expiration 15 minutes)
- Pas d'accès public direct aux fichiers

**FRs Addressed:** FR-002

---

### Component 5 — Pusher (Real-time WebSocket)

**Purpose:** Messagerie temps réel pour le chat entre membres

**Responsibilities:**
- Gestion des connexions WebSocket
- Distribution des messages dans les canaux (général, par événement)
- Présence des utilisateurs connectés (online/offline)

**FRs Addressed:** FR-009

---

### Component 6 — Resend (Email Service)

**Purpose:** Envoi des emails transactionnels

**Responsibilities:**
- Notifications de documents manquants/expirés
- Email de bienvenue à l'inscription
- Reset de mot de passe
- Annulation/modification d'événement

**FRs Addressed:** FR-001, FR-012

---

## Data Architecture

### Data Model

```
users
├── id (PK, bigint unsigned)
├── email (unique, varchar 255)
├── password (varchar 255, bcrypt)
├── first_name (varchar 100)
├── last_name (varchar 100)
├── avatar (varchar 500, nullable — URL R2)
├── bio (text, nullable)
├── strava_id (varchar 100, nullable)
├── strava_token (text, nullable, encrypted)
├── email_verified_at (timestamp, nullable)
├── created_at / updated_at

roles (via spatie/laravel-permission)
├── id, name (admin|founder|coach|bureau|member), guard_name

user_documents
├── id (PK)
├── user_id (FK → users)
├── type (enum: license|registration|medical_certificate|other)
├── filename (varchar 255)
├── r2_path (varchar 500)
├── status (enum: pending|valid|expired)
├── expires_at (date, nullable)
├── created_at / updated_at

events
├── id (PK)
├── title (varchar 255)
├── description (text)
├── type (enum: race|outing|competition|other)
├── event_date (datetime)
├── location (varchar 255)
├── created_by (FK → users)
├── is_public (boolean, default true)
├── created_at / updated_at

event_registrations
├── id (PK)
├── event_id (FK → events)
├── user_id (FK → users)
├── registered_at (timestamp)

training_sessions
├── id (PK)
├── title (varchar 255)
├── type (enum: running|interval|fartlek|recovery|strength|other)
├── distance_km (decimal 5,2, nullable)
├── duration_min (int, nullable)
├── intensity (enum: low|medium|high)
├── exercises (json, nullable — tableau d'exercices)
├── description (text, nullable)
├── is_template (boolean, default false)
├── created_by (FK → users)
├── published_at (timestamp, nullable)
├── created_at / updated_at

session_participations
├── id (PK)
├── session_id (FK → training_sessions)
├── user_id (FK → users)
├── participated_at (timestamp)

posts
├── id (PK)
├── title (varchar 255)
├── content (longtext — rich text)
├── image (varchar 500, nullable — URL R2)
├── author_id (FK → users)
├── is_pinned (boolean, default false)
├── published_at (timestamp, nullable)
├── created_at / updated_at

comments
├── id (PK)
├── post_id (FK → posts)
├── user_id (FK → users)
├── content (text)
├── created_at / updated_at

performances
├── id (PK)
├── user_id (FK → users)
├── strava_activity_id (varchar 100, nullable, unique)
├── distance_km (decimal 8,3)
├── duration_sec (int)
├── elevation_m (int, nullable)
├── date (date)
├── source (enum: strava|manual)
├── created_at / updated_at

chat_messages
├── id (PK)
├── channel (varchar 100 — 'general' ou 'event.{id}')
├── user_id (FK → users)
├── content (text)
├── created_at

notifications
├── id (uuid PK — Laravel default)
├── type (varchar 255)
├── notifiable_type / notifiable_id (morph)
├── data (json)
├── read_at (timestamp, nullable)
├── created_at / updated_at

notification_preferences
├── id (PK)
├── user_id (FK → users)
├── channel (enum: in_app|email)
├── type (varchar 100)
├── enabled (boolean, default true)
```

### Database Design

**Indexes clés :**
```sql
-- Performance des requêtes fréquentes
INDEX idx_performances_user_date ON performances(user_id, date DESC);
INDEX idx_events_date ON events(event_date DESC);
INDEX idx_posts_published ON posts(published_at DESC);
INDEX idx_chat_channel ON chat_messages(channel, created_at DESC);
INDEX idx_docs_user_status ON user_documents(user_id, status);
INDEX idx_notifications_user ON notifications(notifiable_id, read_at);
```

**Soft deletes :** activés sur `users`, `posts`, `events` (traçabilité RGPD)

### Data Flow

**Flux lecture (GET) :**
```
Client → Next.js → Laravel API → MySQL → JSON response → Next.js → Render
```

**Flux upload document :**
```
Client → Next.js → Laravel API → Validation → Upload R2 → Enregistrement MySQL → Response
```

**Flux chat :**
```
Client → Next.js → Laravel API → Persist MySQL → Broadcast Pusher → Tous les clients connectés
```

**Flux email async :**
```
Laravel → Job dispatch → Database queue → Cron worker → Resend API → Email
```

---

## API Design

### API Architecture

- **Style :** REST
- **Versioning :** `/api/v1/` (URL versioning)
- **Format :** JSON (Content-Type: application/json)
- **Auth :** Bearer token (Laravel Sanctum)
- **Pagination :** Cursor-based pour les listes longues
- **Erreurs :** Format uniforme `{ "message": "...", "errors": {...} }`

### Endpoints

```
# AUTHENTIFICATION
POST   /api/v1/auth/register           # Inscription
POST   /api/v1/auth/login              # Connexion → JWT token
POST   /api/v1/auth/logout             # Révocation du token
POST   /api/v1/auth/refresh            # Refresh du token
POST   /api/v1/auth/forgot-password    # Demande reset
POST   /api/v1/auth/reset-password     # Reset avec token email

# PROFIL
GET    /api/v1/me                      # Profil connecté
PATCH  /api/v1/me                      # Modifier son profil
DELETE /api/v1/me                      # Supprimer son compte (RGPD)

# UTILISATEURS (Admin)
GET    /api/v1/users                   # Liste membres [Admin]
GET    /api/v1/users/{id}              # Profil membre
PATCH  /api/v1/users/{id}/role        # Modifier rôle [Admin]
DELETE /api/v1/users/{id}              # Supprimer membre [Admin]
GET    /api/v1/users/export            # Export CSV [Admin]

# DOCUMENTS
GET    /api/v1/users/{id}/documents    # Liste documents [self|Admin]
POST   /api/v1/users/{id}/documents    # Upload document [self|Admin]
GET    /api/v1/documents/{id}/download # URL signée [self|Admin]
DELETE /api/v1/documents/{id}          # Supprimer document [self|Admin]

# ÉVÉNEMENTS
GET    /api/v1/events                  # Liste (public)
POST   /api/v1/events                  # Créer [Bureau+]
GET    /api/v1/events/{id}             # Détail (public)
PATCH  /api/v1/events/{id}             # Modifier [Bureau+]
DELETE /api/v1/events/{id}             # Supprimer [Bureau+]
POST   /api/v1/events/{id}/register    # S'inscrire [Membre+]
DELETE /api/v1/events/{id}/register    # Se désinscrire [Membre+]
GET    /api/v1/events/{id}/participants # Participants [Membre+]

# SESSIONS D'ENTRAÎNEMENT
GET    /api/v1/sessions                # Liste [Membre+]
POST   /api/v1/sessions                # Créer [Entraîneur+]
GET    /api/v1/sessions/{id}           # Détail [Membre+]
PATCH  /api/v1/sessions/{id}           # Modifier [Entraîneur+]
DELETE /api/v1/sessions/{id}           # Supprimer [Entraîneur+]
GET    /api/v1/sessions/templates      # Templates [Entraîneur+]
POST   /api/v1/sessions/{id}/participate # Marquer participation [Membre+]

# BLOG / ACTUALITÉS
GET    /api/v1/posts                   # Liste (public)
POST   /api/v1/posts                   # Créer [Bureau+]
GET    /api/v1/posts/{id}              # Détail (public)
PATCH  /api/v1/posts/{id}              # Modifier [Bureau+]
DELETE /api/v1/posts/{id}              # Supprimer [Bureau+]
PATCH  /api/v1/posts/{id}/pin          # Épingler [Admin]
GET    /api/v1/posts/{id}/comments     # Commentaires [public]
POST   /api/v1/posts/{id}/comments     # Commenter [Membre+]
DELETE /api/v1/comments/{id}           # Supprimer commentaire [self|Admin]

# PERFORMANCES & LEADERBOARD
GET    /api/v1/leaderboard             # Classement [Membre+]
GET    /api/v1/users/{id}/performances # Perfs individuel [self|Admin]
POST   /api/v1/performances            # Saisie manuelle [self]

# STRAVA
GET    /api/v1/strava/connect          # OAuth redirect
GET    /api/v1/strava/callback         # OAuth callback
DELETE /api/v1/strava/disconnect       # Déconnecter Strava [self]

# CHAT
GET    /api/v1/chat/{channel}/messages # Historique [Membre+]
POST   /api/v1/chat/{channel}/messages # Envoyer message [Membre+]
GET    /api/v1/chat/pusher/auth        # Auth Pusher channels privés

# NOTIFICATIONS
GET    /api/v1/notifications           # Liste [self]
PATCH  /api/v1/notifications/{id}/read # Marquer lu [self]
PATCH  /api/v1/notifications/read-all  # Tout marquer lu [self]
GET    /api/v1/notifications/preferences # Préférences [self]
PATCH  /api/v1/notifications/preferences # MAJ préférences [self]
```

### Authentication & Authorization

**Auth :** Laravel Sanctum (tokens en base de données)
- Token d'accès : durée de vie 24h, stocké en `httpOnly cookie` côté Next.js
- Révocation : `DELETE /auth/logout` supprime le token en BDD

**Authorization :** Laravel Policies + Spatie Permission
```
Rôles (ordre hiérarchique) :
admin > founder > coach > bureau > member

Chaque ressource a une Policy :
- EventPolicy : create() → role in [admin, founder, coach, bureau]
- DocumentPolicy : view() → owner OR admin
- PostPolicy : create() → role in [admin, founder, coach, bureau]

Middleware chaîné :
Route → auth:sanctum → CheckRole(min: 'member') → Controller → Policy
```

**URLs signées pour documents :**
```php
// Génération d'une URL temporaire R2 (15 min)
Storage::disk('r2')->temporaryUrl($path, now()->addMinutes(15));
```

---

## Non-Functional Requirements Coverage

### NFR-001: Performance

**Requirement:** Pages < 2s sur mobile 4G, API < 500ms pour 95% des requêtes.

**Architecture Solution:**
- Next.js SSG pour les pages publiques (blog, événements) → HTML pré-rendu sur CDN Vercel, 0ms serveur
- Lazy loading des images (Next.js `<Image>`)
- Pagination cursor-based sur toutes les listes
- Indexes MySQL sur les colonnes les plus filtrées
- Réponses JSON compressées (gzip via serveur web)

**Validation:** Lighthouse Mobile ≥ 80, monitoring des temps de réponse Laravel via logs.

---

### NFR-002: Sécurité

**Requirement:** JWT, HTTPS, chiffrement documents, accès par rôle, journalisation.

**Architecture Solution:**
- Sanctum tokens en BDD (révocables instantanément)
- HTTPS enforced (Laravel `ForceHttps` middleware en production)
- Documents accessibles uniquement via URLs signées R2 (15 min)
- Colonne `strava_token` chiffrée avec `encrypted` cast Eloquent (AES-256-CBC)
- Laravel Observer sur les actions sensibles → log structuré
- Headers de sécurité : HSTS, X-Frame-Options, X-Content-Type-Options, CSP

**Validation:** OWASP Top 10 checklist, test de pénétration manuel avant lancement.

---

### NFR-003: Conformité RGPD

**Requirement:** Consentement, droit à la suppression, données EU.

**Architecture Solution:**
- Case à cocher consentement obligatoire à l'inscription (enregistré en BDD avec timestamp)
- Route `DELETE /me` → soft delete utilisateur + anonymisation données + suppression fichiers R2
- Politique de confidentialité accessible dans le footer (page statique)
- Cloudflare R2 EU region (Amsterdam)
- Shared hosting O2switch (France)
- Aucun cookie tracking (pas de Google Analytics)

**Validation:** Checklist CNIL pour associations, DPO non requis pour une petite association.

---

### NFR-004: Fiabilité & Sauvegardes

**Requirement:** Sauvegardes automatiques, aucune perte de document.

**Architecture Solution:**
- Cloudflare R2 : redondance intégrée (3 copies géographiques)
- Export SQL automatique quotidien (cron Laravel → dump MySQL → upload R2 dans bucket séparé)
- Soft deletes sur les ressources critiques (users, events, posts)
- Double confirmation avant suppression de document (frontend + backend)
- Journalisation de toutes les opérations sur les fichiers

**Validation:** Test de restauration mensuel, monitoring du bucket de backups.

---

### NFR-005: Mobile-first & Compatibilité

**Requirement:** iOS Safari, Android Chrome, responsive 320px-1440px.

**Architecture Solution:**
- Tailwind CSS mobile-first par défaut (breakpoints `sm:`, `md:`, `lg:`)
- Next.js `<Image>` avec `sizes` appropriés pour chaque viewport
- Touch targets ≥ 44px (boutons, liens)
- PWA : `next-pwa` pour manifest + service worker (accès rapide depuis l'écran d'accueil)
- Test systématique sur iOS Safari (moteur WebKit) pour les spécificités CSS

**Validation:** Tests manuels iOS/Android, Lighthouse Mobile score.

---

### NFR-006: Scalabilité

**Requirement:** 10 → 200 membres sans refactoring majeur.

**Architecture Solution:**
- API stateless (Sanctum tokens BDD, aucun état serveur)
- Séparation stricte frontend/backend → chaque couche scalable indépendamment
- Cloudflare R2 : scalable sans limite
- Pusher : scalable (upgrade de plan si besoin)
- Migration vers VPS + Redis possible sans changer l'architecture (variable d'environnement)

**Validation:** Load test avec 200 utilisateurs simultanés avant lancement v2.

---

### NFR-007: Maintenabilité

**Requirement:** Code documenté, conventions, tests, onboarding simple.

**Architecture Solution:**
- `README.md` complet (setup local, architecture, conventions, déploiement)
- `.env.example` avec toutes les variables documentées
- ESLint + Prettier (frontend), PHP-CS-Fixer PSR-12 (backend)
- Structure de dossiers conventionnelle (Laravel standard + Next.js App Router)
- Tests Pest pour les endpoints critiques (auth, permissions, upload)
- Tests Vitest pour les composants Next.js critiques
- Commentaires uniquement sur les logiques non-évidentes

**Validation:** Onboarding d'un nouveau développeur testé en < 30 minutes.

---

### NFR-008: Coût d'infrastructure

**Requirement:** Budget nul ou minimal.

**Architecture Solution:**

| Service | Plan | Coût mensuel |
|---------|------|-------------|
| Vercel | Hobby (free) | 0€ |
| O2switch | Mutualisé (~5€/mois) | ~5€ |
| Cloudflare R2 | Free (10 GB) | 0€ |
| Pusher | Sandbox (free) | 0€ |
| Resend | Free (3000 emails) | 0€ |
| **Total** | | **~5€/mois** |

**Validation:** Revue mensuelle des coûts et des limites de free tiers.

---

## Security Architecture

### Authentication

Laravel Sanctum avec tokens personnels :
```
1. POST /auth/login → Laravel vérifie credentials → génère token Sanctum
2. Token renvoyé en JSON → Next.js stocke en cookie httpOnly (SameSite=Strict)
3. Chaque requête API → Authorization: Bearer {token}
4. Middleware auth:sanctum valide le token en BDD
5. POST /auth/logout → token supprimé de la BDD (révocation immédiate)
```

Reset de mot de passe : token sécurisé (60 min), envoyé par email via Resend.

### Authorization

RBAC via `spatie/laravel-permission` + Laravel Policies :
```
Rôle           Niveau  Peut créer événement  Peut gérer membres
admin          5       ✓                     ✓
founder        4       ✓                     ✓
coach          3       ✓                     —
bureau         2       ✓                     —
member         1       —                     —
```

Chaque Controller délègue l'autorisation à sa Policy :
```php
public function store(Request $request): JsonResponse {
    $this->authorize('create', Event::class); // → EventPolicy::create()
    // ...
}
```

### Data Encryption

- **En transit :** HTTPS/TLS 1.3 (Let's Encrypt, forcé en production)
- **Au repos (Strava tokens) :** `encrypted` cast Eloquent → AES-256-CBC via APP_KEY
- **Documents R2 :** Chiffrement côté serveur Cloudflare (SSE-C optionnel)
- **Passwords :** bcrypt (coût 12, défaut Laravel)

### Security Best Practices

- **CSRF :** Sanctum gère via cookie SameSite=Strict
- **XSS :** Next.js échappe par défaut, contenu rich text sanitisé côté serveur (HTMLPurifier)
- **SQL Injection :** Eloquent ORM avec requêtes préparées uniquement
- **Rate limiting :** Laravel `throttle:60,1` sur toutes les routes API, `throttle:5,1` sur auth
- **Validation :** Form Requests Laravel sur tous les endpoints (validation stricte)
- **Security headers :** Middleware custom ajoutant HSTS, X-Frame-Options, CSP
- **Secrets :** Variables d'environnement uniquement (jamais en dur dans le code)

---

## Scalability & Performance

### Scaling Strategy

Phase actuelle (v1, 10-50 membres) :
- Shared hosting suffit largement pour ce volume
- Next.js Vercel Hobby : 100 GB bandwidth/mois gratuit

Migration v2 si croissance (200+ membres) :
- Backend → VPS Hetzner (CAX11, 4€/mois, ARM, 2 vCPU, 4 GB RAM)
- Ajouter Redis pour cache + sessions
- Laravel Reverb pour remplacer Pusher (économie à fort volume)

### Performance Optimization

- **N+1 queries :** Eager loading systématique (`with(['user', 'registrations'])`)
- **Pagination :** Cursor-based sur toutes les listes (évite COUNT(*) coûteux)
- **Sélection de colonnes :** `select(['id', 'title', 'date'])` sur les listes, pas `select *`
- **Indexes :** Ajoutés sur toutes les foreign keys et colonnes de tri/filtre
- **Assets :** Next.js bundle splitting automatique, images optimisées WebP/AVIF

### Caching Strategy

V1 (shared hosting, pas de Redis) :
- Cache Laravel driver : `file` (suffisant pour 50 utilisateurs)
- TTL leaderboard : 5 minutes (recalcul coûteux)
- TTL liste des événements publics : 1 minute

V2 (Redis disponible) :
- Cache driver → Redis
- Cache HTTP headers (ETag, Last-Modified) sur les endpoints publics

### Load Balancing

V1 : Non applicable (shared hosting, trafic faible)
V2 : Nginx reverse proxy + 2 workers PHP-FPM sur VPS

---

## Reliability & Availability

### High Availability Design

V1 : Uptime dépendant de O2switch SLA (99.9% garanti contractuellement).
- Vercel (frontend) : 99.99% uptime garanti
- Si backend down → frontend affiche pages statiques (blog, événements en cache SSG)

### Disaster Recovery

- **RPO (Recovery Point Objective) :** 24h (backup quotidien)
- **RTO (Recovery Time Objective) :** < 4h (restauration manuelle backup + redéploiement)
- Procédure documentée dans le README pour restauration complète

### Backup Strategy

```
Cron quotidien (3h00) :
1. mysqldump → compressé (gzip) → uploadé sur R2 (bucket: safoulee-backups)
2. Rétention : 30 jours de sauvegardes quotidiennes
3. Notification email si le cron échoue (Laravel Schedule + Resend)
```

### Monitoring & Alerting

V1 (simple, gratuit) :
- **UptimeRobot** (free) : ping toutes les 5 min, alerte email si down
- **Laravel logs** : `storage/logs/laravel.log` — erreurs 500 loguées
- **Vercel Analytics** (free) : métriques de performance frontend

V2 :
- Sentry pour le tracking d'erreurs (free tier : 5000 events/mois)

---

## Integration Architecture

### External Integrations

**Pusher (Chat temps réel)**
```
Laravel → PusherBroadcastServiceProvider → Pusher API
Client Next.js → pusher-js → WebSocket ws-eu.pusher.com
Canal : private-chat.general, private-chat.event.{id}
Auth canal privé : POST /api/v1/chat/pusher/auth
```

**Cloudflare R2 (Documents)**
```
Upload : Client → Laravel → Validation → R2 SDK (S3 compatible) → Confirmation
Download : Client → Laravel → R2 temporaryUrl(15min) → Redirect vers URL signée
```

**Strava OAuth (conditionnel)**
```
1. GET /api/v1/strava/connect → redirect vers Strava OAuth
2. Strava → callback GET /api/v1/strava/callback?code={code}
3. Laravel échange code → access_token + refresh_token
4. Tokens stockés chiffrés en BDD
5. Webhook Strava → POST /api/v1/strava/webhook → sync activités
```

**Resend (Emails)**
```
Laravel Mail → ResendTransport → Resend API → Email livré
Templates Blade pour : welcome, reset-password, document-alert, event-cancellation
```

### Internal Integrations

- Next.js ↔ Laravel : REST JSON uniquement, pas de session partagée
- Laravel Jobs ↔ MySQL : Queue driver `database` (table `jobs`)
- Laravel Events ↔ Pusher : Broadcasting via `BroadcastServiceProvider`

### Message/Event Architecture

```
Laravel Events (synchrones, internes) :
UserRegistered → SendWelcomeEmail (Job async)
DocumentUploaded → CheckDocumentCompleteness
EventCancelled → NotifyRegisteredMembers (Job async)

Broadcasting (vers Pusher) :
MessageSent → Canal private-chat.{channel}
EventUpdated → Canal private-members (notification in-app)
```

---

## Development Architecture

### Code Organization

**Frontend (Next.js) :**
```
src/
├── app/
│   ├── (public)/          # Layout public
│   │   ├── page.tsx       # Homepage
│   │   ├── blog/          # Blog public
│   │   └── events/        # Événements publics
│   ├── (auth)/            # Layout auth (login, register)
│   └── (dashboard)/       # Layout dashboard (protégé)
│       ├── profile/
│       ├── documents/
│       ├── events/
│       ├── sessions/
│       ├── chat/
│       ├── leaderboard/
│       └── admin/
├── components/
│   ├── ui/                # Composants génériques (Button, Input, Modal)
│   ├── features/          # Composants métier (EventCard, DocumentUpload)
│   └── layouts/           # Layouts (Header, Footer, Sidebar)
├── lib/
│   ├── api.ts             # Client API (fetch wrapper)
│   ├── auth.ts            # Helpers auth (token, user)
│   └── pusher.ts          # Client Pusher
├── store/                 # Zustand stores (auth, notifications)
└── types/                 # Interfaces TypeScript (User, Event, Post...)
```

**Backend (Laravel) :**
```
app/
├── Http/
│   ├── Controllers/Api/V1/    # Un Controller par ressource
│   ├── Requests/              # Form Requests (validation)
│   ├── Resources/             # API Resources (transformation JSON)
│   └── Middleware/            # Auth, CORS, Security headers
├── Models/                    # Eloquent models
├── Policies/                  # Autorisation par ressource
├── Services/                  # Logique métier complexe
│   ├── DocumentService.php    # Upload, signed URL, validation
│   ├── StravaService.php      # OAuth, sync activités
│   └── LeaderboardService.php # Calcul classements
├── Jobs/                      # Tâches asynchrones
├── Events/ & Listeners/       # Events internes + broadcast
└── Notifications/             # Notifications Laravel
```

### Module Structure

Chaque fonctionnalité suit le pattern :
```
Request (validation) → Controller (orchestration) → Service (logique métier)
  → Model/Repository (BDD) → Resource (transformation) → JSON response
```

### Testing Strategy

**Backend (Pest) :**
- Feature tests sur tous les endpoints API (HTTP tests)
- Unit tests sur les Services (DocumentService, LeaderboardService)
- Couverture cible : 70% sur le code critique (auth, permissions, upload)

**Frontend (Vitest + Testing Library) :**
- Tests sur les composants UI critiques (formulaires, upload)
- Tests des helpers auth

**E2E (Playwright, v2) :**
- Flux critiques : inscription, upload document, création événement

### CI/CD Pipeline

**Frontend :**
```
GitHub push → Vercel auto-deploy
├── Build Next.js
├── ESLint check
└── Deploy → Preview URL (PR) ou Production (main)
```

**Backend :**
```
GitHub push → GitHub Actions
├── PHP-CS-Fixer check
├── Pest tests (SQLite in-memory)
└── On success : rsync vers shared hosting via SSH
    → php artisan migrate --force
    → php artisan config:cache
    → php artisan route:cache
```

---

## Deployment Architecture

### Environments

| Env | Frontend | Backend | BDD |
|-----|----------|---------|-----|
| **Local** | `localhost:3000` | `localhost:8000` | MySQL local |
| **Preview** | Vercel Preview URL | — (pointe vers prod API) | — |
| **Production** | `safoulee.fr` | `api.safoulee.fr` | MySQL shared hosting |

### Deployment Strategy

**Frontend :** Déploiement continu (Vercel, zéro downtime)
**Backend :** Déploiement semi-manuel via GitHub Actions + SSH rsync
- `php artisan down` avant migration
- `php artisan migrate --force`
- `php artisan up`
- Durée maintenance : < 30 secondes

### Infrastructure as Code

V1 : Configuration manuelle (shared hosting)
V2 : Terraform pour VPS Hetzner + DNS Cloudflare

---

## Requirements Traceability

### Functional Requirements Coverage

| FR ID | FR Name | Composants | Notes |
|-------|---------|------------|-------|
| FR-001 | Authentification & Profil | Laravel API, MySQL, Next.js, Resend | Sanctum tokens |
| FR-002 | Gestion documents | Laravel API, Cloudflare R2, MySQL | URLs signées 15min |
| FR-003 | Système de rôles | Laravel API, Spatie Permission, MySQL | Policies par ressource |
| FR-004 | Création sessions | Laravel API, MySQL, Next.js | JSON exercises |
| FR-005 | Gestion événements | Laravel API, MySQL, Next.js, Resend | Notif. annulation |
| FR-006 | Blog / actualités | Laravel API, MySQL, Next.js | SSG pages publiques |
| FR-007 | Leaderboard | Laravel API, MySQL, Next.js | Cache 5min |
| FR-008 | Intégration Strava | Laravel API, Strava OAuth, MySQL | Conditionnel |
| FR-009 | Chat | Laravel API, Pusher, MySQL, Next.js | Canaux privés |
| FR-010 | Accès public | Next.js SSG, Laravel API | Pages statiques |
| FR-011 | Tableau de bord Admin | Laravel API, MySQL, Next.js | Export CSV |
| FR-012 | Notifications | Laravel Notifications, Resend, Pusher | In-app + email |

### Non-Functional Requirements Coverage

| NFR ID | NFR Name | Solution | Validation |
|--------|----------|----------|------------|
| NFR-001 | Performance | SSG Vercel, indexes MySQL, pagination | Lighthouse ≥ 80 |
| NFR-002 | Sécurité | Sanctum, HTTPS, URLs signées, chiffrement | OWASP checklist |
| NFR-003 | RGPD | Consentement BDD, DELETE /me, EU hosting | CNIL checklist |
| NFR-004 | Fiabilité | R2 redondant, backup quotidien, soft deletes | Test restauration |
| NFR-005 | Mobile-first | Tailwind mobile-first, PWA | Tests iOS/Android |
| NFR-006 | Scalabilité | API stateless, migration VPS possible | Load test v2 |
| NFR-007 | Maintenabilité | README, conventions, Pest, PHP-CS-Fixer | Onboarding < 30min |
| NFR-008 | Coût | ~5€/mois (O2switch) + 0€ autres | Revue mensuelle |

---

## Trade-offs & Decision Log

**Décision : Shared hosting plutôt que VPS**
- ✓ Budget minimal, pas de gestion serveur
- ✗ Pas de Redis, pas de WebSocket natif → mitigé par Pusher
- Rationale : Pour 10-50 membres, shared hosting est largement suffisant

**Décision : Pusher plutôt que Laravel Reverb**
- ✓ Fonctionne sur shared hosting, zéro configuration serveur
- ✗ Dépendance externe, limite 200 connexions simultanées
- Rationale : 200 connexions >>> 50 membres. Migration vers Reverb possible si VPS

**Décision : Cloudflare R2 plutôt que AWS S3**
- ✓ Pas de frais d'egress (les téléchargements de documents sont gratuits)
- ✓ Compatible S3 API (migration transparente)
- ✗ Moins mature qu'AWS S3
- Rationale : Économie significative pour une association avec peu de budget

**Décision : Laravel Sanctum plutôt que JWT (package tiers)**
- ✓ Natif Laravel, révocation immédiate des tokens
- ✓ Simple à configurer, bien documenté
- ✗ Nécessite un appel BDD pour valider chaque token (vs JWT stateless)
- Rationale : La révocabilité immédiate est critique pour la sécurité (vol de token)

**Décision : MySQL plutôt que PostgreSQL**
- ✓ Disponible sur tous les shared hostings
- ✓ Suffisant pour les besoins relationnels de saFoulee
- ✗ Moins performant pour les requêtes analytiques complexes
- Rationale : Compatibilité shared hosting, migration PostgreSQL possible sur VPS

---

## Open Issues & Risks

- **Strava API limits :** Vérifier les quotas du free tier (15 requêtes/15min, 100/jour) avant implémentation. Si insuffisant, implémenter webhook uniquement.
- **O2switch WebSocket :** Confirmer que O2switch ne bloque pas les connexions sortantes vers Pusher (normalement OK car c'est le client qui initie).
- **Cron shared hosting :** Vérifier la fréquence minimale des crons (certains shared hostings limitent à 1/heure). Si insuffisant pour les queues → utiliser un cron externe (easycron.com, gratuit).
- **Taille documents R2 :** Définir une taille maximale par document (recommandé : 10 MB) et un quota par utilisateur (recommandé : 50 MB total).

---

## Assumptions & Constraints

- O2switch supporte PHP 8.2+ et MySQL 8.0
- Les crons sont disponibles à la fréquence de 1/minute sur le shared hosting
- L'API Strava est utilisable gratuitement pour < 50 utilisateurs
- Les membres ont une connexion internet suffisante pour uploader des documents (4G minimum)
- Le domaine `safoulee.fr` sera enregistré par le fondateur de l'association

---

## Future Considerations

- **V2 :** Migration vers VPS Hetzner + Redis + Laravel Reverb (si croissance > 100 membres)
- **V2 :** Application mobile native (React Native pour réutiliser la logique TypeScript)
- **V2 :** Intégration paiement cotisations (Stripe, Hello Asso)
- **V2 :** Module de statistiques avancées (progression sur le temps, graphiques)
- **V2 :** Intégrations sportives supplémentaires (Garmin, Polar)

---

## Approval & Sign-off

**Review Status:**
- [ ] Technical Lead (julesbourin)
- [ ] Product Owner (Fondateur)
- [ ] Security Architect
- [ ] DevOps Lead

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-07 | julesbourin | Initial architecture |

---

## Next Steps

### Phase 4: Sprint Planning & Implementation

Run `/sprint-planning` to:
- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation following this architectural blueprint

**Key Implementation Principles:**
1. Suivre les boundaries de composants définis dans ce document
2. Implémenter les solutions NFR telles que spécifiées
3. Utiliser la stack technique définie (Next.js + Laravel + MySQL + R2 + Pusher)
4. Respecter les contrats API (endpoints, formats, auth)
5. Respecter les guidelines de sécurité et RGPD

---

**This document was created using BMAD Method v6 - Phase 3 (Solutioning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Technology Evaluation Matrix

| Catégorie | Choix retenu | Alternatives considérées | Facteur décisif |
|-----------|-------------|--------------------------|-----------------|
| Frontend | Next.js 14 | Nuxt.js, SvelteKit | SSG + SSR, écosystème React |
| Backend | Laravel 11 | Symfony, Node.js/Express | Shared hosting compatible, conventions fortes |
| BDD | MySQL 8.0 | PostgreSQL | Shared hosting universel |
| Storage | Cloudflare R2 | AWS S3, Supabase Storage | 0€ egress, EU |
| WebSocket | Pusher | Laravel Reverb, Socket.io | Compatible shared hosting |
| Email | Resend | Mailgun, SendGrid | DX, 3000 emails/mois gratuits |
| CSS | Tailwind CSS | Bootstrap, CSS Modules | Mobile-first natif, Motion.dev compatible |

---

## Appendix B: Capacity Planning

| Métrique | V1 (lancement) | V2 (croissance) |
|----------|----------------|-----------------|
| Membres actifs | 10-50 | 50-200 |
| Connexions WebSocket simultanées | < 20 | < 200 |
| Documents stockés | ~500 fichiers / 2 GB | ~5 GB |
| Requêtes API/jour | < 5 000 | < 50 000 |
| Emails/mois | < 500 | < 3 000 |

---

## Appendix C: Cost Estimation

| Service | V1 mensuel | V2 mensuel |
|---------|-----------|-----------|
| Vercel (frontend) | 0€ | 0€ |
| Shared hosting O2switch | ~5€ | → VPS Hetzner ~5€ |
| Cloudflare R2 | 0€ | 0€ (< 10 GB) |
| Pusher | 0€ | 0€ (< 200 conn) |
| Resend | 0€ | 0€ (< 3000 mails) |
| Domaine (.fr) | ~1€/mois | ~1€/mois |
| **Total** | **~6€/mois** | **~6€/mois** |
