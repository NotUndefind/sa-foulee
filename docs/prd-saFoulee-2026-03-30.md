# Product Requirements Document : La Neuville TAF sa Foulée — v3

**Date :** 2026-03-30
**Auteur :** Jules Bourin
**Version :** 3.0
**Projet :** saFoulee — Correctifs & Améliorations v3
**Statut :** Approuvé

---

## Aperçu du document

Ce PRD v3 est un amendement au PRD v2 (2026-03-29). Il couvre les bugs bloquants identifiés après les premiers tests utilisateurs, les améliorations demandées sur la page d'accueil, le blog et la gestion du classement, ainsi qu'une correction systématique du nom de l'association.

**Documents liés :**
- PRD v1 : `docs/prd-saFoulee-2026-03-07.md`
- PRD v2 : `docs/prd-saFoulee-2026-03-29.md`
- Architecture v2 : `docs/architecture-saFoulee-2026-03-29.md`
- Product Brief : `docs/product-brief-saFoulee-2026-03-07.md`

---

## Résumé exécutif

Suite aux premiers tests de l'application, plusieurs problèmes bloquants et demandes d'amélioration ont été remontés. Ce PRD v3 couvre cinq axes :

1. **Refonte page d'accueil (Groupe H)** — Section stats illisible (rouge sur rouge) à corriger avec un fond crème, chiffres dynamiques, et hero header réinventé avec illustration dynamique.
2. **Blog (Groupe BL)** — Ajout d'upload média (images/vidéos), suppression du système de brouillons, correction du bouton submit invisible.
3. **Corrections bugs backend (Groupe FX)** — Colonne `receipt_url` manquante dans budget, query `deleted_at` inexistante dans leaderboard, CSV newsletter sans BOM, empty state cards incorrectes, inventaire non fonctionnel.
4. **Paramètres admin (Groupe A)** — Infrastructure de feature flags + toggle pour activer/désactiver le classement.
5. **Clarification Events/Sessions (Groupe EV)** — Distinction visuelle entre les deux concepts.

**Tous les FRs du PRD v2 restent valides et ne sont pas modifiés.**

---

## Objectifs produit

### Objectifs métier

1. **Corriger les bugs bloquants** qui empêchent l'utilisation des modules budget, inventaire et newsletter.
2. **Professionnaliser l'identité visuelle** en corrigeant le nom de l'association partout et en améliorant la lisibilité.
3. **Enrichir le blog** avec des médias pour permettre aux membres de partager des photos et vidéos de leurs sorties.
4. **Donner le contrôle aux administrateurs** sur les fonctionnalités sensibles (classement).
5. **Éliminer les teintes vertes résiduelles** pour une palette cohérente rouge/crème.

### Indicateurs de succès

| Indicateur | Cible |
|-----------|-------|
| Bugs backend bloquants résolus | 100 % |
| Section stats lisible (ratio contraste WCAG AA) | ≥ 4.5:1 pour le texte |
| Nom complet "La Neuville TAF sa Foulée" affiché | 100 % des occurrences visibles |
| Upload média fonctionnel sur les articles | ✓ |
| Classement désactivable par admin | ✓ |

---

## Exigences fonctionnelles — v3

### Groupe H — Refonte Page d'accueil

---

#### FR-H01 : Section "En chiffres" — Valeurs dynamiques et correction des couleurs

**Priorité :** Must Have

**Description :**
La section statistiques de la page d'accueil est actuellement illisible (texte rouge `#FB3936` sur fond rouge `#C0302E`). Elle affiche des valeurs hardcodées incorrectes. Il faut :
1. Remplacer le fond rouge par un fond crème chaud `#F5F0EB`
2. Rendre les chiffres dynamiques via un nouvel endpoint public
3. Mettre à jour les valeurs : 1 sortie/mois, N coureurs actifs (dynamique), X km parcourus (dynamique)

