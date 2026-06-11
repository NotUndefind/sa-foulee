# 03 — Performance

Audit performance du monorepo saFoulée : backend Laravel 11 (O2switch mutualisé — cache `file`, queue `database`, pas de Redis) et frontend Next.js App Router (Vercel hobby). Le build Next est sain (23 pages, quasi toutes statiques, Turbopack 2.6 s) ; les principaux risques sont des N+1 côté API et un rendu 100 % client des pages publiques.

| Domaine | État global |
| --- | --- |
| Backend Laravel | 🟠 N+1 confirmés sur events/sessions, listes non paginées, pas d'API Resources |
| Frontend Next.js | 🟠 Pages publiques fetch client-side malgré un App Router statique |
| Assets & réseau | 🟢 Assets légers, next/font OK ; quelques `<img>` bruts |

---

## Backend Laravel

### [🟠] N+1 : `is_registered` / `has_participated` recalculés par item
- **Sévérité** : 🟠 Majeur
- **Preuve** : `backend/app/Http/Controllers/Api/V1/EventController.php:200` et `SessionController.php:206-209`
- **Constat** : Les listes paginées (`paginate(12)`, EventController.php:51 / SessionController.php:29) appellent `formatEvent`/`formatSession` qui exécutent `$x->participants()->where('user_id', …)->exists()` pour **chaque** item : +12 requêtes SQL par page, alors que `withCount('participants')` est déjà éager-loadé.
- **Recommandation** : Remplacer par `withExists(['participants as is_registered' => fn ($q) => $q->where('user_id', $userId)])` sur la query de liste (1 seule requête). Idem pour `templates()`.
- **Effort** : S

### [🟡] Listes non paginées (`->get()` sans limite)
- **Sévérité** : 🟡 Mineur
- **Preuve** : `SessionController.php:70` (templates), `EquipmentController.php:30,99`, `DocumentController.php:24,88`, `CampaignController.php:22,79`, `EventPhotoController.php:21`
- **Constat** : 7 endpoints de liste retournent l'intégralité de la table sans pagination. Volumes faibles pour un club aujourd'hui, mais `DocumentController:88` (admin, `with('user')` complet) et `EventPhotoController` grossiront avec l'usage.
- **Recommandation** : Ajouter `paginate()` (ou au minimum `limit()`) sur les endpoints amenés à croître : documents admin, photos d'événements, campagnes.
- **Effort** : S

### [🟡] Pas d'API Resources — sérialisation hétérogène
- **Sévérité** : 🟡 Mineur
- **Preuve** : aucun fichier dans `backend/app/Http/Resources/` ; ex. `DocumentController.php:85` (`with('user')` → modèle User complet sérialisé), vs formatters manuels privés (`formatEvent`, `formatSession`)
- **Constat** : Chaque controller réinvente son format de sortie ; certains endpoints renvoient les modèles Eloquent bruts (tous les attributs, relations complètes), ce qui gonfle les payloads et expose des champs inutiles.
- **Recommandation** : Introduire des `JsonResource` Laravel par modèle exposé : payloads maîtrisés et formatters dédupliqués, sans coût infra.
- **Effort** : M

### [🔵] StatsController : cache annoncé mais non implémenté côté serveur
- **Sévérité** : 🔵 Suggestion
- **Preuve** : `backend/app/Http/Controllers/Api/V1/StatsController.php:14-26`
- **Constat** : Le docblock annonce « cache 5 min » mais seul un header `Cache-Control` est posé ; `User::count()` + `Performance::sum()` s'exécutent à chaque hit. Impact faible (2 requêtes simples, et la home Next revalide toutes les 300 s).
- **Recommandation** : Envelopper dans `Cache::remember('stats:homepage', 300, …)` (driver `file`, fonctionne sur O2switch) pour cohérence avec le leaderboard.
- **Effort** : S

### [🔵] Bon point — leaderboard agrégé et caché
- **Sévérité** : 🔵 Suggestion (RAS, à conserver)
- **Preuve** : `backend/app/Http/Controllers/Api/V1/LeaderboardController.php:30-53`
- **Constat** : Agrégat SQL (`SUM`/`COUNT` + `GROUP BY` + `LIMIT 50`) sous `Cache::remember` 300 s, avec invalidation à la suppression de performance (`PerformanceController.php:60-62`). C'est le pattern à généraliser. Noter : `store()` d'une performance n'invalide pas le cache (staleness max 5 min, acceptable).
- **Recommandation** : Optionnel : `Cache::forget` aussi dans `PerformanceController::store()` pour symétrie.
- **Effort** : S

---

## Frontend Next.js

### [🟠] Pages publiques /blog et /evenements rendues 100 % côté client
- **Sévérité** : 🟠 Majeur
- **Preuve** : `frontend/src/components/features/blog/PublicBlogPage.tsx:1` et `events/PublicEventsPage.tsx:1` (`'use client'` + `useEffect` + `getPosts`/`getEvents` via `src/lib/api.ts`)
- **Constat** : Ces pages SEO-critiques affichent un spinner puis fetchent l'API Laravel depuis le navigateur (waterfall : HTML → JS → API O2switch). Le contenu n'est ni dans le HTML initial ni mis en cache, alors que la home fait déjà de l'ISR (`(public)/page.tsx:22`, `revalidate = 300`).
- **Recommandation** : Convertir en Server Components avec `fetch(..., { next: { revalidate: 300 } })` comme la home ; garder un composant client uniquement pour la pagination/filtres. Gratuit sur Vercel hobby, gros gain LCP + SEO.
- **Effort** : M

