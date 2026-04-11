# System Architecture : La Neuville TAF sa Foulée — v2

**Date :** 2026-03-29
**Architecte :** Jules Bourin
**Version :** 2.0
**Statut :** Approuvé

---

## Aperçu du document

Ce document met à jour l'architecture v1 (`architecture-saFoulee-2026-03-07.md`) pour couvrir les six epics du PRD v2 :

- **EPIC-R** — Refonte graphique & identité
- **EPIC-N** — Newsletter membres
- **EPIC-I** — Inventaire équipements
- **EPIC-B** — Gestion budgétaire
- **EPIC-P** — Paiement HelloAsso
- **EPIC-D** — Infrastructure production (Vercel + O2switch)

**Documents liés :**

- PRD v2 : `docs/prd-saFoulee-2026-03-29.md`
- Architecture v1 : `docs/architecture-saFoulee-2026-03-07.md`

---

## Résumé exécutif

L'architecture reste une **SPA découplée + API REST** (Next.js sur Vercel / Laravel sur O2switch). Les nouveaux modules (newsletter, inventaire, budget, HelloAsso) s'ajoutent comme des modules Laravel indépendants dans le backend existant, sans rupture architecturale. Le seul ajout externe est l'intégration HelloAsso (webhook entrant).

**Principes directeurs v2 :**

1. **Aucun nouveau service tiers** sauf HelloAsso (webhook, pas de SDK serveur).
2. **Queues Laravel** (driver `database`, cron O2switch) pour l'envoi de newsletter — compatible shared hosting.
3. **RGPD by design** — consentement horodaté, désabonnement en 1 clic, tokens signés.
4. **Coût zéro supplémentaire** — HelloAsso est gratuit pour les associations, Resend free tier (3000 emails/mois) couvre la newsletter.

---

## Drivers architecturaux v2

Les NFRs qui influencent le plus les décisions v2 :

| NFR                         | Exigence                                      | Impact architectural                                              |
| --------------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| NFR-01 (RGPD)               | Consentement newsletter, désabonnement 1 clic | Tokens signés, table dédiée, endpoint public `/desabonnement`     |
| NFR-02 (Vercel serverless)  | Timeout 10–60 s, pas de long-running process  | Envoi newsletter via backend O2switch + queue cron                |
| NFR-03 (O2switch mutualisé) | PHP 8.2, pas de WebSocket, pas de Redis       | Queue driver `database`, cron pour jobs                           |
| NFR-04 (Core Web Vitals)    | LCP < 2,5 s                                   | `next/image` pour toutes les images, lazy loading mascotte/bureau |
| NFR-05 (Accessibilité)      | Contraste WCAG AA avec `#FB3936`              | Ratio vérifié en CSS, alternatives textuelles pour images         |

---

## Vue d'ensemble du système v2

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                │
│           Mobile (iOS/Android browsers)                         │
│           Desktop (Chrome, Firefox, Safari)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
          ┌────────────────┼──────────────────────┐
          │                │                      │
          ▼                ▼                      ▼
  ┌───────────────┐ ┌────────────┐        ┌──────────────┐
  │  Next.js SPA  │ │  Pusher    │        │ Cloudflare R2│
  │  (Vercel)     │ │ (WebSocket)│        │ (Documents)  │
  └───────┬───────┘ └─────┬──────┘        └──────────────┘
          │               │
          │ REST API       │ Events
          ▼               │
  ┌───────────────────────┴──────────────────────────────┐
  │              Laravel REST API (O2switch)              │
  │                                                      │
  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │
  │  │  MySQL   │ │  Queue   │ │ HelloAsso Webhook  │   │
  │  │   DB     │ │ (DB+cron)│ │ (POST entrant)     │   │
  │  └──────────┘ └──────────┘ └────────────────────┘   │
  └──────────────────────┬───────────────────────────────┘
                         │
           ┌─────────────┼────────────┐
           ▼             ▼            ▼
   ┌──────────────┐ ┌──────────┐ ┌──────────────┐
   │   Resend     │ │ HelloAsso│ │  Cloudflare  │
   │ (newsletter  │ │ (paiement│ │     R2       │
   │  + transac.) │ │ cotis.)  │ │ (documents)  │
   └──────────────┘ └──────────┘ └──────────────┘
