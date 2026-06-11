# 01 — Architecture & Qualité de code

Audit du monorepo saFoulée (backend Laravel 11 `backend/`, frontend Next.js App Router `frontend/`, MySQL 8).
Le code est globalement lisible et les migrations sont soignées, mais les deux garde-fous qualité (Larastan, tsc)
sont neutralisés par des mécanismes de contournement, et l'architecture backend annoncée dans le CLAUDE.md n'est pas appliquée.

## Vue d'ensemble

| Axe | État | Preuve clé |
| --- | --- | --- |
| Typage frontend | 🔴 165 erreurs tsc masquées | `frontend/next.config.ts:7` (`ignoreBuildErrors: true`) |
| Analyse statique backend | 🟠 64 erreurs masquées | `backend/phpstan-baseline.neon` (Larastan lvl 5 : « 0 erreur ») |
| Architecture backend | 🟠 0 Service, 0 Policy, 0 API Resource | `backend/app/Services/`, `app/Policies/` vides |
| Validation | 🟠 16 Form Requests mais 15 `validate()` inline | `BudgetEntryController.php:19,66,91,175` |
| Migrations / BDD | 🟢 FK contraintes + indexes pertinents | `2026_03_07_000005_create_events_table.php:18,24,33` |
| Models | 🟢 `$fillable`, `casts()`, relations typées partout | `app/Models/Event.php:15,25,33` |

---

## Backend Laravel

### [🟠] Architecture en couches absente malgré la convention projet
- **Sévérité** : 🟠 Majeur
- **Preuve** : `backend/app/Services/` et `app/Policies/` vides (0 fichier) ; `BudgetEntryController.php` (284 lignes) contient agrégats SQL, génération CSV (l.173-261) et sérialisation JSON (l.265-283).
- **Constat** : Le CLAUDE.md racine impose « Controllers minces → Services » et « Policies pour les autorisations ». Aucune de ces couches n'existe : toute la logique métier vit dans 22 controllers (2 557 lignes au total).
- **Recommandation** : Extraire les cas les plus chargés (export CSV budget, summary) vers des Services ; introduire des Policies pour Event/BudgetEntry.
- **Effort** : L

### [🟠] Validation inline au lieu des Form Requests existants
- **Sévérité** : 🟠 Majeur
- **Preuve** : 15 appels `$request->validate(` dans 10 controllers (`BudgetEntryController.php:19,66,91,175`, `CampaignController.php` ×2, `NewsletterController.php` ×2…) alors que 16 Form Requests existent (`app/Http/Requests/`).
- **Constat** : Deux styles de validation coexistent ; les controllers récents (Budget, Newsletter) ignorent la convention pourtant suivie par Event/Auth (`StoreEventRequest`, `LoginRequest`).
- **Recommandation** : Migrer les 15 appels inline vers des Form Requests dédiés pour uniformiser.
- **Effort** : M

### [🟠] Requête N+1 sur la liste des événements
- **Sévérité** : 🟠 Majeur
- **Preuve** : `app/Http/Controllers/Api/V1/EventController.php:199-201` — `is_registered` exécute `$event->participants()->where(...)->exists()` dans le `map()` de `index()` (l.53).
- **Constat** : Chaque page de 12 événements déclenche 12 requêtes EXISTS supplémentaires.
- **Recommandation** : Remplacer par `withExists(['participants as is_registered' => fn ($q) => $q->where('user_id', $userId)])` sur la query principale.
- **Effort** : S

### [🟠] Baseline Larastan masquant 64 erreurs
- **Sévérité** : 🟠 Majeur
- **Preuve** : `backend/phpstan-baseline.neon` (64 erreurs ignorées) ; Larastan niveau 5 affiche « 0 erreur ».
- **Constat** : Le signal « analyse statique verte » est trompeur : la dette est gelée dans la baseline et peut croître par-dessus.
- **Recommandation** : Budgéter la résorption de la baseline (corriger par lot, régénérer) et interdire son extension en CI.
- **Effort** : M