**Nouvelles valeurs :**
- **"1"** — Sortie par mois *(statique)*
- **"N"** — Coureurs membres actifs *(dynamique : count d'utilisateurs avec statut actif)*
- **"X km"** — Parcourus *(dynamique : somme des `total_distance_km` sur les performances ; fallback 50 si résultat = 0)*

**Backend — nouvel endpoint :**
- `GET /api/v1/stats/homepage` — public, non authentifié
- Réponse : `{ "member_count": 7, "total_km": 312 }`
- Cache recommandé (5 minutes) pour éviter des requêtes trop fréquentes

**Design :**
- Fond section : `#F5F0EB` (crème chaud)
- Label "En chiffres" : `#C0302E` (rouge foncé lisible sur crème)
- Chiffres statistiques : `#C0302E`
- Labels (coureurs actifs, sortie/mois, km parcourus) : `#1A1A1A`
- Sub-labels : `#7F7F7F`
- Cards : fond blanc `#FFFFFF`, bordure `1px solid rgba(192,48,46,0.12)`, ombre subtile

**Critères d'acceptation :**
- [ ] Le fond de la section est `#F5F0EB` (plus de rouge sur rouge)
- [ ] Le ratio de contraste texte/fond est ≥ 4.5:1 (WCAG AA)
- [ ] Le nombre de coureurs est récupéré depuis l'API (endpoint `GET /api/v1/stats/homepage`)
- [ ] Les kilomètres sont calculés depuis les performances enregistrées
- [ ] Si total km = 0, afficher 50
- [ ] La valeur "1 sortie/mois" est statique et correctement affichée
- [ ] En cas d'erreur API, les valeurs fallback sont affichées (7 coureurs, 50 km)

**Fichiers :**
- `frontend/src/app/(public)/page.tsx` (lignes 512-588)
- `backend/app/Http/Controllers/Api/V1/StatsController.php` *(nouveau)*
- `backend/routes/api.php` *(ajout route publique)*

---

#### FR-H02 : Redesign Hero Header — Illustration Dynamique

**Priorité :** Should Have

**Description :**
Le hero header actuel est fonctionnel mais visuellement peu inspirant. Il doit être redessiné avec un style illustration dynamique : formes géométriques/organiques animées, dégradé chaud (crème → rouge très doux), typographie imposante, mascotte intégrée dans la composition.

**Nom sur 2 lignes :**
- Ligne 1 : `"La Neuville TAF"` — police légère, taille medium (ex. 1.5–2rem)
- Ligne 2 : `"sa Foulée"` — police ultra-bold, taille XXL (ex. 6–10rem)

**Éléments de design :**
- Dégradé de fond : `#FAFAFA → #F5F0EB` (plus de teinte verte `#DDE8D4`)
- Formes décoratives animées : cercles/courbes en rouge très transparent (`rgba(251,57,54,0.04–0.08)`)
- Mascotte : côté droit, taille plus grande, animation de flottement conservée
- CTAs proéminents : "Rejoindre" (bouton rouge plein) + "Découvrir" (lien avec flèche)
- Pas de photo/vidéo (pas d'assets disponibles)
- Supprimer le gradient vert `#DDE8D4` du hero

**Critères d'acceptation :**
- [ ] Nom affiché sur 2 lignes : "La Neuville TAF" (petit) + "sa Foulée" (grand)
- [ ] Aucune teinte verte dans le hero (gradient, overlay, formes)
- [ ] Le dégradé de fond utilise uniquement des tons crème/blanc/rouge
- [ ] Les formes décoratives animées sont présentes et non intrusives
- [ ] La mascotte est bien visible à droite, animation conservée
- [ ] Responsive : hero mobile lisible (texte non tronqué)
- [ ] LCP (Largest Contentful Paint) non dégradé

**Fichiers :**
- `frontend/src/app/(public)/page.tsx` (lignes 215-352)

---

#### FR-H03 : Suppression des teintes vertes résiduelles

**Priorité :** Must Have

**Description :**
Malgré la migration vers la palette rouge/crème, plusieurs éléments utilisent encore des couleurs vertes provenant de l'ancienne charte graphique.

**Occurrences à corriger :**
| Élément | Couleur actuelle | Remplacement |
|---------|-----------------|--------------|
| Footer fond | `#141F0C` (vert très sombre) | `#1A1A1A` (noir neutre) |
| Gradient hero | `#DDE8D4` (vert clair) | `#F5F0EB` (crème chaud) |
| Gradient hero | `linear-gradient(150deg, #FAFAFA 0%, #EBE4D6 55%, #DDE8D4 100%)` | `linear-gradient(150deg, #FAFAFA 0%, #F5F0EB 60%, #FAF0EE 100%)` |
| Textes footer | `rgba(x,x,x)` teintés vert | `rgba(255,255,255,0.6–0.8)` |

**Critères d'acceptation :**
- [ ] Aucune valeur hexadécimale verte (`#1x2x0x`, `#3x5x3x`, `#DDE8D4`, etc.) dans le composant page d'accueil
- [ ] Le footer utilise un fond neutre foncé (`#1A1A1A` ou équivalent)
- [ ] Le gradient du hero ne contient aucune teinte verte
- [ ] L'ensemble de la page d'accueil respecte la palette rouge/crème/neutre

**Fichiers :**
- `frontend/src/app/(public)/page.tsx` (lignes 215–352 hero, 1035–1084 footer)

---

#### FR-H04 : Correction complète du nom de l'association

**Priorité :** Must Have

**Description :**
Complète le FR-R03 du PRD v2. Plusieurs occurrences du nom court "sa Foulée" ou "saFoulee" subsistent dans des endroits visibles par les utilisateurs. Toutes doivent afficher le nom complet **"La Neuville TAF sa Foulée"** (ou une formulation incluant le nom complet).

**Occurrences identifiées :**

*Page d'accueil (`page.tsx`) :*
- L547 : `"sa Foulee, c'est"` → `"La Neuville TAF sa Foulée, c'est"`
- L712 : `"Rejoindre sa Foulee est simple..."` → `"Rejoindre La Neuville TAF sa Foulée est simple..."`
- L838 (testimonial) : `"J'ai rejoint sa Foulee..."` → conserver comme citation si c'est une vraie citation, sinon corriger

*Navbar publique (`(public)/layout.tsx`) :*
- L52 : `<span>sa Foulee</span>` → `<span>La Neuville TAF sa Foulée</span>` (ou réduire la taille de police pour tenir)

*Blog (`PostsPage.tsx`) :*
- L87 : `"Actualités et annonces de sa Foulee"` → `"Actualités de La Neuville TAF sa Foulée"`

*Activités (`ActivitesPage.tsx`) :*
- L508 : `"de sa Foulee."` → `"de La Neuville TAF sa Foulée."`

*Metadata des pages dashboard :*
- `tableau-de-bord/evenements/page.tsx` : `'Événements — saFoulee'` → `'Événements — La Neuville TAF sa Foulée'`
- `tableau-de-bord/evenements/[id]/page.tsx` : `'Événement — saFoulee'` → `'Événement — La Neuville TAF sa Foulée'`
- `tableau-de-bord/sessions/page.tsx` : `'Sessions d\'entraînement — saFoulee'` → `'Entraînements — La Neuville TAF sa Foulée'`
- `tableau-de-bord/inventaire/page.tsx` : `'Inventaire — sa Foulee'` → `'Inventaire — La Neuville TAF sa Foulée'`
- `tableau-de-bord/newsletter/page.tsx` : `'Newsletter — sa Foulee'` → `'Newsletter — La Neuville TAF sa Foulée'`

**Critères d'acceptation :**
- [ ] Aucune occurrence visible de "sa Foulée" seul ou "saFoulee" dans l'UI
- [ ] La navbar affiche le nom complet (ou le logo officiel en remplacement)
- [ ] Toutes les balises `<title>` des pages dashboard utilisent le nom complet
- [ ] La hero section affiche le nom sur 2 lignes selon FR-H02
- [ ] Les citations-testimonials réelles sont conservées telles quelles si elles citent un vrai membre

---

### Groupe BL — Blog

---

#### FR-BL01 : Upload images et vidéos dans les articles

**Priorité :** Must Have

**Description :**
Le formulaire de création d'article (`PostForm.tsx`) ne propose actuellement qu'un champ URL pour l'image. Il faut permettre un vrai upload de fichier (image ou vidéo) depuis le navigateur, simple et intégré à l'éditeur existant.

**Approche backend :**
- Nouvel endpoint : `POST /api/v1/uploads/media` (auth requise, rôles : admin/founder/coach/bureau)
- Accepte un fichier multipart (`file`)
- Types autorisés : `jpg`, `jpeg`, `png`, `webp` (max 5 Mo), `mp4` (max 50 Mo)
- Stockage : `storage/app/public/uploads/blog/{year}/{month}/`
- Réponse : `{ "url": "https://.../storage/uploads/blog/..." }`
- Réutiliser le pattern de `EventPhotoController` pour la gestion du fichier

**Approche frontend :**
- Dans `PostForm.tsx`, remplacer le champ "URL de l'image" par :
  - Un bouton "Ajouter une image" (ouvre un file picker, filtre images)
  - Un bouton "Ajouter une vidéo" (ouvre un file picker, filtre vidéos)
  - Preview de l'image sélectionnée (miniature avant upload)
  - Preview du nom du fichier vidéo sélectionné
- L'upload se déclenche à la soumission du formulaire (pas en temps réel)
- Le champ URL existant peut rester en fallback (collapse/accordion "ou entrer une URL")
- Les templates prédéfinis restent inchangés

**Critères d'acceptation :**
- [ ] Bouton "Ajouter une image" présent dans le formulaire
- [ ] Bouton "Ajouter une vidéo" présent dans le formulaire
- [ ] Preview de l'image visible avant soumission
- [ ] La taille max est vérifiée côté frontend avant upload (message d'erreur clair si dépassée)
- [ ] L'endpoint valide le type MIME côté backend
- [ ] L'URL retournée par l'upload est stockée dans `image_url` du post
- [ ] En cas d'erreur upload, le formulaire affiche un message et ne bloque pas la soumission
- [ ] Compatible avec les permissions existantes (seulement les rôles autorisés à publier)

**Fichiers :**
- `frontend/src/components/features/blog/PostForm.tsx`
- `backend/app/Http/Controllers/Api/V1/MediaUploadController.php` *(nouveau)*
- `backend/routes/api.php`

---

#### FR-BL02 : Suppression du système de brouillons

**Priorité :** Must Have

**Description :**
Le champ "Date de publication" avec l'option "laisser vide pour brouillon" est source de confusion et inutile pour l'association. Les articles sont toujours publiés immédiatement.

**Changements frontend :**
- Supprimer le champ `published_at` (datetime-local) du formulaire
- Supprimer le bouton "Effacer" associé à ce champ
- Supprimer le label "laisser vide pour brouillon"
- Le `published_at` est désormais géré automatiquement par le backend

**Changements backend :**
- Dans `StorePostRequest` : retirer `published_at` des règles de validation, ou le rendre ignoré
- Dans `PostController::store()` : forcer `published_at = now()` quelle que soit la valeur reçue
- Dans `UpdatePostRequest` : conserver `published_at` modifiable pour l'édition (cas d'usage : corriger une date incorrecte)

**Note :** La colonne `published_at` reste en base de données. Seule l'interface de création est simplifiée.

**Critères d'acceptation :**
- [ ] Le formulaire de création n'affiche plus de champ date de publication
- [ ] Un nouvel article est toujours publié immédiatement (visible dans la liste publique)
- [ ] Le backend force `published_at = now()` à la création
- [ ] L'édition d'un article existant ne modifie pas `published_at` (sauf modification explicite par l'admin)
- [ ] Aucune mention de "brouillon" dans l'interface

**Fichiers :**
- `frontend/src/components/features/blog/PostForm.tsx` (lignes 260-280)
- `backend/app/Http/Requests/Post/StorePostRequest.php`
- `backend/app/Http/Controllers/Api/V1/PostController.php`

---

#### FR-BL03 : Correction du bouton de soumission du formulaire blog

**Priorité :** Must Have

**Description :**
Le bouton "Publier" / "Enregistrer" du formulaire de création/édition d'article n'est pas visible (hors viewport ou style incorrect). L'utilisateur ne peut pas soumettre le formulaire.

**Investigation nécessaire :**
- Vérifier si le bouton utilise `bg-brand` (classe Tailwind) ou une variable CSS non définie
- Vérifier si le formulaire a une hauteur fixe qui cache le bouton en bas
- Vérifier si le `z-index` ou un `overflow: hidden` masque le bouton

**Correction attendue :**
- Le bouton doit toujours être visible, idéalement en position sticky en bas du formulaire
- Style : fond `#FB3936`, texte blanc, hover `#D42F2D`, padding suffisant

**Critères d'acceptation :**
- [ ] Le bouton "Publier" est visible sans scroll dans tous les cas
- [ ] Le bouton "Enregistrer les modifications" est visible sur la page d'édition
- [ ] Le style est cohérent avec les autres boutons primaires de l'application
- [ ] Le bouton affiche un état de chargement (spinner) pendant la soumission

**Fichiers :**
- `frontend/src/components/features/blog/PostForm.tsx` (lignes 282-298)

---

### Groupe FX — Corrections de Bugs

---

#### FR-FX01 : Budget — Colonne `receipt_url` manquante

**Priorité :** Must Have

**Description :**
Le modèle `BudgetEntry` liste `receipt_url` dans `$fillable` et le controller valide ce champ, mais la migration de création de la table `budget_entries` ne crée pas cette colonne. Cela cause une erreur SQL en mode strict et empêche l'ajout d'entrées budget.

**Correction :**
- Créer une nouvelle migration `add_receipt_url_to_budget_entries_table`
- Ajouter : `$table->string('receipt_url', 500)->nullable()->after('description');`
- Exécuter `php artisan migrate`

**Critères d'acceptation :**
- [ ] La migration s'exécute sans erreur
- [ ] Il est possible d'ajouter une entrée budget avec ou sans `receipt_url`
- [ ] La liste des mouvements s'affiche correctement
- [ ] Les entrées existantes ne sont pas affectées

**Fichiers :**
- `backend/database/migrations/YYYY_MM_DD_add_receipt_url_to_budget_entries_table.php` *(nouveau)*

---

#### FR-FX02 : Leaderboard — Query sur colonne `deleted_at` inexistante

**Priorité :** Must Have

**Description :**
Le `LeaderboardController` filtre avec `->whereNull('performances.deleted_at')` mais la table `performances` n'a pas de colonne `deleted_at` (le modèle `Performance` n'utilise pas `SoftDeletes`). Cela cause une erreur SQL qui rend le classement inaccessible.

**Correction :**
- Retirer la ligne `->whereNull('performances.deleted_at')` du `LeaderboardController`
- Vérifier que la query reste correcte sans ce filtre

**Critères d'acceptation :**
- [ ] La page classement se charge sans erreur SQL
- [ ] Le classement affiche les performances correctement
- [ ] Aucun `whereNull('performances.deleted_at')` dans le controller

**Fichiers :**
- `backend/app/Http/Controllers/Api/V1/LeaderboardController.php` (ligne 38)

---

#### FR-FX03 : Newsletter — BOM UTF-8 manquant dans l'export CSV

**Priorité :** Must Have

**Description :**
L'export CSV de la liste des abonnés newsletter ne contient pas le BOM UTF-8 (`\xEF\xBB\xBF`) contrairement aux autres exports du projet (budget, inventaire). Cela cause des problèmes d'encodage des caractères accentués dans Excel.

**Correction :**
- Ajouter `$bom = "\xEF\xBB\xBF";` en préfixe de la première ligne du CSV dans `NewsletterController::exportSubscribers()`

**Critères d'acceptation :**
- [ ] L'export CSV des abonnés s'ouvre correctement dans Excel avec les accents français
- [ ] Les noms (prénom, nom) sont correctement affichés
- [ ] Le fichier est identique aux autres exports CSV du projet

**Fichiers :**
- `backend/app/Http/Controllers/Api/V1/NewsletterController.php` (ligne 101)

---

#### FR-FX04 : Empty State Cards — Distinction "aucune donnée" vs "aucun résultat"

**Priorité :** Must Have

**Description :**
Dans plusieurs pages du dashboard, la carte "Rédiger le premier article" / "Créer le premier X" s'affiche même quand des données existent mais qu'un filtre actif ne retourne aucun résultat. Cette carte doit s'afficher uniquement quand la liste est vraiment vide (total = 0 sans filtre).

**Pages concernées et corrections :**

| Page | Fichier | Comportement actuel | Comportement attendu |
|------|---------|---------------------|---------------------|
| Blog | `PostsPage.tsx:140` | "Rédiger le premier article" si `posts.length === 0` | Même message si aucun article existe du tout ; "Aucun article pour cette recherche." si filtre actif |
| Événements | `EventsPage.tsx:258` | "Créer un événement" si liste filtrée vide | Idem |
| Sessions | `SessionsPage.tsx:234` | "Publier une session" si liste filtrée vide | Idem |
| Inventaire | `InventoryPage.tsx:279` | "Ajouter le premier" si liste filtrée vide | Idem |

**Approche :**
- Utiliser le `meta.total` (total non filtré) de la pagination API pour distinguer les deux cas
- Si `meta.total === 0` (ou équivalent) : afficher le CTA "créer le premier"
- Si `meta.total > 0` mais liste filtrée vide : afficher "Aucun résultat pour ce filtre"

**Critères d'acceptation :**
- [ ] Blog : le CTA "Rédiger le premier article" n'apparaît que si aucun article n'existe en base
- [ ] Événements : le CTA "Créer un événement" n'apparaît que si aucun événement n'existe
- [ ] Sessions : le CTA "Publier une session" n'apparaît que si aucune session n'existe
- [ ] Inventaire : le CTA "Ajouter le premier" n'apparaît que si aucun équipement n'existe
- [ ] Un message neutre ("Aucun résultat pour ce filtre") s'affiche quand un filtre ne retourne rien

**Fichiers :**
- `frontend/src/components/features/blog/PostsPage.tsx`
- `frontend/src/components/features/events/EventsPage.tsx`
- `frontend/src/components/features/sessions/SessionsPage.tsx`
- `frontend/src/components/features/inventory/InventoryPage.tsx`

---

#### FR-FX05 : Inventaire — Correction du formulaire d'ajout d'équipement

**Priorité :** Must Have

**Description :**
L'ajout d'un équipement ne fonctionne pas depuis le frontend. Le problème est à investiguer entre le formulaire frontend et l'endpoint backend.

**Investigation requise :**
1. Vérifier la requête envoyée par le frontend (payload, Content-Type)
2. Vérifier les valeurs enum acceptées par le backend (`dossard,maillot,materiel,autre`) vs les valeurs envoyées par le frontend
3. Vérifier les messages d'erreur retournés par le 422 Unprocessable Entity
4. Remplacer la validation inline du `EquipmentController::store()` par un `StoreEquipmentRequest` dédié pour une meilleure cohérence

**Correction probable :**
- Le frontend envoie peut-être des valeurs de catégorie différentes de celles acceptées par le backend
- Synchroniser les enums frontend/backend

**Critères d'acceptation :**
- [ ] Un équipement peut être ajouté avec succès depuis le formulaire
- [ ] Les catégories disponibles sont identiques frontend et backend
- [ ] Les erreurs de validation backend sont affichées dans le formulaire frontend
- [ ] Un `StoreEquipmentRequest` est créé (cohérence avec les autres controllers)

**Fichiers :**
- `backend/app/Http/Controllers/Api/V1/EquipmentController.php`
- `backend/app/Http/Requests/Equipment/StoreEquipmentRequest.php` *(nouveau)*
- `frontend/src/components/features/inventory/InventoryPage.tsx` (formulaire d'ajout)

---

#### FR-FX06 : Newsletter — Correction du toggle dans le profil

**Priorité :** Should Have

**Description :**
Le bouton toggle newsletter dans la page profil déclenche une erreur. L'endpoint `PATCH /api/v1/me/newsletter` doit être vérifié de bout en bout.

**Investigation requise :**
1. Vérifier le payload envoyé par `NewsletterToggle.tsx` (doit être `{ "subscribed": true/false }`)
2. Vérifier que la route existe et pointe vers `NewsletterController::toggle`
3. Vérifier que le middleware `auth:sanctum` est appliqué sur la route
4. Vérifier les logs Laravel pour l'erreur exacte

**Critères d'acceptation :**
- [ ] Le toggle s'active et se désactive sans erreur
- [ ] L'état est persisté en base (`newsletter_subscribed_at` mis à jour)
- [ ] Un toast de confirmation s'affiche après chaque changement
- [ ] L'état initial du toggle correspond à l'état réel en base

**Fichiers :**
- `backend/app/Http/Controllers/Api/V1/NewsletterController.php`
- `frontend/src/components/features/newsletter/NewsletterToggle.tsx`
- `backend/routes/api.php`

---

### Groupe A — Paramètres Admin

---

#### FR-A01 : Infrastructure de paramètres applicatifs

**Priorité :** Must Have

**Description :**
Créer une table `settings` pour stocker des paramètres de configuration de l'application activables/désactivables par les administrateurs. Cette infrastructure sera utilisée pour le toggle du classement (FR-A02) et pourra être étendue à d'autres fonctionnalités.

**Schéma de la table `settings` :**
| Colonne | Type | Description |
|---------|------|-------------|
| `key` | string, unique | Identifiant du paramètre (ex. `leaderboard_enabled`) |
| `value` | text, nullable | Valeur du paramètre (ex. `"true"`) |
| `updated_by` | FK users nullable | Admin ayant modifié |
| `created_at`, `updated_at` | timestamps | |

**Modèle `Setting` :**
- `Setting::get('key', $default)` — retourne la valeur ou le défaut
- `Setting::set('key', $value, $userId)` — met à jour ou crée
- `Setting::getBool('key', $default)` — retourne un boolean

**Seeder :**
- `leaderboard_enabled = "true"` *(activé par défaut)*

**Endpoint admin :**
- `GET /api/v1/admin/settings` — liste tous les paramètres (admin/founder)
- `PATCH /api/v1/admin/settings/{key}` — met à jour un paramètre (admin/founder)

**Endpoint public :**
- `GET /api/v1/settings/public` — retourne uniquement les paramètres publics (ex. `leaderboard_enabled`) sans authentification, pour que le frontend puisse adapter l'UI au chargement

**Critères d'acceptation :**
- [ ] La migration crée la table `settings` correctement
- [ ] Le seeder insère la valeur initiale `leaderboard_enabled = true`
- [ ] `Setting::get()` et `Setting::set()` fonctionnent correctement
- [ ] L'endpoint admin est protégé (admin/founder uniquement)
- [ ] L'endpoint public retourne uniquement les paramètres marqués comme publics

**Fichiers :**
- `backend/database/migrations/YYYY_MM_DD_create_settings_table.php` *(nouveau)*
- `backend/database/seeders/SettingsSeeder.php` *(nouveau)*
- `backend/app/Models/Setting.php` *(nouveau)*
- `backend/app/Http/Controllers/Api/V1/SettingsController.php` *(nouveau)*
- `backend/routes/api.php`

---

#### FR-A02 : Toggle activation/désactivation du classement

**Priorité :** Must Have

**Description :**
Les administrateurs et fondateurs peuvent activer ou désactiver la fonctionnalité de classement (leaderboard) depuis une page de paramètres. Quand désactivée, le classement est masqué pour tous les membres.

**Comportement quand désactivé :**
- La page `/tableau-de-bord/leaderboard` retourne un message "Fonctionnalité désactivée par l'administrateur"
- Le lien "Classement" dans la sidebar du dashboard est masqué pour les rôles non-admin
- L'API `GET /api/v1/leaderboard` retourne une 403 avec message explicatif
- Les admins/founders voient toujours le lien (avec une indication "désactivé")

**Page paramètres admin :**
- URL : `/tableau-de-bord/admin/parametres`
- Accessible aux rôles `admin` et `founder` uniquement
- Section "Fonctionnalités" avec toggle "Classement"
- Description du toggle : "Activer le classement permet aux membres de soumettre leurs performances et de se comparer. Désactivez-le si vous souhaitez préserver la convivialité de l'association."

**Critères d'acceptation :**
- [ ] Une page `/tableau-de-bord/admin/parametres` existe, accessible aux admins/founders
- [ ] Un toggle "Classement actif/inactif" est présent sur cette page
- [ ] La modification est persistée immédiatement via l'API settings
- [ ] Quand désactivé : le lien classement est masqué dans la sidebar pour les membres
- [ ] Quand désactivé : la page leaderboard affiche un message approprié
- [ ] Quand désactivé : l'API leaderboard retourne 403
- [ ] Les admins/founders voient toujours le lien classement (pour pouvoir le réactiver)
- [ ] Le statut actuel est chargé au démarrage de l'application via `GET /api/v1/settings/public`

**Fichiers :**
- `frontend/src/app/(dashboard)/tableau-de-bord/admin/parametres/page.tsx` *(nouveau)*
- `frontend/src/components/features/admin/AdminSettingsPage.tsx` *(nouveau)*
- `frontend/src/components/layout/DashboardSidebar.tsx` (ou équivalent — masquer lien)
- `frontend/src/components/features/leaderboard/LeaderboardPage.tsx`
- `backend/app/Http/Controllers/Api/V1/LeaderboardController.php`

---

### Groupe EV — Clarification Événements / Entraînements

---

#### FR-EV01 : Distinction visuelle entre Événements et Entraînements

**Priorité :** Should Have

**Description :**
Les utilisateurs confondent parfois les deux modules car leurs noms sont proches. Il faut clarifier la distinction dans l'interface :

- **Événements** = sorties, courses, compétitions — happenings réels avec inscription de participants
- **Entraînements** (anciennement "Sessions") = séances structurées avec exercices, créées par les coachs

**Changements UI :**
1. Renommer "Sessions" → "Entraînements" dans le menu sidebar et les titres de pages
2. Ajouter une ligne descriptive sous le titre de chaque page :
   - Page Événements : *"Sorties, courses et compétitions de l'association — inscrivez-vous et partagez des photos."*
   - Page Entraînements : *"Séances structurées créées par les coachs — exercices, intensités et suivi de participation."*
3. Différencier les icônes dans la sidebar (ex. calendrier pour événements, chronomètre pour entraînements)
4. Mettre à jour les métadonnées : `title: 'Entraînements — La Neuville TAF sa Foulée'`

**Critères d'acceptation :**
- [ ] La sidebar utilise "Entraînements" à la place de "Sessions"
- [ ] Le titre de page `/tableau-de-bord/sessions` affiche "Entraînements"
- [ ] Une description courte est présente sous le titre de chaque page
- [ ] Les icônes sidebar sont distinctes pour les deux modules
- [ ] Les metadata (`title`) sont mis à jour

**Fichiers :**
- Dashboard layout sidebar
- `frontend/src/app/(dashboard)/tableau-de-bord/sessions/page.tsx`
- `frontend/src/components/features/sessions/SessionsPage.tsx`

---

## Exigences non-fonctionnelles — v3

---

#### NFR-06 : Contraste des couleurs — WCAG AA obligatoire

**Priorité :** Must Have

**Description :** Toute couleur de texte sur fond coloré doit respecter le ratio de contraste WCAG AA (≥ 4.5:1 pour le texte normal, ≥ 3:1 pour les grands textes et UI).

**Critères d'acceptation :**
- [ ] La section stats n'a plus de texte rouge sur fond rouge
- [ ] Le fond crème `#F5F0EB` avec texte `#C0302E` : ratio ≈ 5.8:1 ✓
- [ ] Le footer sombre avec texte blanc : ratio > 7:1 ✓
- [ ] Vérification via outil de contraste (ex. WebAIM Contrast Checker)

---

#### NFR-07 : Upload média — Sécurité et limites

**Priorité :** Must Have

**Description :** Les uploads de fichiers (FR-BL01) doivent être sécurisés.

**Critères d'acceptation :**
- [ ] Validation du type MIME côté backend (pas uniquement l'extension)
- [ ] Taille max : 5 Mo pour les images, 50 Mo pour les vidéos
- [ ] Nommage des fichiers : UUIDs (pas de noms originaux conservés)
- [ ] Accès public aux fichiers uploadés uniquement via le storage public Laravel
- [ ] Pas de fichiers exécutables acceptés (`.php`, `.js`, etc.)

---

## Epics — v3

### EPIC-H : Refonte Page d'Accueil

**Description :**
Correction des problèmes visuels critiques de la page d'accueil : section stats illisible (rouge/rouge), teintes vertes résiduelles, nom de l'association incorrect, et hero header peu inspirant.

**Exigences fonctionnelles :** FR-H01, FR-H02, FR-H03, FR-H04

**Estimation stories :** 4–6
**Priorité :** Must Have (H01, H03, H04) / Should Have (H02)

**Valeur métier :** Première impression professionnelle, lisibilité garantie, identité visuelle cohérente.

---

### EPIC-BL : Blog — Upload Média et Simplification

**Description :**
Enrichissement du blog avec upload d'images/vidéos, suppression du système de brouillons inutile, et correction du bouton submit invisible.

**Exigences fonctionnelles :** FR-BL01, FR-BL02, FR-BL03

**Estimation stories :** 3–4
**Priorité :** Must Have

**Valeur métier :** Permet aux membres de partager des photos de sorties, simplifie la publication d'articles.

---

### EPIC-FX : Corrections de Bugs

**Description :**
Résolution de tous les bugs bloquants identifiés : budget, leaderboard, newsletter CSV, empty state cards, inventaire, newsletter toggle.

**Exigences fonctionnelles :** FR-FX01, FR-FX02, FR-FX03, FR-FX04, FR-FX05, FR-FX06

**Estimation stories :** 5–7
**Priorité :** Must Have (FX01–FX05) / Should Have (FX06)

**Valeur métier :** Les modules budget, inventaire et newsletter deviennent utilisables.

---

### EPIC-A : Paramètres Administrateur

**Description :**
Infrastructure de paramètres applicatifs et toggle pour le classement, permettant aux admins de contrôler les fonctionnalités exposées aux membres.

**Exigences fonctionnelles :** FR-A01, FR-A02

**Estimation stories :** 2–3
**Priorité :** Must Have

**Valeur métier :** Contrôle admin sur les fonctionnalités, préserve l'esprit de l'association (pas de réseau social).

---

### EPIC-EV : Clarification Événements / Entraînements

**Description :**
Distinction visuelle et sémantique claire entre les événements (happenings réels) et les entraînements (séances structurées).

**Exigences fonctionnelles :** FR-EV01

**Estimation stories :** 1–2
**Priorité :** Should Have

**Valeur métier :** Réduit la confusion utilisateur, interface plus intuitive.

---

## Stories de haut niveau — v3

### EPIC-H
- En tant que visiteur, je veux voir la section chiffres avec un fond lisible pour pouvoir lire les statistiques de l'association.
- En tant que visiteur, je veux voir le nom complet "La Neuville TAF sa Foulée" partout sur le site pour identifier correctement l'association.
- En tant que visiteur, je veux un hero header dynamique et inspirant pour avoir envie de rejoindre l'association.

### EPIC-BL
- En tant que rédacteur, je veux uploader une photo directement depuis mon ordinateur pour illustrer un article sans passer par une URL externe.
- En tant que rédacteur, je veux créer un article et le publier immédiatement sans avoir à gérer une date manuellement.

### EPIC-FX
- En tant que trésorier, je veux pouvoir enregistrer une dépense ou une recette sans que le formulaire génère une erreur.
- En tant que membre, je veux voir le classement s'afficher correctement sans erreur SQL.
- En tant qu'admin, je veux que l'export CSV des abonnés newsletter s'ouvre correctement dans Excel.
- En tant qu'admin, je veux que la liste des équipements montre "Aucun équipement" seulement quand c'est vraiment le cas, pas quand un filtre masque les résultats.

### EPIC-A
- En tant qu'admin, je veux activer ou désactiver le classement depuis une page de paramètres pour contrôler les fonctionnalités de l'espace membre.
- En tant que membre, je veux que le lien "Classement" disparaisse de mon menu quand la fonctionnalité est désactivée par l'admin.

### EPIC-EV
- En tant que membre, je veux comprendre immédiatement la différence entre un "Événement" et un "Entraînement" sans avoir à explorer les deux sections.

---

## Personas utilisateurs

*(Inchangés depuis le PRD v2)*

| Persona | Rôle | Besoins principaux |
|---------|------|--------------------|
| **Marie** — Présidente | `founder` | Vue d'ensemble, contrôle des fonctionnalités, paramètres admin |
| **Paul** — Trésorier | `bureau` | Saisie budget (corrigée), inventaire fonctionnel |
| **Sophie** — Coureuse | `member` | Blog avec photos, classement (si activé), newsletter |
| **Luc** — Entraîneur | `coach` | Création d'entraînements, blog |
| **Julien** — Visiteur | — | Première impression du hero, chiffres lisibles |

---

## Dépendances

### Dépendances internes

| Dépendance | Description |
|-----------|-------------|
| PRD v1, v2 | Tous les FRs v1 et v2 restent valides. Ce PRD v3 s'y ajoute. |
| FR-A01 | Requis avant FR-A02 (infrastructure settings avant toggle leaderboard) |
| FR-BL01 | Requiert un endpoint upload backend nouveau |
| FR-H01 | Requiert un endpoint stats public nouveau |

### Dépendances externes

| Service | Usage | Contrainte |
|---------|-------|-----------|
| **Laravel Storage** | Upload médias blog | Disk `public` configuré, lien symbolique `storage:link` exécuté |
| *(Autres dépendances inchangées depuis v2)* | | |

---

## Hypothèses

1. Le serveur O2switch a suffisamment d'espace disque pour les uploads vidéo (50 Mo max par vidéo).
2. La limite de taille upload de PHP (`upload_max_filesize`, `post_max_size`) est configurable sur O2switch via `.htaccess` ou `php.ini` local.
3. Les performances existantes en base sont calculées depuis les séances réelles (sinon le fallback 50 km s'applique).
4. Le testimonial de la landing page est fictif et peut être modifié librement.
5. "Entraînements" est un renommage acceptable de "Sessions" pour tous les utilisateurs existants.

---

## Hors périmètre

- Système de commentaires sur les photos (reste un FR optionnel)
- Transcription automatique des vidéos
- Galerie média indépendante du blog (les uploads restent liés aux articles)
- Droits granulaires sur le classement (par membre) — seul le toggle global est prévu
- Interface de gestion des uploads existants (pas de médiathèque)
- *(Tout le hors périmètre du PRD v2 reste valide)*

---

## Questions ouvertes

| # | Question | Impact | Responsable |
|---|----------|--------|-------------|
| Q1 | La limite d'upload PHP sur O2switch peut-elle être augmentée via `.htaccess` ? | FR-BL01 (vidéos) | Jules |
| Q2 | Le testimonial de la page d'accueil est-il fictif ou une vraie citation d'un membre ? | FR-H04 | Jules |
| Q3 | Quel est le seuil de membres en dessous duquel on affiche le fallback "7 coureurs" ? | FR-H01 | Jules |
| Q4 | Le renommage "Sessions" → "Entraînements" doit-il être répercuté dans les URLs (`/sessions` → `/entrainements`) ou seulement dans l'affichage ? | FR-EV01 | Jules |
| Q5 | Y a-t-il d'autres fonctionnalités que le classement qui mériteraient un toggle admin à terme ? | FR-A01, A02 | Jules |

---

## Approbation

### Parties prenantes

| Rôle | Nom | Statut |
|------|-----|--------|
| Product Owner | Jules Bourin | ✅ Approuvé |
| Engineering Lead | Jules Bourin | ✅ Approuvé |

### Statut d'approbation

- [x] Product Owner
- [x] Engineering Lead
- [ ] Design Lead *(solo project)*
- [ ] QA Lead *(solo project)*

---

## Historique des révisions

| Version | Date | Auteur | Modifications |
|---------|------|--------|--------------|
| 1.0 | 2026-03-07 | Jules Bourin | PRD initial (auth, events, blog, sessions, leaderboard) |
| 2.0 | 2026-03-29 | Jules Bourin | Refonte graphique, correctifs UX, newsletter, inventaire, budget, HelloAsso, infrastructure production |
| 3.0 | 2026-03-30 | Jules Bourin | Bugs bloquants (budget, leaderboard, inventaire, newsletter), refonte page d'accueil, blog média, toggle classement, nom asso, green purge |

---

## Prochaines étapes

### Sprint Planning v3

Exécuter `/sprint-planning` pour décomposer les nouveaux epics en stories et les intégrer au sprint en cours.

**Séquence recommandée :**
1. **Sprint FX** — Corriger tous les bugs backend en priorité (FR-FX01 à FX06) — débloque les tests
2. **Sprint H** — Page d'accueil (FR-H01, H03, H04) + nom asso
3. **Sprint BL** — Blog (FR-BL01, BL02, BL03) + empty state fix (FX04)
4. **Sprint A** — Paramètres admin (FR-A01, A02)
5. **Sprint H2** — Hero redesign (FR-H02) + clarification events/sessions (FR-EV01)

**Estimation totale v3 :** 15–22 nouvelles stories (~40–55 points)

---

**Ce document a été créé avec BMAD Method v6 — Phase 2 (Planning) — v3**

---

## Annexe A : Matrice de traçabilité

| Epic ID | Epic Name | Exigences fonctionnelles | Estimation stories |
|---------|-----------|--------------------------|-------------------|
| EPIC-H | Refonte Page d'Accueil | FR-H01, FR-H02, FR-H03, FR-H04 | 4–6 |
| EPIC-BL | Blog — Upload Média | FR-BL01, FR-BL02, FR-BL03 | 3–4 |
| EPIC-FX | Corrections de Bugs | FR-FX01, FR-FX02, FR-FX03, FR-FX04, FR-FX05, FR-FX06 | 5–7 |
| EPIC-A | Paramètres Administrateur | FR-A01, FR-A02 | 2–3 |
| EPIC-EV | Clarification Events/Sessions | FR-EV01 | 1–2 |
| *(v2 epics)* | *(EPIC-R, N, I, B, P, D — inchangés)* | *(v2 FRs)* | *(19–29 stories)* |
| **Total v3 (nouveaux)** | | **15 FRs + 2 NFRs** | **15–22 stories** |

---

## Annexe B : Prioritisation

| Priorité | FRs v3 |
|----------|--------|
| Must Have | FR-H01, H03, H04, BL01, BL02, BL03, FX01, FX02, FX03, FX04, FX05, A01, A02 |
| Should Have | FR-H02, FX06, EV01 |
| Could Have | — |

**Total Must Have v3 :** 13 FRs
**Total Should Have v3 :** 3 FRs
