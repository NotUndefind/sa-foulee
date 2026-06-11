# 02 — Sécurité

Audit défensif autorisé du monorepo saFoulée (backend Laravel 11 + Sanctum + Spatie, frontend Next.js 16). Périmètre : contrôle d'accès (IDOR), uploads, webhook de paiement, authentification, en-têtes et dépendances. **Bonne nouvelle d'emblée : aucun IDOR n'a été confirmé** — les contrôles d'ownership (`user_id` / rôle) sont présents et corrects sur Documents, Performances, Commentaires, Posts et Photos. Les risques résiduels portent surtout sur les dépendances, le XSS du blog et l'absence de durcissement (rate limit, CSP).

| # | Constat | Sévérité | Effort |
|---|---------|----------|--------|
| 1 | Next.js 16.2.1 — advisories HIGH (bypass middleware, cache poisoning) | 🔴 Critique | S |
| 2 | XSS stocké via contenu Tiptap non sanitizé | 🟠 Majeur | M |
| 3 | Token Bearer en `localStorage` | 🟠 Majeur | M |
| 4 | Pas de rate limit sur register / forgot / reset | 🟠 Majeur | S |
| 5 | Dépendances Composer obsolètes (9 advisories) | 🟠 Majeur | S |
| 6 | Aucune CSP + en-têtes sécurité absents des pages | 🟠 Majeur | M |
| 7 | Webhook HelloAsso : bypass si secret vide | 🟡 Mineur | S |
| 8 | Énumération d'emails à l'inscription | 🟡 Mineur | S |
| 9 | Aucune garde serveur (pas de `middleware.ts`) | 🟡 Mineur | M |
| 10 | CORS : localhost autorisé + `supports_credentials` | 🟡 Mineur | S |
| 11 | postcss / brace-expansion (moderate) | 🔵 Suggestion | S |

---

## Dépendances vulnérables

### [Critique] Next.js 16.2.1 expose plusieurs failles HIGH
- **Sévérité** : 🔴 Critique
- **Preuve** : `npm audit` (frontend) — GHSA-26hh-7cqf-hhc6, GHSA-492v-c6pp-mqqv, GHSA-wfc6-r584-vfw7
- **Constat** : Le frontend déployé sur Vercel tourne sur une version vulnérable à des bypass de middleware/proxy, du cache poisoning RSC, du XSS sur nonces CSP et du DoS sur l'optimisation d'images. Exploitable à distance sans authentification.
- **Recommandation** : `npm audit fix` puis monter Next.js à la dernière patch ; revalider le build Vercel.
- **Effort** : S

### [Majeur] Dépendances Composer obsolètes — 9 advisories sur 7 paquets
- **Sévérité** : 🟠 Majeur
- **Preuve** : `composer audit` (backend) — laravel/framework, symfony/mime (HIGH), symfony/{routing,mailer,http-kernel,http-foundation}, symfony/polyfill-intl-idn
- **Constat** : Le cœur du backend (données membres, documents, budget) repose sur des versions avec failles connues, dont une HIGH sur symfony/mime.
- **Recommandation** : `composer update` puis relancer la suite de tests et `composer audit`.
- **Effort** : S

### [Suggestion] postcss & brace-expansion (moderate)
- **Sévérité** : 🔵 Suggestion
- **Preuve** : `npm audit` — postcss (XSS), brace-expansion (ReDoS)
- **Constat** : Failles de build/tooling, impact limité en production.
- **Recommandation** : Inclus dans `npm audit fix`.
- **Effort** : S

---

## API & Backend