### [🔴] 14 routes pointent vers des controllers supprimés — `route:list`/`route:cache` cassés
- **Sévérité** : 🔴 Critique
- **Preuve** : `routes/api.php:7,19,26` importe `ChatController`, `NotificationController`, `StravaController`, absents de `app/Http/Controllers/Api/V1/`. Reproduit : `php artisan route:list` → `ReflectionException: Class "App\Http\Controllers\Api\V1\StravaController" does not exist`.
- **Constat** : Les 14 routes chat/notifications/strava (`api.php:361-391`) renvoient une erreur 500 si elles sont appelées, et `php artisan route:cache` (optimisation standard en prod) est impossible. Le frontend embarque encore `lib/pusher.ts` (jamais importé) — vestiges d'une feature retirée à moitié.
- **Recommandation** : Supprimer les imports et les 14 routes mortes (ou restaurer les controllers si la feature est prévue) ; ajouter `php artisan route:list` au job CI backend pour détecter ce cas.
- **Effort** : S

### [🟡] Autorisations et sérialisation dupliquées dans les controllers
- **Sévérité** : 🟡 Mineur
- **Preuve** : `EventController.php:46,73` (`hasAnyRole` dupliqué index/show), `:117-120` (règle de suppression inline) ; helpers privés `formatEvent()` (`EventController.php:187`), `formatUser()` (`AuthController.php:145`), `format()` (`BudgetEntryController.php:265`).
- **Constat** : Les rôles sont vérifiés via middleware `role:` (`routes/api.php:94-319`) plus des checks inline, et chaque controller réinvente sa sérialisation JSON — pas d'API Resources, schéma de réponse non garanti.
- **Recommandation** : Centraliser les règles dans des Policies (`viewAny`, `delete`) et remplacer les helpers `format*()` par des `JsonResource`.
- **Effort** : M

### [🔵] SQL brut localisé dans les agrégats budget
- **Sévérité** : 🔵 Suggestion
- **Preuve** : `BudgetEntryController.php:127-129` (`selectRaw("DATE_FORMAT(entry_date, '%Y-%m')…")`), `:153`.
- **Constat** : La convention tolère le SQL brut « documenté » ; l'usage est légitime (agrégats mensuels) mais non documenté et lie le code à MySQL.
- **Recommandation** : Ajouter un commentaire justificatif ou déplacer dans un scope/Service dédié.
- **Effort** : S

## Frontend Next.js

### [🔴] Arguments génériques supprimés dans 35 fichiers — typage anéanti
- **Sévérité** : 🔴 Critique
- **Preuve** : `tsc --noEmit` : 165 erreurs / 45 fichiers dont 139 × TS2314. Exemples : `src/lib/api.ts:10,17,24,28` (`headers?: Record`, `Promise` sans `<T>`), `src/lib/settings.ts:16,20,24`, `src/components/features/sessions/SessionCard.tsx:11,20,29,35` (`Record` nu), `src/types/index.ts:238,248,268` (`Pick`, `Record` nus). 124 annotations `Record/Promise/Pick/Partial/Omit` sans argument dans 35 fichiers.
- **Constat** : Un outil (codemod/regex) a vraisemblablement supprimé les `<…>` des types génériques sur tout `src/lib` et `src/types`. Le code s'exécute (types effacés au runtime) mais la type-safety est détruite ; les 8 warnings ESLint `no-unused-vars` (SessionCard ×3, etc.) sont un symptôme : les types importés ne sont plus référencés par les annotations mutilées.
- **Recommandation** : Restaurer les génériques via `git log -p` sur ces fichiers (la version d'origine existe probablement dans l'historique), puis verrouiller avec `tsc --noEmit` en CI.
- **Effort** : M

### [🔴] `ignoreBuildErrors: true` neutralise TypeScript au build
- **Sévérité** : 🔴 Critique
- **Preuve** : `frontend/next.config.ts:7`.
- **Constat** : Le build Next passe au vert malgré 165 erreurs ; c'est ce flag qui a permis à la régression des génériques (ci-dessus) de passer inaperçue.
- **Recommandation** : Supprimer le flag dès la restauration des génériques ; en attendant, ajouter un job CI `tsc --noEmit` non bloquant pour suivre le compteur.
- **Effort** : S

