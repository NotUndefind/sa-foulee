# Sprint Plan : La Neuville TAF sa Foulée — v3

**Date :** 2026-03-30
**Scrum Master :** Jules Bourin
**Niveau projet :** 2
**PRD source :** `docs/prd-saFoulee-2026-03-30.md`
**Sprint précédent (v2) :** `docs/sprint-plan-saFoulee-2026-03-29-v2.md`

---

## Résumé exécutif

Ce plan couvre les **16 nouvelles stories** issues du PRD v3 (2026-03-30), réparties sur **5 sprints** d'une semaine. Les sprints v1 (1–8) et v2 (9–15) restent inchangés. La numérotation des sprints reprend à Sprint 16.

**Métriques clés :**
- Stories v3 : 16 stories
- Points totaux : 48 points
- Sprints planifiés : 5 (Sprint 16 → Sprint 20)
- Capacité : ~10–11 pts/sprint (1 dev, 4 h/jour productives, 1 semaine)
- Vélocité cible : 11 pts/sprint (moyenne v1/v2)
- Livraison estimée : 2026-05-03

**Priorité des epics :**
1. **EPIC-FX** — Bugs bloquants (budget, leaderboard, inventaire, newsletter) → Sprint 16
2. **EPIC-H** — Refonte page d'accueil (stats lisibles, nom asso, green purge) + **EPIC-EV** → Sprint 17
3. **EPIC-BL** — Blog (upload média, suppression brouillons, fix submit) → Sprint 18
4. **EPIC-A** — Paramètres admin + toggle classement → Sprint 19
5. **EPIC-H02** — Hero header redesign (illustration dynamique) → Sprint 20

---

## Inventaire des stories

### EPIC-FX — Corrections de Bugs

---

#### STORY-V3-FX01 : Budget — Ajouter la colonne `receipt_url` manquante

**Epic :** EPIC-FX
**Priorité :** Must Have
**Points :** 1

**User Story :**
En tant que trésorier,
Je veux pouvoir enregistrer une dépense ou une recette sans erreur SQL,
Afin de tenir les comptes de l'association à jour.

**Critères d'acceptation :**
- [ ] Une migration `add_receipt_url_to_budget_entries_table` est créée et exécutée
- [ ] La colonne `receipt_url VARCHAR(500) NULLABLE` existe dans `budget_entries`
- [ ] L'ajout d'une dépense/recette fonctionne (avec ou sans `receipt_url`)
- [ ] Les entrées existantes ne sont pas modifiées

**Notes techniques :**
- Fichier : `backend/database/migrations/YYYY_add_receipt_url_to_budget_entries_table.php`
- Commande : `$table->string('receipt_url', 500)->nullable()->after('description');`
- Après migration : tester le formulaire budget complet

**Dépendances :** aucune

---

#### STORY-V3-FX02 : Leaderboard — Corriger la query sur `performances.deleted_at`

**Epic :** EPIC-FX
**Priorité :** Must Have
**Points :** 1

**User Story :**
En tant que membre,
Je veux voir le classement s'afficher sans erreur,
Afin de consulter les performances de l'association.

**Critères d'acceptation :**
- [ ] La page classement se charge sans erreur SQL
- [ ] Le classement affiche les performances correctement
- [ ] Aucun `->whereNull('performances.deleted_at')` dans `LeaderboardController`

**Notes techniques :**
- Fichier : `backend/app/Http/Controllers/Api/V1/LeaderboardController.php` ligne 38
- Retirer : `->whereNull('performances.deleted_at')`
- Le modèle `Performance` n'a pas `SoftDeletes`, la colonne n'existe pas

**Dépendances :** aucune

---

#### STORY-V3-FX03 : Newsletter — Ajouter le BOM UTF-8 à l'export CSV

**Epic :** EPIC-FX
**Priorité :** Must Have
**Points :** 1

**User Story :**
En tant qu'admin,
Je veux que l'export CSV des abonnés newsletter s'ouvre correctement dans Excel,
Afin de gérer la liste des abonnés sans problème d'encodage.

**Critères d'acceptation :**
- [ ] L'export CSV contient le BOM UTF-8 (`\xEF\xBB\xBF`) en début de fichier
- [ ] Les prénoms et noms avec accents s'affichent correctement dans Excel
- [ ] Le format est identique aux autres exports CSV du projet