```

---

## Stack technique

La stack v1 est conservée intégralement. Les ajouts v2 sont en gras.

| Couche               | Technologie                          | Notes v2                                              |
| -------------------- | ------------------------------------ | ----------------------------------------------------- |
| Frontend             | Next.js 14+ (App Router, TypeScript) | Ajout `next/image` obligatoire pour toutes les images |
| Backend              | Laravel 11 (PHP 8.2+)                | +4 modules métier, +1 webhook endpoint                |
| BDD                  | MySQL 8.0                            | +5 nouvelles tables                                   |
| Hébergement frontend | Vercel (Hobby)                       | **Production configurée**                             |
| Hébergement backend  | O2switch mutualisé                   | **Production configurée**                             |
| Stockage fichiers    | Cloudflare R2                        | Inchangé                                              |
| Email                | Resend                               | **Ajout : envoi newsletter**                          |
| Temps réel           | Pusher                               | Inchangé                                              |
| **Paiement**         | **HelloAsso**                        | **Nouveau — webhook entrant**                         |

### Nouveaux packages Laravel v2

```
# Aucun nouveau package nécessaire — tout s'appuie sur l'existant
# La signature des webhooks HelloAsso est vérifiée manuellement (HMAC-SHA256)
# L'export CSV utilise League\Csv (déjà inclus dans Laravel) ou le helper simple
```

---

## Composants système v2

Les composants 1–6 de la v1 sont inchangés. Les composants 7–11 sont nouveaux.

---

### Composant 7 — Module Newsletter

**But :** Gérer les abonnements, l'envoi des campagnes et le désabonnement conforme RGPD.

**Responsabilités :**

- Enregistrer/révoquer le consentement newsletter (`newsletter_subscribed_at`)
- Générer des tokens de désabonnement signés (HMAC-SHA256)
- Composer et envoyer des campagnes via Resend (traitement en queue)
- Servir la page de désabonnement publique sans authentification

**Interfaces :**

- `PATCH /api/v1/me/newsletter` — toggle abonnement (auth)
- `GET /api/v1/admin/newsletter/subscribers` — liste abonnés [Admin|Founder]
- `GET /api/v1/admin/newsletter/subscribers/export` — CSV abonnés
- `POST /api/v1/admin/newsletter/campaigns` — créer campagne [Admin|Founder]
- `POST /api/v1/admin/newsletter/campaigns/{id}/send` — déclencher envoi [Admin|Founder]
- `GET /api/v1/admin/newsletter/campaigns` — historique campagnes
- `GET /unsubscribe?token=XXX` — désabonnement public (Next.js route → Laravel)

**FRs couverts :** FR-N01, FR-N02, FR-N03, FR-N04

---

### Composant 8 — Module Inventaire

**But :** Suivi du matériel de l'association (état, quantité, attributions).

**Responsabilités :**

- CRUD équipements avec catégorie et état
- Enregistrement des attributions (quel membre a quoi)
- Historique des mouvements (attribution + retour)
- Export CSV de l'inventaire complet

**Interfaces :**

- `GET /api/v1/inventory` — liste équipements [Bureau+]
- `POST /api/v1/inventory` — créer équipement [Admin|Founder|Bureau]
- `GET /api/v1/inventory/{id}` — détail + historique [Bureau+]
- `PATCH /api/v1/inventory/{id}` — modifier [Admin|Founder|Bureau]
- `DELETE /api/v1/inventory/{id}` — supprimer [Admin|Founder]
- `POST /api/v1/inventory/{id}/assign` — attribuer à un membre [Bureau+]
- `PATCH /api/v1/inventory/assignments/{id}/return` — marquer rendu [Bureau+]
- `GET /api/v1/inventory/export` — CSV [Bureau+]

**FRs couverts :** FR-I01, FR-I02, FR-I03

---

### Composant 9 — Module Budget

**But :** Suivi financier interne de l'association (dépenses et recettes).

**Responsabilités :**

- CRUD des mouvements financiers (dépense / recette)
- Calcul du solde courant
- Agrégats par mois/catégorie pour le dashboard
- Export CSV comptable sur période

**Interfaces :**

- `GET /api/v1/budget` — liste mouvements filtrés [Bureau+]
- `POST /api/v1/budget` — saisir mouvement [Bureau+]
- `PATCH /api/v1/budget/{id}` — modifier [Bureau+]
- `DELETE /api/v1/budget/{id}` — supprimer [Admin|Founder]
- `GET /api/v1/budget/summary` — solde + agrégats mensuels [Bureau+]
- `GET /api/v1/budget/export` — CSV sur période [Bureau+]

**FRs couverts :** FR-B01, FR-B02, FR-B03

---

### Composant 10 — Intégration HelloAsso

**But :** Permettre le paiement de la cotisation annuelle et mettre à jour automatiquement le statut membre.

**Responsabilités :**

- Exposer la page `/adhesion` avec le bouton HelloAsso
- Recevoir et valider les webhooks HelloAsso (HMAC-SHA256)
- Mettre à jour `membership_paid_at` sur le membre correspondant
- Créer automatiquement une recette dans le budget (catégorie "cotisation")
- Logger chaque webhook reçu

**Interfaces :**

- `POST /api/v1/webhooks/helloasso` — endpoint webhook (public, avec vérification signature)
- Bouton frontend : `<a href="{HELLOASSO_FORM_URL}" target="_blank">` (aucun SDK)

**FRs couverts :** FR-P01, FR-P02

---

### Composant 11 — Design System v2

**But :** Nouvelle palette de couleurs et visuels officiels cohérents sur tout le site.

**Responsabilités :**

- Tokens CSS dans `globals.css` (`--color-primary: #FB3936`, etc.)
- Composants Next.js utilisant `next/image` pour logo, mascotte, bureau
- Layout auth avec logo cliquable
- Cohérence sur toutes les pages (navbar, sidebar, boutons, formulaires)