### [🟡] Styles inline statiques en violation de la convention CLAUDE.md
- **Sévérité** : 🟡 Mineur
- **Preuve** : `src/app/(public)/layout.tsx:48,74` (`display: 'flex'`, `gap: '2rem'` statiques), `LandingFooter.tsx:33,44`, `FinalCTASection.tsx:76`, `AboutSection.tsx:103` (`display: 'inline-flex'` inline sur un lien).
- **Constat** : La règle « valeur statique → classe Tailwind » est massivement contournée sur la landing et les layouts. La règle critique display/responsive est en revanche respectée sur les cas sensibles vérifiés (nav `hidden items-center md:flex`, `layout.tsx:76`), mais chaque `display` inline statique reste un piège si un utilitaire responsive est ajouté plus tard.
- **Recommandation** : Convertir progressivement (`flex items-center gap-8`) en priorisant les éléments susceptibles de devenir responsives.
- **Effort** : M

### [🟡] Composants clients monolithiques
- **Sévérité** : 🟡 Mineur
- **Preuve** : `AdminUsersPage.tsx` 1 249 lignes, `ActivitesPage.tsx` 1 194, `LeaderboardPage.tsx` 1 050, `BudgetPage.tsx` 921 — tous `'use client'`. 42 des 78 `.tsx` sont clients ; les pages App Router restent serveur (2/22 en client), mais ce sont des coquilles : tout le fetch passe côté client via `localStorage` (`src/lib/api.ts:29-32`).
- **Constat** : Le découpage Server/Client est nominal : aucun data-fetching serveur, donc pas de bénéfice RSC (SEO, streaming) sur les pages de contenu, et des composants difficiles à maintenir/tester.
- **Recommandation** : Découper les 4 pages > 900 lignes en sous-composants ; envisager le fetch serveur (cookies httpOnly) pour les pages publiques (activités, blog).
- **Effort** : L

## Base de données

### [🔵] Schéma sain — FK contraintes et indexes alignés sur les requêtes
- **Sévérité** : 🔵 Suggestion
- **Preuve** : `2026_03_07_000005_create_events_table.php:18` (`constrained()->restrictOnDelete()`), `:24` (`idx_events_date` ↔ filtre `event_date` de `EventController::index`), `:33` (unique `event_id+user_id`) ; `2026_03_29_000006_create_budget_entries_table.php:28-29` (`idx_budget_type_cat`, `idx_budget_date` ↔ filtres de `BudgetEntryController::index`).
- **Constat** : Point fort : toutes les FK échantillonnées sont contraintes avec stratégie de suppression explicite et les indexes correspondent aux colonnes filtrées. Seule réserve : les colonnes `enum` MySQL (`events.type:15`, `budget_entries.type:17`) rendent les évolutions de valeurs coûteuses (ALTER TABLE).
- **Recommandation** : Conserver la pratique ; pour les prochains types, préférer `string` + validation applicative ou table de référence.
- **Effort** : S

---

## Récapitulatif

| Constat | Sévérité | Effort |
| --- | --- | --- |
| Génériques TypeScript supprimés (165 erreurs tsc, 35 fichiers) | 🔴 Critique | M |
| `ignoreBuildErrors: true` au build Next | 🔴 Critique | S |
| 14 routes vers controllers supprimés (`route:cache` cassé) | 🔴 Critique | S |
| Aucune couche Service / Policy / API Resource | 🟠 Majeur | L |
| Validation inline ×15 malgré 16 Form Requests | 🟠 Majeur | M |
| N+1 `is_registered` sur la liste des événements | 🟠 Majeur | S |
| Baseline Larastan masquant 64 erreurs | 🟠 Majeur | M |
| Autorisations et sérialisation dupliquées en controller | 🟡 Mineur | M |
| Styles inline statiques contraires au CLAUDE.md | 🟡 Mineur | M |
| Composants clients > 900 lignes, fetch 100 % client | 🟡 Mineur | L |
| SQL brut non documenté (agrégats budget) | 🔵 Suggestion | S |
| Schéma BDD sain (point fort) — réserve sur les `enum` | 🔵 Suggestion | S |