**Notes techniques :**
- Fichier : `backend/app/Http/Controllers/Api/V1/NewsletterController.php` ligne 101
- Ajouter : `$bom = "\xEF\xBB\xBF";` et préfixer la première ligne

**Dépendances :** aucune

---

#### STORY-V3-FX04 : Empty State Cards — Distinguer "aucune donnée" vs "aucun résultat filtré"

**Epic :** EPIC-FX
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant qu'utilisateur dashboard,
Je veux que la carte "Créer le premier X" s'affiche uniquement quand aucun élément n'existe,
Afin de ne pas être induit en erreur quand un filtre masque des données existantes.

**Critères d'acceptation :**
- [ ] Blog : "Rédiger le premier article" uniquement si `meta.total === 0` (aucun article en base)
- [ ] Événements : "Créer un événement" uniquement si aucun événement n'existe
- [ ] Sessions : "Publier une session" uniquement si aucune session n'existe
- [ ] Inventaire : "Ajouter le premier équipement" uniquement si inventaire vide
- [ ] Avec filtre actif + 0 résultat : afficher "Aucun résultat pour ce filtre."
- [ ] Sans filtre + 0 résultat : afficher le CTA de création

**Notes techniques :**
- Utiliser `meta.total` (ou équivalent selon la structure de réponse API) comme source de vérité
- Fichiers :
  - `frontend/src/components/features/blog/PostsPage.tsx` (ligne ~140)
  - `frontend/src/components/features/events/EventsPage.tsx` (ligne ~258)
  - `frontend/src/components/features/sessions/SessionsPage.tsx` (ligne ~234)
  - `frontend/src/components/features/inventory/InventoryPage.tsx` (ligne ~279)
- Pattern : `const isReallyEmpty = !hasActiveFilter && meta.total === 0`

**Dépendances :** aucune

---

#### STORY-V3-FX05 : Inventaire — Corriger l'ajout d'équipement

**Epic :** EPIC-FX
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant qu'admin,
Je veux pouvoir ajouter un équipement depuis le formulaire sans erreur,
Afin de tenir l'inventaire de l'association à jour.

**Critères d'acceptation :**
- [ ] Un équipement peut être ajouté depuis le formulaire (test end-to-end)
- [ ] Les catégories disponibles sont identiques frontend et backend
- [ ] Les erreurs de validation backend sont affichées dans le formulaire frontend
- [ ] Un `StoreEquipmentRequest` est créé (cohérence avec les autres controllers)
- [ ] La réponse d'erreur 422 est traitée côté frontend

**Notes techniques :**
- Investiguer le mismatch enum catégorie frontend/backend :
  - Backend accepte : `dossard,maillot,materiel,autre` (vérifier les accents !)
  - Frontend envoie : vérifier les valeurs dans `InventoryPage.tsx`
- Créer `backend/app/Http/Requests/Equipment/StoreEquipmentRequest.php`
- Remplacer la validation inline dans `EquipmentController::store()`
- Vérifier le `Content-Type: application/json` de la requête frontend

**Dépendances :** aucune

---

#### STORY-V3-FX06 : Newsletter — Corriger le toggle dans la page profil

**Epic :** EPIC-FX
**Priorité :** Should Have
**Points :** 2

**User Story :**
En tant que membre,
Je veux activer ou désactiver la newsletter depuis mon profil sans erreur,
Afin de gérer mes préférences de communication.

**Critères d'acceptation :**
- [ ] Le toggle s'active et se désactive sans erreur 500 ou 422
- [ ] L'état est persisté en base (`newsletter_subscribed_at` mis à jour)
- [ ] Un toast de confirmation s'affiche après chaque changement
- [ ] L'état initial du toggle est cohérent avec l'état en base

**Notes techniques :**
- Vérifier la route `PATCH /api/v1/me/newsletter` dans `api.php`
- Vérifier que le middleware `auth:sanctum` est appliqué
- Payload attendu : `{ "subscribed": true/false }`
- Fichiers : `backend/app/Http/Controllers/Api/V1/NewsletterController.php`, `backend/routes/api.php`
- Frontend : `frontend/src/components/features/newsletter/NewsletterToggle.tsx`

**Dépendances :** aucune

---

### EPIC-H — Refonte Page d'Accueil

---

#### STORY-V3-H01 : Stats dynamiques et correction du fond rouge/rouge