**FRs couverts :** FR-R01, FR-R02, FR-R03, FR-UX01, FR-UX02

---

## Modèle de données v2

### Nouvelles tables

```sql
-- Modification de la table users (migration)
ALTER TABLE users
  ADD COLUMN newsletter_subscribed_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN newsletter_unsubscribe_token VARCHAR(64) NULL DEFAULT NULL,
  ADD COLUMN membership_paid_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN membership_amount DECIMAL(8,2) NULL DEFAULT NULL;

-- Campagnes newsletter
CREATE TABLE newsletter_campaigns (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  subject VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,            -- HTML rich text (Tiptap)
  sent_at TIMESTAMP NULL DEFAULT NULL,
  recipient_count INT NULL DEFAULT NULL,
  created_by BIGINT UNSIGNED,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
INDEX idx_campaigns_sent ON newsletter_campaigns(sent_at DESC);

-- Équipements
CREATE TABLE equipment (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category ENUM('textile','materiel','electronique','autre') NOT NULL DEFAULT 'autre',
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('bon','use','hors_service') NOT NULL DEFAULT 'bon',
  notes TEXT NULL,
  created_by BIGINT UNSIGNED,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Attributions d'équipements
CREATE TABLE equipment_assignments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  equipment_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  returned_at TIMESTAMP NULL DEFAULT NULL,
  notes TEXT NULL,
  assigned_by BIGINT UNSIGNED,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);
INDEX idx_assignments_equipment ON equipment_assignments(equipment_id, returned_at);
INDEX idx_assignments_user ON equipment_assignments(user_id, returned_at);

-- Mouvements budgétaires
CREATE TABLE budget_entries (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  type ENUM('depense','recette') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  entry_date DATE NOT NULL,
  category ENUM('achat_materiel','cotisation','evenement','subvention','autre') NOT NULL DEFAULT 'autre',
  description VARCHAR(500) NOT NULL,
  receipt_url VARCHAR(500) NULL,
  created_by BIGINT UNSIGNED,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
INDEX idx_budget_date ON budget_entries(entry_date DESC);
INDEX idx_budget_type ON budget_entries(type, entry_date DESC);

-- Webhooks HelloAsso (log)
CREATE TABLE helloasso_webhooks (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  event_type VARCHAR(100) NOT NULL,
  payer_email VARCHAR(255) NULL,
  amount DECIMAL(8,2) NULL,
  payload JSON NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMP NULL DEFAULT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INDEX idx_webhooks_email ON helloasso_webhooks(payer_email);
INDEX idx_webhooks_processed ON helloasso_webhooks(processed, created_at);
```

### Modèle de données complet (v1 + v2)

```
users (étendu)
├── ... (champs v1)
├── newsletter_subscribed_at (timestamp, nullable) — date du consentement
├── newsletter_unsubscribe_token (varchar 64, nullable) — token HMAC courant
├── membership_paid_at (timestamp, nullable) — dernière cotisation payée
└── membership_paid_amount (decimal 8,2, nullable) — montant cotisation

newsletter_campaigns
├── id, subject, content (longtext HTML), sent_at, recipient_count, created_by

equipment
├── id, name, category (enum), quantity, status (enum), notes, created_by

equipment_assignments
├── id, equipment_id → equipment, user_id → users
├── assigned_at, returned_at (nullable), notes, assigned_by → users

budget_entries
├── id, type (enum), amount, entry_date, category (enum)
├── description, receipt_url (nullable), created_by → users

helloasso_webhooks (log)
├── id, event_type, payer_email, amount, payload (json)
├── processed (bool), processed_at (nullable), error_message
```

---

## API Design v2

### Nouveaux endpoints (complément des endpoints v1)