### [Info] Aucun IDOR confirmé — contrôles d'ownership corrects
- **Sévérité** : 🔵 Suggestion (constat positif)
- **Preuve** : `DocumentController.php:138` (`authorizeAccess`), `PerformanceController.php:23-25`, `CommentController.php:66`, `PostController.php:80`, `EventPhotoController.php:39`
- **Constat** : Chaque `show`/`download`/`update`/`destroy` vérifie `user_id === current` ou un rôle élevé. Le budget et l'inventaire sont des ressources partagées volontairement accessibles à bureau+ (pas un IDOR). `Performance::store` force `user_id = current`.
- **Recommandation** : Externaliser ces contrôles répétés dans des Policies Laravel pour cohérence et testabilité (founder est admis sur les perfs mais pas sur les docs d'autrui — incohérence mineure à arbitrer).
- **Effort** : M

### [Majeur] Pas de limitation de débit sur register / forgot-password / reset-password
- **Sévérité** : 🟠 Majeur
- **Preuve** : `AuthController.php` (login throttlé l.59-86, les autres non) ; `routes/api.php` (aucun middleware `throttle` sur le groupe API)
- **Constat** : Seul `login` a un anti-bruteforce manuel. `forgot-password` permet le mail-bombing d'un membre, `register` le spam de comptes, `reset-password` le brute-force de token. Aucun garde-fou global.
- **Recommandation** : Appliquer `throttle:` sur les routes `auth/*` (ex. 6/min) ou un `throttle` global sur le groupe `v1`.
- **Effort** : S

### [Mineur] Énumération d'emails à l'inscription
- **Sévérité** : 🟡 Mineur
- **Preuve** : `RegisterRequest.php` (`unique:users,email` → message « Cette adresse e-mail est déjà utilisée »)
- **Constat** : `login` et `forgot-password` renvoient des messages génériques (bien), mais l'inscription confirme l'existence d'un compte, permettant d'énumérer les membres.
- **Recommandation** : Accepter l'inscription en silence puis notifier par email, ou message neutre. Compromis UX à valider avec le propriétaire.
- **Effort** : S

### [Mineur] Webhook HelloAsso : signature contournée si secret absent
- **Sévérité** : 🟡 Mineur
- **Preuve** : `VerifyHelloAssoSignature.php:20-23` (`if (empty($secret)) return $next($request);`)
- **Constat** : La comparaison utilise bien `hash_equals` (timing-safe) — correct. Mais si `HELLOASSO_WEBHOOK_SECRET` n'est pas défini en prod, le endpoint accepte n'importe quel POST et peut falsifier cotisations + écritures budgétaires.
- **Recommandation** : Refuser (401) si le secret est vide hors environnement `local`/`testing`.
- **Effort** : S

---

## Frontend & Auth

### [Majeur] XSS stocké — contenu Tiptap rendu sans sanitisation
- **Sévérité** : 🟠 Majeur
- **Preuve** : `frontend/src/components/features/blog/PostCard.tsx:194` et `PublicBlogPage.tsx:86` (`dangerouslySetInnerHTML={{ __html: post.content }}`) ; `PostController.php:store/update` stocke `content` brut ; aucune dépendance DOMPurify/sanitize-html ni `strip_tags` côté back.
- **Constat** : Un rôle pouvant publier (admin/founder/coach/**bureau**) peut injecter du HTML/JS exécuté sur la page publique du blog et le tableau de bord de tous les visiteurs. Couplé au token en `localStorage` (ci-dessous), permet le vol de session.
- **Recommandation** : Sanitiser le HTML à l'écriture (HTMLPurifier côté Laravel) **et** au rendu (DOMPurify) — défense en profondeur.
- **Effort** : M

### [Majeur] Token Bearer stocké en localStorage
- **Sévérité** : 🟠 Majeur
- **Preuve** : `frontend/src/lib/api.ts:30` (`localStorage.getItem('auth_token')`)
- **Constat** : Le token Sanctum est accessible en JavaScript : toute faille XSS (cf. blog) l'exfiltre. Pas d'attribut `HttpOnly`.
- **Recommandation** : Migrer vers un cookie `HttpOnly` + `Secure` + `SameSite`, ou à défaut prioriser la fermeture du XSS et raccourcir la durée de vie des tokens.
- **Effort** : M

### [Mineur] Aucune garde côté serveur (pas de `middleware.ts` Next)
- **Sévérité** : 🟡 Mineur
- **Preuve** : absence de `frontend/middleware.ts` ; gardes uniquement client (`RoleGate`, `AuthProvider`)
- **Constat** : Les routes `/tableau-de-bord` ne sont protégées qu'en client. L'API exigeant `auth:sanctum` (401 sans token), les **données** restent protégées ; le risque est surtout l'exposition de structure/UI et un flash de contenu avant redirection.
- **Recommandation** : Ajouter un `middleware.ts` vérifiant la présence du token et redirigeant vers `/connexion` (défense en profondeur).
- **Effort** : M

---

## Headers & Transport

### [Majeur] Aucune CSP et en-têtes de sécurité absents des pages
- **Sévérité** : 🟠 Majeur
- **Preuve** : `frontend/vercel.json` — bloc `headers` limité à `source: "/api/(.*)"`, donc les **pages** HTML ne reçoivent ni `X-Frame-Options`, ni `nosniff`, ni CSP ; aucune directive `Content-Security-Policy` nulle part.
- **Constat** : En l'absence de CSP, une injection (cf. XSS blog) s'exécute sans restriction d'origine de script. Les pages restent aussi clickjackables.
- **Recommandation** : Étendre les en-têtes à `source: "/(.*)"` et ajouter une CSP stricte (`script-src 'self'`, `frame-ancestors 'none'`, …).
- **Effort** : M

### [Mineur] CORS — localhost autorisé en prod et `supports_credentials`
- **Sévérité** : 🟡 Mineur
- **Preuve** : `config/cors.php` — pattern `#^http://localhost(:\d+)?$#` actif quel que soit l'environnement, `supports_credentials => true` ; `CorsMiddleware.php` (codé en dur sur `dev.laneuvilletafsafoulee.fr`) non enregistré dans `bootstrap/app.php` (seul `HandleCors` est `prepend`).
- **Constat** : `localhost` reste une origine acceptée en production. Impact faible (origine attaquant ≠ localhost), mais surface inutile. `CorsMiddleware` est du code mort source de confusion.
- **Recommandation** : Conditionner le pattern localhost à l'env local et supprimer `CorsMiddleware`.
- **Effort** : S

---

## Récapitulatif

| Constat | Sévérité | Effort |
|---------|----------|--------|
| Next.js 16.2.1 — advisories HIGH | 🔴 Critique | S |
| XSS stocké blog (Tiptap non sanitizé) | 🟠 Majeur | M |
| Token Bearer en localStorage | 🟠 Majeur | M |
| Pas de rate limit register/forgot/reset | 🟠 Majeur | S |
| Dépendances Composer obsolètes (9 advisories) | 🟠 Majeur | S |
| Aucune CSP / en-têtes pages | 🟠 Majeur | M |
| Webhook HelloAsso bypass si secret vide | 🟡 Mineur | S |
| Énumération d'emails (register) | 🟡 Mineur | S |
| Pas de garde serveur Next | 🟡 Mineur | M |
| CORS localhost + credentials | 🟡 Mineur | S |
| postcss / brace-expansion | 🔵 Suggestion | S |

> **Note hors-sécurité relevée au passage** : `routes/api.php` importe `ChatController`, `NotificationController` et `StravaController` qui n'existent pas — constat vérifié et détaillé dans `01-architecture.md` (14 routes en erreur 500, `route:cache` impossible).