**Epic :** EPIC-H
**Priorité :** Must Have
**Points :** 5

**User Story :**
En tant que visiteur,
Je veux voir les statistiques de l'association avec un fond lisible et des chiffres réels,
Afin d'avoir une première impression professionnelle et honnête de l'association.

**Critères d'acceptation :**
- [ ] Endpoint `GET /api/v1/stats/homepage` créé et public (sans auth)
- [ ] L'endpoint retourne `{ "member_count": N, "total_km": X }`
- [ ] `member_count` = nombre d'utilisateurs actifs (non-bloqués)
- [ ] `total_km` = somme des `distance_km` des performances enregistrées (fallback 50 si 0)
- [ ] Le fond de la section stats est `#F5F0EB` (crème chaud)
- [ ] Les chiffres sont en `#C0302E` (lisible sur crème)
- [ ] Les labels sont en `#1A1A1A`
- [ ] Valeurs : "1" (sorties/mois), N (coureurs actifs, dynamique), X km (dynamique)
- [ ] En cas d'erreur API : fallback "7" coureurs, "50" km
- [ ] Ratio contraste ≥ 4.5:1 vérifié

**Notes techniques :**
- Backend : `backend/app/Http/Controllers/Api/V1/StatsController.php` (nouveau)
- Route publique dans `api.php` : `Route::get('stats/homepage', [StatsController::class, 'homepage'])`
- Frontend : `frontend/src/app/(public)/page.tsx` (lignes 512-588)
- Le composant page est Server Component — fetch direct côté serveur
- Design tokens : fond `#F5F0EB`, chiffres `#C0302E`, labels `#1A1A1A`, sub-labels `#7F7F7F`

**Dépendances :** aucune

---

#### STORY-V3-H03 : Suppression des teintes vertes résiduelles

**Epic :** EPIC-H
**Priorité :** Must Have
**Points :** 2

**User Story :**
En tant que visiteur,
Je veux que la page d'accueil utilise uniquement la palette rouge/crème officielle,
Afin de percevoir une identité visuelle cohérente.

**Critères d'acceptation :**
- [ ] Le fond du footer est `#1A1A1A` (remplace `#141F0C` vert)
- [ ] Le gradient du hero ne contient plus `#DDE8D4` (remplacé par `#F5F0EB` ou `#FAF0EE`)
- [ ] Le gradient complet : `linear-gradient(150deg, #FAFAFA 0%, #F5F0EB 60%, #FAF0EE 100%)`
- [ ] Aucune valeur hexadécimale à dominante verte dans `page.tsx`
- [ ] Les textes du footer utilisent `rgba(255,255,255,0.6)` et `rgba(255,255,255,0.8)`

**Notes techniques :**
- Fichier unique : `frontend/src/app/(public)/page.tsx`
- Hero : lignes ~217-225 (gradient inline style)
- Footer : lignes ~1036-1084 (fond + textes)
- Chercher : `#141F0C`, `#DDE8D4`, `#1A2E10`, `#3A5430`, `#506040`, `#4A6038`

**Dépendances :** aucune

---

#### STORY-V3-H04 : Correction complète du nom de l'association

**Epic :** EPIC-H
**Priorité :** Must Have
**Points :** 2

**User Story :**
En tant que visiteur ou membre,
Je veux voir le nom complet "La Neuville TAF sa Foulée" partout dans l'application,
Afin de reconnaître correctement l'association.

**Critères d'acceptation :**
- [ ] Navbar publique : "La Neuville TAF sa Foulée" (ou logo seul)
- [ ] Stats section : "La Neuville TAF sa Foulée, c'est"
- [ ] Section how-to-join : "Rejoindre La Neuville TAF sa Foulée est simple..."
- [ ] Blog subtitle : "Actualités de La Neuville TAF sa Foulée"
- [ ] Page activités : "de La Neuville TAF sa Foulée."
- [ ] Metadata `evenements/page.tsx` : "Événements — La Neuville TAF sa Foulée"
- [ ] Metadata `evenements/[id]/page.tsx` : "Événement — La Neuville TAF sa Foulée"
- [ ] Metadata `sessions/page.tsx` : "Entraînements — La Neuville TAF sa Foulée"
- [ ] Metadata `inventaire/page.tsx` : "Inventaire — La Neuville TAF sa Foulée"
- [ ] Metadata `newsletter/page.tsx` : "Newsletter — La Neuville TAF sa Foulée"