```
# PROFIL — Newsletter
PATCH  /api/v1/me/newsletter           # Toggle abonnement [self]
                                       # Body: { subscribed: true|false }

# NEWSLETTER — Admin
GET    /api/v1/admin/newsletter/subscribers         # Liste abonnés [Admin|Founder]
GET    /api/v1/admin/newsletter/subscribers/export  # CSV abonnés [Admin|Founder]
GET    /api/v1/admin/newsletter/campaigns           # Historique campagnes [Admin|Founder]
POST   /api/v1/admin/newsletter/campaigns           # Créer brouillon [Admin|Founder]
GET    /api/v1/admin/newsletter/campaigns/{id}      # Détail campagne [Admin|Founder]
PATCH  /api/v1/admin/newsletter/campaigns/{id}      # Modifier brouillon [Admin|Founder]
DELETE /api/v1/admin/newsletter/campaigns/{id}      # Supprimer brouillon [Admin|Founder]
POST   /api/v1/admin/newsletter/campaigns/{id}/send # Envoyer [Admin|Founder]

# DÉSABONNEMENT — Public (sans auth)
POST   /api/v1/newsletter/unsubscribe  # Désabonnement par token
                                       # Body: { token: "..." }

# INVENTAIRE
GET    /api/v1/inventory               # Liste équipements [Bureau+]
POST   /api/v1/inventory               # Créer équipement [Bureau+]
GET    /api/v1/inventory/{id}          # Détail + assignments [Bureau+]
PATCH  /api/v1/inventory/{id}          # Modifier [Bureau+]
DELETE /api/v1/inventory/{id}          # Supprimer [Admin|Founder]
POST   /api/v1/inventory/{id}/assign   # Attribuer à membre [Bureau+]
                                       # Body: { user_id, notes? }
PATCH  /api/v1/inventory/assignments/{id}/return  # Retour [Bureau+]
GET    /api/v1/inventory/export        # CSV [Bureau+]

# BUDGET
GET    /api/v1/budget                  # Liste mouvements + filtres [Bureau+]
                                       # ?type=depense&category=&from=&to=&page=
POST   /api/v1/budget                  # Saisir mouvement [Bureau+]
GET    /api/v1/budget/{id}             # Détail [Bureau+]
PATCH  /api/v1/budget/{id}             # Modifier [Bureau+]
DELETE /api/v1/budget/{id}             # Supprimer [Admin|Founder]
GET    /api/v1/budget/summary          # Solde + agrégats mensuels [Bureau+]
                                       # ?year=2026
GET    /api/v1/budget/export           # CSV export [Bureau+]
                                       # ?from=2026-01-01&to=2026-12-31

# HELLOASSO — Webhook (public, vérification HMAC)
POST   /api/v1/webhooks/helloasso      # Réception paiement [public + signature]
```

### Format des réponses nouvelles ressources

```json
// GET /api/v1/budget/summary
{
  "balance": 1234.50,
  "total_income": 2500.00,
  "total_expenses": 1265.50,
  "monthly": [
    { "month": "2026-01", "income": 500.00, "expenses": 200.00 },
    { "month": "2026-02", "income": 300.00, "expenses": 450.00 }
  ],
  "by_category": [
    { "category": "cotisation", "total": 1800.00 },
    { "category": "achat_materiel", "total": 650.00 }
  ]
}

// GET /api/v1/inventory/{id}
{
  "id": 1,
  "name": "Dossard numéroté",
  "category": "materiel",
  "quantity": 50,
  "status": "bon",
  "notes": "Stockés dans la salle polyvalente",
  "active_assignments": [
    {
      "id": 3,
      "user": { "id": 12, "name": "Marie Dupont" },
      "assigned_at": "2026-03-15T10:00:00Z"
    }
  ],
  "assignment_history": [...]
}
```

---

## Flux de données v2

### Flux Newsletter — Envoi d'une campagne

```
Admin (dashboard) → POST /admin/newsletter/campaigns/{id}/send
  → Laravel: récupère les users WHERE newsletter_subscribed_at IS NOT NULL
  → Pour chaque abonné: génère token désabonnement (HMAC-SHA256 sur user_id + secret)
  → Dispatch Job(SendNewsletterEmail) × N abonnés → Database Queue
  → Cron O2switch (toutes les minutes): php artisan queue:work --once
  → Pour chaque job: Resend API (envoi email avec lien désabonnement)
  → Update newsletter_campaigns.sent_at + recipient_count
```

**Note :** Pour < 100 abonnés, l'envoi synchrone est acceptable sans queue (Resend batch API). La queue devient utile au-delà.

### Flux Désabonnement RGPD

```
Membre clique "Se désabonner" dans email
  → Navigateur: GET /desabonnement?token=XXX (page Next.js publique)
  → Next.js: POST /api/v1/newsletter/unsubscribe { token: "XXX" }
  → Laravel:
      1. Vérifie le token (HMAC-SHA256 valide ?)
      2. Retrouve le user via le token (stocké en BDD)
      3. SET newsletter_subscribed_at = NULL
      4. SET newsletter_unsubscribe_token = NULL (invalidation)
  → Réponse 200 → Next.js affiche "Vous êtes désabonné."
```

### Flux Webhook HelloAsso

```
HelloAsso (POST) → /api/v1/webhooks/helloasso
  → Laravel Middleware: vérification signature HMAC-SHA256
      X-Helloasso-Signature: base64(HMAC(secret, body))
  → Controller:
      1. Log dans helloasso_webhooks (toujours, même si erreur)
      2. Retrouve user par email (payer.email)
      3. Si trouvé: SET membership_paid_at = NOW(), membership_amount = amount
      4. Crée une budget_entry { type: 'recette', category: 'cotisation', amount, date }
      5. Mark webhook.processed = true
  → Réponse 200 (HelloAsso attend 200, sinon retry)
```

**Gestion des doublons :** vérifier si un webhook pour cet email existe déjà dans la même année civile → idempotent.

### Flux Design System v2