### [🟡] Tiptap importé statiquement dans les formulaires
- **Sévérité** : 🟡 Mineur
- **Preuve** : `frontend/src/components/features/blog/PostForm.tsx:7-8`, `newsletter/CampaignForm.tsx:4-5`
- **Constat** : `@tiptap/react` + `starter-kit` sont importés en statique et alourdissent le chunk des pages blog/newsletter du dashboard, même pour les utilisateurs qui n'éditent rien. À l'inverse, recharts est bien chargé en `dynamic()` (`BudgetPage.tsx:16`, `ssr: false`) — seul usage de `next/dynamic` du projet.
- **Recommandation** : Charger l'éditeur via `next/dynamic` (affiché seulement à l'ouverture du formulaire), sur le modèle de `BudgetChart`.
- **Effort** : S

### [🟡] pusher-js : dépendance morte
- **Sévérité** : 🟡 Mineur
- **Preuve** : `frontend/package.json:26` (`pusher-js: ^8.4.0`) ; `frontend/src/lib/pusher.ts` n'est importé **nulle part** (`grep getPusherClient` → seule la définition)
- **Constat** : Aucune connexion Pusher n'est établie (ni pour les visiteurs ni pour les membres) : `lib/pusher.ts` est du code mort. Pas de coût runtime actuel, mais une dépendance à maintenir et un risque de réintroduction non maîtrisée.
- **Recommandation** : Supprimer `pusher-js` et `src/lib/pusher.ts`, ou — si le chat revient — n'instancier le client que derrière l'auth, en import dynamique.
- **Effort** : S

### [🔵] `<img>` bruts au lieu de next/image
- **Sévérité** : 🔵 Suggestion
- **Preuve** : `frontend/src/components/features/blog/PostCard.tsx:154`, `PublicBlogPage.tsx:66`, `PostForm.tsx:398`, `profile/ProfilePage.tsx:235`
- **Constat** : 4 `<img>` natifs (images de posts et avatars, URLs venant de l'API) vs `next/image` utilisé dans 10 fichiers. Pas de resize/lazy/AVIF sur ces images distantes, dont celles de la page blog publique.
- **Recommandation** : Passer à `next/image` avec `remotePatterns` vers le domaine O2switch (l'optimisation d'images Vercel hobby couvre largement ce volume).
- **Effort** : S

---

## Assets & réseau

### [🔵] Assets statiques sains, polices via next/font
- **Sévérité** : 🔵 Suggestion (RAS)
- **Preuve** : `frontend/public/` = 380 Ko au total, plus gros fichier `bureau.png` 129 Ko ; `frontend/src/app/layout.tsx:2,6` (`Geist` via `next/font/google`, self-hosted, zéro layout shift)
- **Constat** : Aucun asset > 300 Ko, polices optimisées par `next/font`. Seule incohérence : la charte (CLAUDE.md) annonce Baloo 2 comme police principale, mais c'est Geist qui est chargée.
- **Recommandation** : Optionnel : convertir les PNG en WebP (~-60 % sur `bureau.png`) ; trancher Geist vs Baloo 2.
- **Effort** : S

### [🔵] ISR déjà en place sur la home — à généraliser
- **Sévérité** : 🔵 Suggestion
- **Preuve** : `frontend/src/app/(public)/page.tsx:22,41-42,56-57` (`revalidate = 300` + `next: { revalidate: 300 }` sur events et stats)
- **Constat** : La home protège déjà l'hébergement mutualisé O2switch : 1 requête API max toutes les 5 min, le reste servi par le CDN Vercel. C'est exactement la bonne stratégie vu l'infra.
- **Recommandation** : Étendre ce pattern à /blog et /evenements (cf. constat majeur ci-dessus) — c'est la mesure au meilleur ratio effort/gain de l'audit.
- **Effort** : S

---

## Récapitulatif

| Constat | Sévérité | Effort |
| --- | --- | --- |
| N+1 `is_registered`/`has_participated` (events, sessions) | 🟠 Majeur | S |
| Pages publiques /blog et /evenements en client-side fetch | 🟠 Majeur | M |
| Listes non paginées (7 endpoints `->get()`) | 🟡 Mineur | S |
| Pas d'API Resources, payloads bruts | 🟡 Mineur | M |
| Tiptap importé statiquement | 🟡 Mineur | S |
| pusher-js dépendance morte | 🟡 Mineur | S |
| StatsController sans `Cache::remember` | 🔵 Suggestion | S |
| `<img>` bruts (4 occurrences) | 🔵 Suggestion | S |
| PNG → WebP, Geist vs Baloo 2 | 🔵 Suggestion | S |
| Généraliser l'ISR (déjà OK sur la home) | 🔵 Suggestion | S |