**Notes techniques :**
- Fichiers :
  - `frontend/src/app/(public)/page.tsx` (lignes 547, 712, 838)
  - `frontend/src/app/(public)/layout.tsx` (ligne 52 — navbar brand)
  - `frontend/src/components/features/blog/PostsPage.tsx` (ligne 87)
  - `frontend/src/components/features/events/ActivitesPage.tsx` (ligne 508)
  - Metadata dans les pages dashboard
- Le testimonial (ligne 838) : si c'est une vraie citation, la conserver telle quelle ; si fictive, corriger

**Dépendances :** aucune (peut être fait en parallèle de H03)

---

### EPIC-EV — Clarification Événements / Entraînements

---

#### STORY-V3-EV01 : Renommer "Sessions" en "Entraînements" et clarifier la distinction

**Epic :** EPIC-EV
**Priorité :** Should Have
**Points :** 2

**User Story :**
En tant que membre,
Je veux comprendre immédiatement la différence entre un Événement et un Entraînement,
Afin de naviguer intuitivement dans le dashboard.

**Critères d'acceptation :**
- [ ] "Sessions" → "Entraînements" dans la sidebar du dashboard
- [ ] Titre de page `/tableau-de-bord/sessions` affiché "Entraînements"
- [ ] Description sous le titre Événements : "Sorties, courses et compétitions — inscrivez-vous et partagez des photos."
- [ ] Description sous le titre Entraînements : "Séances structurées créées par les coachs — exercices, intensités et suivi de participation."
- [ ] Icônes sidebar distinctes (calendrier pour événements, chronomètre pour entraînements)
- [ ] Metadata mise à jour : `title: 'Entraînements — La Neuville TAF sa Foulée'`
- [ ] Les URLs restent inchangées (`/sessions`) — seulement l'affichage change

**Notes techniques :**
- Fichiers :
  - Dashboard sidebar layout (identifier le composant exact)
  - `frontend/src/app/(dashboard)/tableau-de-bord/sessions/page.tsx` (metadata)
  - `frontend/src/components/features/sessions/SessionsPage.tsx` (header)
  - `frontend/src/components/features/events/EventsPage.tsx` (description)
- Les URLs restent `/sessions` (pas de redirect nécessaire)

**Dépendances :** STORY-V3-H04 (cohérence du nom asso dans metadata)

---

### EPIC-BL — Blog — Upload Média et Simplification

---

#### STORY-V3-BL01 : Backend — Endpoint upload média

**Epic :** EPIC-BL
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant que rédacteur,
Je veux pouvoir uploader une image ou une vidéo via l'API,
Afin d'illustrer mes articles de blog.