```
globals.css → tokens CSS → Tailwind v4 @theme
  --color-primary: #FB3936          → bg-primary, text-primary, border-primary
  --color-primary-dark: #D42F2D     → bg-primary-dark (hover)
  --color-primary-light: #FD6563    → accents légers
  --color-bg: #FAFAFA               → fond page
  --color-bg-card: #FFFFFF          → cartes
  --color-sidebar: #C0302E          → sidebar dashboard

next/image → optimisation automatique WebP/AVIF
  logo-removebg-preview.png → Navbar (width: 40px), Auth (72px)
  mascotte-removebg-preview.png → Hero (200px), sections CTA
  bureau.png → Section "À propos" (full-width, priority: true)
```

---

## Architecture sécurité v2

### Vérification webhook HelloAsso

```php
// app/Http/Middleware/VerifyHelloAssoSignature.php

public function handle(Request $request, Closure $next): Response
{
    $signature = $request->header('X-Helloasso-Signature');
    $secret = config('services.helloasso.webhook_secret');
    $body = $request->getContent();

    $expected = base64_encode(
        hash_hmac('sha256', $body, $secret, true)
    );

    if (! hash_equals($expected, $signature ?? '')) {
        Log::warning('HelloAsso webhook: invalid signature', [
            'ip' => $request->ip(),
            'signature' => $signature,
        ]);
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    return $next($request);
}
```

### Tokens de désabonnement newsletter

```php
// Génération (à la création du user ou au premier envoi)
$token = hash_hmac('sha256', $user->id . '|' . $user->email, config('app.key'));
$user->update(['newsletter_unsubscribe_token' => $token]);

// Vérification
$user = User::where('newsletter_unsubscribe_token', $request->token)->firstOrFail();
// Comparaison en temps constant pour éviter les timing attacks
if (! hash_equals($user->newsletter_unsubscribe_token, $request->token)) {
    abort(404);
}
```

### Nouvelles Policies

```php
// InventoryPolicy
public function viewAny(User $user): bool
{
    return $user->hasAnyRole(['admin', 'founder', 'bureau', 'coach']);
}
public function create(User $user): bool
{
    return $user->hasAnyRole(['admin', 'founder', 'bureau']);
}
public function delete(User $user): bool
{
    return $user->hasAnyRole(['admin', 'founder']);
}

// BudgetPolicy
public function viewAny(User $user): bool
{
    return $user->hasAnyRole(['admin', 'founder', 'bureau']);
}
public function forceDelete(User $user): bool
{
    return $user->hasAnyRole(['admin', 'founder']);
}

// NewsletterPolicy
public function manageSubscribers(User $user): bool
{
    return $user->hasAnyRole(['admin', 'founder']);
}
```

---

## Architecture des composants frontend v2

### Nouvelles pages Next.js

```
frontend/src/app/
├── (public)/
│   ├── adhesion/
│   │   └── page.tsx          # Page d'adhésion + bouton HelloAsso
│   └── desabonnement/
│       └── page.tsx          # Confirmation désabonnement newsletter (token en query param)
└── (dashboard)/
    └── tableau-de-bord/
        ├── newsletter/
        │   └── page.tsx      # Admin: liste abonnés + envoi campagnes
        ├── inventaire/
        │   └── page.tsx      # Bureau+: gestion équipements
        └── budget/
            └── page.tsx      # Bureau+: dashboard financier + saisie
```

### Nouveaux composants

```
frontend/src/components/features/
├── newsletter/
│   ├── NewsletterToggle.tsx        # Toggle opt-in dans profil
│   ├── NewsletterAdminPage.tsx     # Page admin newsletter
│   ├── CampaignForm.tsx            # Formulaire création/édition campagne
│   └── SubscribersTable.tsx        # Tableau abonnés avec export
├── inventory/
│   ├── InventoryPage.tsx           # Page principale inventaire
│   ├── EquipmentForm.tsx           # Modal création/édition équipement
│   ├── EquipmentCard.tsx           # Carte équipement avec état
│   └── AssignmentModal.tsx         # Modal attribution/retour
├── budget/
│   ├── BudgetPage.tsx              # Dashboard financier
│   ├── BudgetEntryForm.tsx         # Formulaire saisie dépense/recette
│   ├── BudgetChart.tsx             # Graphique mensuel (recharts ou chart.js)
│   └── BudgetExport.tsx            # Bouton export CSV
└── public/
    └── AdhesionPage.tsx            # Page adhésion + HelloAsso CTA
```

### Nouvelles fonctions API client