**Critères d'acceptation :**
- [ ] Endpoint `POST /api/v1/uploads/media` créé (auth requise : admin/founder/coach/bureau)
- [ ] Accepte un fichier multipart (`file`)
- [ ] Images acceptées : `jpg`, `jpeg`, `png`, `webp` (max 5 Mo)
- [ ] Vidéos acceptées : `mp4` (max 50 Mo)
- [ ] Validation du type MIME côté backend (pas uniquement l'extension)
- [ ] Le fichier est stocké dans `storage/app/public/uploads/blog/{year}/{month}/`
- [ ] Nom du fichier : UUID généré (pas le nom original)
- [ ] Réponse : `{ "url": "https://.../storage/uploads/blog/..." }`
- [ ] Les fichiers exécutables sont rejetés (`.php`, `.js`, etc.)

**Notes techniques :**
- Nouveau controller : `backend/app/Http/Controllers/Api/V1/MediaUploadController.php`
- Réutiliser le pattern de `EventPhotoController` pour la gestion du fichier
- Commande `php artisan storage:link` doit être exécutée si pas encore fait
- Route : `Route::post('uploads/media', [MediaUploadController::class, 'store'])->middleware('auth:sanctum', 'role:admin,founder,coach,bureau')`

**Dépendances :** aucune

---

#### STORY-V3-BL02 : Frontend — Upload images et vidéos dans le formulaire blog

**Epic :** EPIC-BL
**Priorité :** Must Have
**Points :** 5

**User Story :**
En tant que rédacteur,
Je veux uploader une image ou vidéo directement depuis mon ordinateur lors de la création d'un article,
Afin d'illustrer mes articles sans passer par une URL externe.

**Critères d'acceptation :**
- [ ] Bouton "Ajouter une image" présent dans le formulaire (ouvre un file picker image)
- [ ] Bouton "Ajouter une vidéo" présent dans le formulaire (ouvre un file picker vidéo)
- [ ] Preview de l'image sélectionnée visible avant soumission (miniature)
- [ ] Nom du fichier vidéo affiché avant soumission
- [ ] Validation taille côté frontend (erreur claire si > 5 Mo pour image, > 50 Mo pour vidéo)
- [ ] L'upload s'effectue à la soumission du formulaire (pas en temps réel)
- [ ] L'URL retournée par l'upload est stockée comme `image_url` du post
- [ ] Option de fallback "ou entrer une URL" (collapsible) conservée
- [ ] En cas d'erreur upload, message clair affiché, soumission non bloquée
- [ ] Les templates prédéfinis sont inchangés

**Notes techniques :**
- Fichier : `frontend/src/components/features/blog/PostForm.tsx`
- Appel API : `POST /api/v1/uploads/media` avec `FormData`
- Utiliser `useRef` pour le file input (évite les re-renders)
- L'upload se fait avant la soumission principale (dans le handler `onSubmit`)
- Ajouter `frontend/src/lib/upload.ts` avec `uploadMedia(file): Promise<string>`

**Dépendances :** STORY-V3-BL01 (backend upload endpoint)

---

#### STORY-V3-BL03 : Supprimer le système de brouillons et corriger le bouton submit

**Epic :** EPIC-BL
**Priorité :** Must Have
**Points :** 2

**User Story :**
En tant que rédacteur,
Je veux créer et publier un article en un seul geste sans gérer de date de publication,
Afin de simplifier le processus de publication.

**Critères d'acceptation :**
- [ ] Le champ "Date de publication" est retiré du formulaire de création
- [ ] Le label "laisser vide pour brouillon" a disparu
- [ ] Le bouton "Effacer" la date a disparu
- [ ] Le backend force `published_at = now()` à la création
- [ ] L'édition d'un article ne modifie pas `published_at` par défaut
- [ ] Aucune mention de "brouillon" dans l'interface
- [ ] Le bouton "Publier" / "Enregistrer" est toujours visible (sticky bottom ou placement évident)
- [ ] Le bouton affiche un style correct (fond `#FB3936`, texte blanc)
- [ ] Le bouton affiche un spinner pendant la soumission

**Notes techniques :**
- Frontend : `frontend/src/components/features/blog/PostForm.tsx` (lignes 260-300)
  - Retirer le bloc date de publication (datetime-local input + label + bouton Effacer)
  - Corriger le style du bouton submit (vérifier `bg-brand` vs inline style)
- Backend : `backend/app/Http/Requests/Post/StorePostRequest.php`
  - Retirer `published_at` des règles ou le rendre ignoré
- Backend : `backend/app/Http/Controllers/Api/V1/PostController.php`
  - Forcer `$validated['published_at'] = now()` dans `store()`

**Dépendances :** aucune

---

### EPIC-A — Paramètres Administrateur

---

#### STORY-V3-A01 : Backend — Infrastructure table `settings`

**Epic :** EPIC-A
**Priorité :** Must Have
**Points :** 5

**User Story :**
En tant que développeur,
Je veux une table `settings` avec un modèle dédié,
Afin de stocker les paramètres configurables de l'application.

**Critères d'acceptation :**
- [ ] Migration `create_settings_table` exécutée sans erreur
- [ ] Table : `key` (string, unique), `value` (text, nullable), `updated_by` (FK users nullable), timestamps
- [ ] Modèle `Setting` avec `Setting::get('key', $default)`, `Setting::set('key', $value, $userId)`, `Setting::getBool('key', $default)`
- [ ] Seeder `SettingsSeeder` insère `leaderboard_enabled = "true"`
- [ ] Endpoint `GET /api/v1/settings/public` (sans auth) retourne les settings publics
- [ ] Endpoint `GET /api/v1/admin/settings` (admin/founder) retourne tous les settings
- [ ] Endpoint `PATCH /api/v1/admin/settings/{key}` (admin/founder) met à jour un setting

**Notes techniques :**
- `backend/database/migrations/YYYY_create_settings_table.php`
- `backend/app/Models/Setting.php` — méthodes statiques `get`/`set`/`getBool`
- `backend/database/seeders/SettingsSeeder.php` — ajouter dans `DatabaseSeeder`
- `backend/app/Http/Controllers/Api/V1/SettingsController.php`
- Settings publics = ceux sans restriction (ex. `leaderboard_enabled`)
- Ajouter un champ `is_public boolean default false` à la table, ou filtrer par whitelist

**Dépendances :** aucune

---

#### STORY-V3-A02 : Toggle activation/désactivation du classement

**Epic :** EPIC-A
**Priorité :** Must Have
**Points :** 5

**User Story :**
En tant qu'admin,
Je veux activer ou désactiver le classement depuis une page de paramètres,
Afin de contrôler les fonctionnalités exposées aux membres sans toucher au code.

**Critères d'acceptation :**
- [ ] Page `/tableau-de-bord/admin/parametres` accessible aux admins et founders
- [ ] Toggle "Classement actif / inactif" visible sur cette page
- [ ] La modification est persistée immédiatement via `PATCH /api/v1/admin/settings/leaderboard_enabled`
- [ ] Quand désactivé : lien "Classement" masqué dans la sidebar pour les membres non-admin
- [ ] Quand désactivé : la page leaderboard affiche "Fonctionnalité désactivée par l'administrateur"
- [ ] Quand désactivé : `GET /api/v1/leaderboard` retourne 403
- [ ] Les admins/founders voient toujours le lien (avec badge "désactivé")
- [ ] Le statut initial est chargé au démarrage via `GET /api/v1/settings/public`
- [ ] Toast de confirmation après chaque changement

**Notes techniques :**
- Frontend :
  - `frontend/src/app/(dashboard)/tableau-de-bord/admin/parametres/page.tsx` (nouveau)
  - `frontend/src/components/features/admin/AdminSettingsPage.tsx` (nouveau)
  - Dashboard sidebar : charger `settings/public` au montage, masquer lien si `!leaderboard_enabled && !isAdmin`
  - `frontend/src/components/features/leaderboard/LeaderboardPage.tsx` : afficher message si désactivé
  - Stocker `leaderboard_enabled` dans un contexte ou le Zustand store (ou fetch au montage de la sidebar)
- Backend :
  - `LeaderboardController::index()` : vérifier `Setting::getBool('leaderboard_enabled', true)`, retourner 403 si false
  - Utiliser le middleware ou guard existant

**Dépendances :** STORY-V3-A01 (infrastructure settings)

---

### EPIC-H02 — Hero Header Redesign

---

#### STORY-V3-H02 : Redesign du hero header — Illustration dynamique

**Epic :** EPIC-H
**Priorité :** Should Have
**Points :** 5

**User Story :**
En tant que visiteur,
Je veux voir un hero header inspirant et dynamique,
Afin d'avoir envie de rejoindre l'association dès la première visite.

**Critères d'acceptation :**
- [ ] Nom sur 2 lignes : "La Neuville TAF" (petite taille, light) + "sa Foulée" (XXL, ultra-bold)
- [ ] Formes décoratives animées (cercles/courbes) en rouge très transparent (`rgba(251,57,54,0.04–0.08)`)
- [ ] Dégradé de fond chaud : `linear-gradient(150deg, #FAFAFA 0%, #F5F0EB 60%, #FAF0EE 100%)`
- [ ] Mascotte côté droit, taille plus grande, animation de flottement conservée
- [ ] CTAs proéminents : "Rejoindre" (bouton rouge plein) + "Découvrir" (lien avec flèche)
- [ ] Aucune teinte verte dans le hero
- [ ] Responsive : hero mobile lisible (texte non tronqué, mascotte réduite ou repositionnée)
- [ ] LCP non dégradé (mascotte chargée avec `priority` si au-dessus de la fold)
- [ ] Accessibilité : texte lisible sur fond, contrastes respectés

**Notes techniques :**
- Fichier : `frontend/src/app/(public)/page.tsx` (lignes 215-352)
- Approche formes animées : `@keyframes` CSS ou Framer Motion si déjà utilisé
- Formes : 3-5 cercles avec `border-radius: 50%`, `position: absolute`, `animation: pulse 6s ease-in-out infinite`
- Mascotte : augmenter `width` de 260 à ~320, ajuster `top` et `right` pour le responsive
- Garder la structure globale (badge, titre, subtitle, CTAs, mascotte) — redesign du style, pas de la structure

**Dépendances :** STORY-V3-H03 (gradient sans vert déjà appliqué), STORY-V3-H04 (nom asso correct)

---

## Allocation par Sprint

---

### Sprint 16 (2026-03-30 → 2026-04-05) — 11 pts / ~11 pts capacité

**Objectif :** Corriger tous les bugs bloquants identifiés (budget, leaderboard, inventaire, newsletter)

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-V3-FX01 | Budget : migration `receipt_url` | 1 | Must Have |
| STORY-V3-FX02 | Leaderboard : retirer `deleted_at` | 1 | Must Have |
| STORY-V3-FX03 | Newsletter CSV : ajouter BOM UTF-8 | 1 | Must Have |
| STORY-V3-FX04 | Empty state cards contextuelles | 3 | Must Have |
| STORY-V3-FX05 | Inventaire : corriger formulaire ajout | 3 | Must Have |
| STORY-V3-FX06 | Newsletter toggle profil : corriger | 2 | Should Have |

**Total :** 11 pts

**Risques :**
- FX05 : le bug inventaire peut cacher un problème côté frontend ou backend, laisser du temps de débogage

---

### Sprint 17 (2026-04-06 → 2026-04-12) — 11 pts / ~11 pts capacité

**Objectif :** Corriger la page d'accueil (stats lisibles, teintes vertes, nom asso) et clarifier la distinction Events/Sessions

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-V3-H01 | Stats dynamiques + fix couleur fond | 5 | Must Have |
| STORY-V3-H03 | Supprimer teintes vertes résiduelles | 2 | Must Have |
| STORY-V3-H04 | Correction nom asso (tous endroits) | 2 | Must Have |
| STORY-V3-EV01 | Renommer Sessions → Entraînements | 2 | Should Have |

**Total :** 11 pts

**Risques :**
- H01 : l'endpoint backend est simple mais le fetch côté Server Component doit être testé

---

### Sprint 18 (2026-04-13 → 2026-04-19) — 10 pts / ~11 pts capacité

**Objectif :** Enrichir le blog avec l'upload média et simplifier la création d'articles

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-V3-BL01 | Backend endpoint upload média | 3 | Must Have |
| STORY-V3-BL02 | Frontend upload images/vidéos | 5 | Must Have |
| STORY-V3-BL03 | Supprimer brouillons + fix submit | 2 | Must Have |

**Total :** 10 pts (1 pt de buffer)

**Risques :**
- BL02 dépend de BL01 : faire BL01 en début de sprint
- Vérifier les limites PHP upload sur O2switch (`upload_max_filesize`)

---

### Sprint 19 (2026-04-20 → 2026-04-26) — 10 pts / ~11 pts capacité

**Objectif :** Donner aux admins le contrôle sur les fonctionnalités (settings + toggle classement)

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-V3-A01 | Backend infrastructure settings | 5 | Must Have |
| STORY-V3-A02 | Toggle classement (admin + frontend) | 5 | Must Have |

**Total :** 10 pts (1 pt de buffer)

**Risques :**
- A02 dépend de A01 : faire A01 le lundi/mardi
- La propagation du `leaderboard_enabled` dans la sidebar nécessite un state management soigné

---

### Sprint 20 (2026-04-27 → 2026-05-03) — 5 pts / ~11 pts capacité

**Objectif :** Redesign créatif du hero header

| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-V3-H02 | Hero header redesign (illustration dynamique) | 5 | Should Have |

**Total :** 5 pts (sprint allégé — buffer pour retard ou polish des sprints précédents)

**Note :** Ce sprint peut absorber les débordements des sprints précédents ou permettre de peaufiner l'UX globale.

---

## Traçabilité Epic → Stories

| Epic | Stories | Total points | Sprint |
|------|---------|--------------|--------|
| EPIC-FX | FX01, FX02, FX03, FX04, FX05, FX06 | 11 pts | Sprint 16 |
| EPIC-H | H01, H03, H04 | 9 pts | Sprint 17 |
| EPIC-EV | EV01 | 2 pts | Sprint 17 |
| EPIC-BL | BL01, BL02, BL03 | 10 pts | Sprint 18 |
| EPIC-A | A01, A02 | 10 pts | Sprint 19 |
| EPIC-H (H02) | H02 | 5 pts | Sprint 20 |
| **Total v3** | **16 stories** | **47 pts** | **5 sprints** |

---

## Couverture des Exigences Fonctionnelles

| FR ID | Titre | Story | Sprint |
|-------|-------|-------|--------|
| FR-FX01 | Budget `receipt_url` | STORY-V3-FX01 | 16 |
| FR-FX02 | Leaderboard `deleted_at` | STORY-V3-FX02 | 16 |
| FR-FX03 | Newsletter CSV BOM | STORY-V3-FX03 | 16 |
| FR-FX04 | Empty state cards | STORY-V3-FX04 | 16 |
| FR-FX05 | Inventaire store | STORY-V3-FX05 | 16 |
| FR-FX06 | Newsletter toggle | STORY-V3-FX06 | 16 |
| FR-H01 | Stats dynamiques + couleur | STORY-V3-H01 | 17 |
| FR-H02 | Hero redesign | STORY-V3-H02 | 20 |
| FR-H03 | Green purge | STORY-V3-H03 | 17 |
| FR-H04 | Nom asso | STORY-V3-H04 | 17 |
| FR-BL01 | Upload média | STORY-V3-BL01 + BL02 | 18 |
| FR-BL02 | Supprimer brouillons | STORY-V3-BL03 | 18 |
| FR-BL03 | Fix submit button | STORY-V3-BL03 | 18 |
| FR-A01 | Infrastructure settings | STORY-V3-A01 | 19 |
| FR-A02 | Toggle leaderboard | STORY-V3-A02 | 19 |
| FR-EV01 | Clarification Events/Sessions | STORY-V3-EV01 | 17 |

---

## Risques et Mitigation

**Élevés :**
- **Limites PHP upload (O2switch)** — La config par défaut d'O2switch peut limiter `upload_max_filesize` à 2 Mo. Mitigation : tester rapidement en production, configurer via `.htaccess` si nécessaire avant BL01.
- **State management leaderboard_enabled** — Propager ce setting dans toute la sidebar sans refactoring lourd. Mitigation : fetch dans le layout dashboard au montage, stocker dans le store Zustand existant.

**Moyens :**
- **FX05 bug inventaire** — Le root cause n'est pas certain (enum mismatch ? middleware ? payload ?). Mitigation : investiguer d'abord en lisant les logs backend et les requêtes network avant de coder.
- **H02 hero redesign** — Sprint allégé (5 pts) mais design créatif peut prendre plus de temps. Mitigation : sprint 20 a 6 pts de buffer.

**Faibles :**
- **FX04 empty state** — Certaines pages peuvent ne pas exposer `meta.total` dans leur réponse API. Mitigation : vérifier les réponses API au début du sprint.

---

## Dépendances

| Story | Dépend de | Contrainte |
|-------|-----------|-----------|
| STORY-V3-BL02 | STORY-V3-BL01 | Backend upload doit exister avant le frontend |
| STORY-V3-A02 | STORY-V3-A01 | Table settings doit exister avant le toggle |
| STORY-V3-H02 | STORY-V3-H03, H04 | Le hero doit déjà utiliser les bonnes couleurs et le bon nom |
| STORY-V3-EV01 | STORY-V3-H04 | Cohérence du nom dans les metadata |

---

## Définition of Done

Pour qu'une story soit considérée terminée :
- [ ] Code implémenté et commité sur la branche `integration`
- [ ] Testé manuellement (ou tests unitaires si pertinent)
- [ ] Aucune erreur console en mode développement
- [ ] PR mergée ou commit direct sur `integration`
- [ ] Critères d'acceptation validés un à un
- [ ] Pas de régression sur les fonctionnalités existantes

---

## Prochaines étapes

**Immédiat :** Démarrer Sprint 16 — bugs bloquants

```
Pour implémenter une story :
/bmad:dev-story STORY-V3-FX01
/bmad:dev-story STORY-V3-FX02
/bmad:dev-story STORY-V3-FX05
...
```

**Cadence des sprints :**
- Durée : 1 semaine
- Planning : lundi
- Review/Retro : dimanche

---

**Ce plan a été créé avec BMAD Method v6 — Phase 4 (Implementation Planning) — v3**