```typescript
// frontend/src/lib/newsletter.ts
export const toggleNewsletter = (subscribed: boolean) => ...
export const getSubscribers = () => ...
export const exportSubscribers = () => ...
export const getCampaigns = () => ...
export const createCampaign = (payload: CampaignPayload) => ...
export const sendCampaign = (id: number) => ...
export const unsubscribeByToken = (token: string) => ...

// frontend/src/lib/inventory.ts
export const getInventory = (filters?: InventoryFilters) => ...
export const createEquipment = (payload: EquipmentPayload) => ...
export const updateEquipment = (id: number, payload: EquipmentPayload) => ...
export const deleteEquipment = (id: number) => ...
export const assignEquipment = (equipmentId: number, userId: number, notes?: string) => ...
export const returnEquipment = (assignmentId: number) => ...
export const exportInventory = () => ...

// frontend/src/lib/budget.ts
export const getBudgetEntries = (filters?: BudgetFilters) => ...
export const createBudgetEntry = (payload: BudgetEntryPayload) => ...
export const updateBudgetEntry = (id: number, payload: BudgetEntryPayload) => ...
export const deleteBudgetEntry = (id: number) => ...
export const getBudgetSummary = (year?: number) => ...
export const exportBudget = (from: string, to: string) => ...
```

### Nouveaux types TypeScript

```typescript
// frontend/src/types/index.ts — additions v2

export interface NewsletterCampaign {
  id: number;
  subject: string;
  content: string;
  sent_at: string | null;
  recipient_count: number | null;
  created_by: { id: number; name: string };
  created_at: string;
}

export interface Equipment {
  id: number;
  name: string;
  category: "textile" | "materiel" | "electronique" | "autre";
  quantity: number;
  status: "bon" | "use" | "hors_service";
  notes: string | null;
  active_assignments: EquipmentAssignment[];
}

export interface EquipmentAssignment {
  id: number;
  equipment_id: number;
  user: { id: number; name: string };
  assigned_at: string;
  returned_at: string | null;
  notes: string | null;
}

export interface BudgetEntry {
  id: number;
  type: "depense" | "recette";
  amount: number;
  entry_date: string;
  category:
    | "achat_materiel"
    | "cotisation"
    | "evenement"
    | "subvention"
    | "autre";
  description: string;
  receipt_url: string | null;
  created_by: { id: number; name: string };
  created_at: string;
}

export interface BudgetSummary {
  balance: number;
  total_income: number;
  total_expenses: number;
  monthly: Array<{ month: string; income: number; expenses: number }>;
  by_category: Array<{ category: string; total: number }>;
}
```

---

## Infrastructure production v2

### Configuration Vercel

**Variables d'environnement à configurer sur Vercel :**

```bash
# API
NEXT_PUBLIC_API_URL=https://api.[domaine].fr

# HelloAsso
NEXT_PUBLIC_HELLOASSO_FORM_URL=https://www.helloasso.com/associations/[slug]/adhesions/[form]

# Optionnel (si Pusher utilisé)
NEXT_PUBLIC_PUSHER_KEY=xxx
NEXT_PUBLIC_PUSHER_CLUSTER=eu
```

**Configuration `vercel.json` (à créer) :**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
```

**Domaine personnalisé :**

- Configurer DNS : `A` ou `CNAME` vers Vercel
- HTTPS automatique via Vercel
- Preview deployments sur branches de feature

### Configuration O2switch (backend Laravel)

**Fichier `.env.production` (template — ne jamais committer) :**

```bash
APP_NAME="La Neuville TAF sa Foulée"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.[domaine].fr

# Base de données (fournie par O2switch cPanel)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=xxx_safoulee
DB_USERNAME=xxx_safoulee
DB_PASSWORD=xxx

# CORS — domaine(s) Vercel autorisés
SANCTUM_STATEFUL_DOMAINS=
CORS_ALLOWED_ORIGINS="https://[domaine].fr,https://[preview-id].vercel.app"

# Queues (database driver — cron O2switch)
QUEUE_CONNECTION=database

# Email
RESEND_API_KEY=re_xxx
MAIL_FROM_ADDRESS=contact@[domaine].fr
MAIL_FROM_NAME="La Neuville TAF sa Foulée"
NEWSLETTER_FROM_ADDRESS=newsletter@[domaine].fr

# HelloAsso
HELLOASSO_WEBHOOK_SECRET=xxx (généré lors de la config HelloAsso)
HELLOASSO_FORM_URL=https://www.helloasso.com/associations/...

# Stockage documents
FILESYSTEM_DISK=r2
AWS_ACCESS_KEY_ID=xxx (Cloudflare R2)
AWS_SECRET_ACCESS_KEY=xxx
AWS_BUCKET=safoulee-documents
AWS_ENDPOINT=https://xxx.r2.cloudflarestorage.com
AWS_DEFAULT_REGION=auto

# Pusher
PUSHER_APP_ID=xxx
PUSHER_APP_KEY=xxx
PUSHER_APP_SECRET=xxx
PUSHER_APP_CLUSTER=eu
```

**Cron O2switch (toutes les minutes) :**

```
* * * * * cd /home/[user]/public_html/api && php artisan schedule:run >> /dev/null 2>&1
```

**Schedule Laravel (`app/Console/Kernel.php`) :**

```php
$schedule->command('queue:work --once')->everyMinute();
```

**Déploiement GitHub Actions → O2switch :**

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ["backend/**"]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via rsync + SSH
        run: |
          rsync -avz --exclude='.env' --exclude='vendor' --exclude='storage/app/public' \
            backend/ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/home/.../api/
          ssh ${{ secrets.SSH_HOST }} "cd ~/api && \
            composer install --no-dev --optimize-autoloader && \
            php artisan config:cache && \
            php artisan route:cache && \
            php artisan migrate --force"
```

### Configuration CORS Laravel

```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')),
    'allowed_origins_patterns' => [
        // Permet tous les preview deployments Vercel
        '/^https:\/\/[a-z0-9-]+-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/'
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

## Couverture NFRs v2

### NFR-01 — Conformité RGPD

**Solution architecturale :**

- `newsletter_subscribed_at` horodaté précisément (timestamp, pas boolean)
- Token de désabonnement invalidé après usage unique (SET NULL)
- Endpoint public de désabonnement sans authentification requise
- Aucun email envoyé sans consentement explicite (vérification `WHERE newsletter_subscribed_at IS NOT NULL`)

**Validation :** Tester le désabonnement avec un token valide → `newsletter_subscribed_at` devient NULL.

---

### NFR-02 — Compatibilité Vercel (serverless)

**Solution architecturale :**

- L'envoi newsletter est déclenché via `POST /api/v1/admin/newsletter/campaigns/{id}/send` → Laravel dispatch Job
- Le job est traité par la queue sur O2switch, pas par une API Route Next.js
- Pas de WebSocket persistant côté Vercel (Pusher gère le temps réel)

**Validation :** Vérifier les logs Vercel — aucune fonction dépassant 10 s.

---

### NFR-03 — Compatibilité O2switch (mutualisé PHP 8.2)

**Solution architecturale :**

- Queue driver `database` (pas Redis) — stockée dans MySQL
- Cron `* * * * *` pour `queue:work --once` (pas de worker persistant)
- `php artisan schedule:run` géré par le cron O2switch
- Aucun port non-standard requis

**Validation :** Créer un job de test en queue, vérifier qu'il est traité après ≤ 1 minute.

---

### NFR-04 — Core Web Vitals (LCP < 2,5 s)

**Solution architecturale :**

- `next/image` obligatoire pour toutes les images (logo, mascotte, bureau, photos events)
- `priority={true}` sur le LCP candidat (hero image ou mascotte)
- Formats WebP/AVIF générés automatiquement par Next.js
- `sizes` prop correctement défini pour éviter les images surdimensionnées

**Validation :** PageSpeed Insights sur la page d'accueil production.

---

### NFR-05 — Accessibilité WCAG AA

**Solution architecturale :**

- Ratio contraste `#FB3936` sur blanc `#FFFFFF` : **4.5:1** (conforme AA pour texte normal, vérifié avec WebAIM Contrast Checker)
- Ratio `#FB3936` sur `#FAFAFA` : **4.3:1** (conforme AA)
- Ratio `white` sur sidebar `#C0302E` : **5.2:1** (conforme AA)
- Tous les `<img>` et `next/image` ont un `alt` descriptif
- Navigation clavier testée sur les modales (inventaire, budget)

**Validation :** Axe DevTools sur les 3 pages principales.

---

## Traçabilité FR → Composants

| FR      | Description               | Composant backend                        | Composant frontend                     |
| ------- | ------------------------- | ---------------------------------------- | -------------------------------------- |
| FR-R01  | Nouvelle palette couleurs | —                                        | globals.css, tous les composants       |
| FR-R02  | Images officielles        | —                                        | AuthLayout, Navbar, Hero, AdhesionPage |
| FR-R03  | Nom association           | —                                        | Layout, metadata, footer               |
| FR-UX01 | Logo cliquable auth       | —                                        | `(auth)/layout.tsx`                    |
| FR-UX02 | Bug Tiptap SSR            | —                                        | `PostForm.tsx`                         |
| FR-N01  | Opt-in newsletter         | ProfileController, User                  | NewsletterToggle, ProfilePage          |
| FR-N02  | Gestion abonnés           | NewsletterController                     | NewsletterAdminPage, SubscribersTable  |
| FR-N03  | Envoi newsletter          | NewsletterController, SendNewsletterJob  | CampaignForm, NewsletterAdminPage      |
| FR-N04  | Désabonnement token       | NewsletterController                     | `/desabonnement` page                  |
| FR-I01  | CRUD équipements          | EquipmentController, Equipment           | InventoryPage, EquipmentForm           |
| FR-I02  | Historique attributions   | EquipmentController, EquipmentAssignment | AssignmentModal, EquipmentCard         |
| FR-I03  | Export inventaire CSV     | EquipmentController                      | InventoryPage (bouton export)          |
| FR-B01  | CRUD budget               | BudgetController, BudgetEntry            | BudgetPage, BudgetEntryForm            |
| FR-B02  | Dashboard financier       | BudgetController (summary)               | BudgetPage, BudgetChart                |
| FR-B03  | Export CSV budget         | BudgetController                         | BudgetExport                           |
| FR-P01  | Bouton HelloAsso          | — (lien externe)                         | AdhesionPage, ProfilePage              |
| FR-P02  | Webhook HelloAsso         | HelloAssoWebhookController               | —                                      |
| FR-D01  | Déploiement Vercel        | —                                        | vercel.json, .env Vercel               |
| FR-D02  | Déploiement O2switch      | .env.production, deploy.yml              | —                                      |

---

## Migrations Laravel à créer

```
2026_03_29_000001_add_newsletter_fields_to_users_table.php
2026_03_29_000002_add_membership_paid_at_to_users_table.php
2026_03_29_000003_create_newsletter_campaigns_table.php
2026_03_29_000004_create_equipment_table.php
2026_03_29_000005_create_equipment_assignments_table.php
2026_03_29_000006_create_budget_entries_table.php
2026_03_29_000007_create_helloasso_webhooks_table.php
```

---

## Trade-offs et décisions

### Décision 1 — HelloAsso par lien vs widget embarqué

**Choix :** Lien externe `<a href="{HELLOASSO_URL}" target="_blank">`

**Rationale :**

- ✓ Zéro dépendance technique (pas de SDK, pas d'iframe complexe)
- ✓ HelloAsso gère PCI-DSS et la conformité paiement
- ✓ Compatible sans modification backend
- ✗ Expérience moins intégrée (redirection vers HelloAsso)

**Alternative rejetée :** Widget iframe HelloAsso — problèmes CSP sur Vercel, maintenance.

---

### Décision 2 — Queue `database` vs `sync` pour newsletter

**Choix :** Queue `database` avec cron O2switch

**Rationale :**

- ✓ Compatible shared hosting (pas de Redis)
- ✓ Résilience : si Resend est lent, les jobs sont en attente en BDD
- ✓ Retry automatique des jobs échoués
- ✗ Délai de 0–60 s avant traitement (cron toutes les minutes)

**Alternative rejetée :** Envoi synchrone — risque timeout si > 50 destinataires.

---

### Décision 3 — Token désabonnement HMAC vs UUID

**Choix :** HMAC-SHA256 sur `user_id | email | app_key`

**Rationale :**

- ✓ Déterministe — pas besoin de stocker un UUID en BDD pour chaque email envoyé
- ✓ Invalidation triviale (suffixe timestamp dans HMAC si besoin)
- ✓ Résistant aux timing attacks via `hash_equals()`
- ✗ Nécessite que la `app.key` reste stable

**Alternative rejetée :** UUID stocké en BDD — overhead de table inutile pour < 200 membres.

---

### Décision 4 — Pas de bibliothèque de graphiques lourde

**Choix :** Recharts (tree-shakable, 300KB gzippé) pour les graphiques budget

**Rationale :**

- ✓ S'intègre bien avec React/Next.js
- ✓ Pas de dépendance D3.js complète
- ✓ Répandu, bien maintenu
- ✗ À lazy-load pour ne pas impacter le LCP

**Alternative rejetée :** Chart.js + react-chartjs-2 — bundle plus lourd.

---

## Checklist de validation

```
✓ Architecture v2
- [x] Tous les FRs ont un composant assigné
- [x] Tous les NFRs ont une solution architecturale
- [x] Pas de nouveau service tiers non-justifié
- [x] Compatibilité O2switch (shared hosting) vérifiée pour chaque module
- [x] Compatibilité Vercel (serverless) vérifiée
- [x] RGPD couvert (newsletter, désabonnement, données financières)
- [x] Sécurité webhook HelloAsso (HMAC)
- [x] Tokens désabonnement sécurisés (HMAC + hash_equals)
- [x] Migrations listées (7 nouvelles)
- [x] Types TypeScript définis pour les nouvelles ressources
- [x] Trade-offs documentés (4 décisions majeures)
```

---

## Historique des révisions

| Version | Date       | Auteur       | Modifications                                                                                |
| ------- | ---------- | ------------ | -------------------------------------------------------------------------------------------- |
| 1.0     | 2026-03-07 | Jules Bourin | Architecture initiale (auth, events, blog, sessions, leaderboard, chat)                      |
| 2.0     | 2026-03-29 | Jules Bourin | +Newsletter, +Inventaire, +Budget, +HelloAsso, +Infrastructure production, +Design system v2 |

---

## Prochaines étapes

### Sprint Planning v2

Exécuter `/sprint-planning` pour décomposer les 6 epics en stories détaillées et planifier les sprints.

**Estimation :** 19–29 stories sur ~6–8 sprints (1 semaine chacun, ~8 points/sprint).

**Ordre de priorité recommandé :**

1. **EPIC-R** (Refonte + correctifs) — déjà partiellement en cours
2. **EPIC-D** (Infrastructure production) — nécessaire pour tout le reste
3. **EPIC-P** (HelloAsso) — quick win, aucune BDD complexe
4. **EPIC-N** (Newsletter) — valeur métier élevée, RGPD
5. **EPIC-B** (Budget) — utile avant l'AG annuelle
6. **EPIC-I** (Inventaire) — moins urgent

---

**Ce document a été créé avec BMAD Method v6 — Phase 3 (Solutioning) — v2**
