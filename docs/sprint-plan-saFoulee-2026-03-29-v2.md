# Sprint Plan : La Neuville TAF sa Foulée — v2

**Date :** 2026-03-29
**Scrum Master :** Jules Bourin
**Niveau projet :** Level 2
**Total stories v2 :** 22 stories (+2 déjà livrées)
**Total points v2 :** 70 points
**Sprints planifiés :** 7 sprints (Sprint 9 → Sprint 15)
**Cible de livraison :** 2026-05-17

---

## Résumé exécutif

Ce sprint plan couvre la **version 2** du site de l'association La Neuville TAF sa Foulée. Les 8 premiers sprints (v1) sont terminés avec une vélocité moyenne de **11,6 pts/sprint**.

Deux correctifs immédiats ont été livrés hors sprint lors de la session de planification du 2026-03-29 :
- ✅ Bug SSR Tiptap corrigé (`PostForm.tsx`)
- ✅ Auth layout — logo cliquable vers l'accueil

**Métriques clés :**

| Indicateur | Valeur |
|-----------|--------|
| Stories v2 planifiées | 22 |
| Points totaux | 70 |
| Sprints planifiés | 7 (×1 semaine) |
| Capacité par sprint | 10 pts |
| Vélocité réelle (v1) | 11,6 pts/sprint |
| Cible fin v2 | 2026-05-17 |

**Ordre de priorité des epics :**

| Priorité | Epic | Raison |
|---------|------|--------|
| 1 | EPIC-R — Refonte graphique | Image de l'association, visible immédiatement |
| 2 | EPIC-D — Infrastructure prod | Prérequis pour tout mettre en ligne |
| 3 | EPIC-P — HelloAsso | Quick win, revenus, aucune BDD complexe |
| 4 | EPIC-N — Newsletter | Valeur métier + RGPD |
| 5 | EPIC-I — Inventaire | Réduction pertes matériel |
| 6 | EPIC-B — Budget | Préparer AG annuelle |

---

## Inventaire des stories v2

### EPIC-R — Refonte Graphique & Identité

---

#### STORY-V2-R01 : Nouvelle palette de couleurs `#FB3936`

**Epic :** EPIC-R
**Priorité :** Must Have
**Points :** 5

**User Story :**
En tant que visiteur ou membre,
je veux voir une interface aux couleurs officielles de l'association (`#FB3936` rouge, `#FAFAFA` crème),
afin de reconnaître visuellement l'association La Neuville TAF sa Foulée.

**Critères d'acceptation :**
- [ ] `globals.css` — tokens CSS mis à jour : `--color-primary: #FB3936`, `--color-primary-dark: #D42F2D`, `--color-primary-light: #FD6563`, `--color-bg: #FAFAFA`, `--color-sidebar: #C0302E`
- [ ] Tous les boutons CTA primaires utilisent `#FB3936`
- [ ] La sidebar du dashboard utilise `#C0302E` (déclinaison sombre)
- [ ] Les `focus:ring` et `focus:border` utilisent `#FB3936`
- [ ] Aucune référence aux anciens tokens verts dans les fichiers TSX (`--forest`, `--sage`, `#1E3A14`, `#7A9E6E`)
- [ ] Pages vérifiées : navbar, landing, auth layout, dashboard, blog, événements, profil, admin

**Notes techniques :**
- Fichiers principaux : `globals.css`, `(public)/layout.tsx`, `(dashboard)/layout.tsx`
- Utiliser `replace_all` sur les inline styles hardcodés (`#1E3A14`, `#3A6B2A`, `#7A9E6E`, etc.)
- Vérifier les composants UI (`Toast.tsx`, `RoleGate.tsx`, inputs `.auth-input`)

**Dépendances :** Aucune (sprint 9 en premier)

---

#### STORY-V2-R02 : Intégration des images officielles

**Epic :** EPIC-R
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant que visiteur,
je veux voir le logo, la mascotte et la photo du bureau sur le site,
afin de me sentir proche de l'association et reconnaître son identité visuelle.

**Critères d'acceptation :**
- [ ] Logo (`logo-removebg-preview.png`) dans la navbar publique (40px, `next/image`)
- [ ] Logo dans le footer
- [ ] Mascotte (`mascotte-removebg-preview.png`) dans la section hero de la page d'accueil
- [ ] Mascotte en section CTA ou 404
- [ ] Photo bureau (`bureau.png`) dans une section "Notre association" ou "À propos" sur la landing
- [ ] Toutes les images via `next/image` avec `alt` descriptifs
- [ ] `priority={true}` sur les images au-dessus de la ligne de flottaison

**Notes techniques :**
- Images déjà dans `frontend/public/`
- Auth layout logo déjà implémenté (STORY hors-sprint)
- Créer la section "À propos" dans `(public)/page.tsx`

**Dépendances :** STORY-V2-R01 (palette mise à jour)

---

#### STORY-V2-R03 : Correction du nom "La Neuville TAF sa Foulée"

**Epic :** EPIC-R
**Priorité :** Must Have
**Points :** 2

**User Story :**
En tant que visiteur,
je veux voir le nom officiel "La Neuville TAF sa Foulée" (et non "club" ni "sa Foulée" seul),
afin que l'identité de l'association soit correctement représentée.

**Critères d'acceptation :**
- [ ] `<title>` du site : "La Neuville TAF sa Foulée"
- [ ] Footer : "© {année} La Neuville TAF sa Foulée"
- [ ] Navbar et auth layout : nom complet ou logo
- [ ] Open Graph meta tags mis à jour dans `layout.tsx` root
- [ ] Aucune occurrence de "club" dans les textes visibles (remplacer par "association")
- [ ] Le fichier `README.md` reflète le nom officiel

**Notes techniques :**
- Grep sur "club" et "sa Foulée" dans tout le frontend
- `frontend/src/app/layout.tsx` pour les métadonnées globales

**Dépendances :** Aucune

---

### EPIC-D — Infrastructure Production

---

#### STORY-V2-D01 : Configuration Vercel production

**Epic :** EPIC-D
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant que développeur,
je veux déployer le frontend sur Vercel avec un domaine personnalisé et les variables d'environnement correctes,
afin que le site soit accessible au public sur l'URL officielle.

**Critères d'acceptation :**
- [ ] Projet Vercel connecté au repository GitHub
- [ ] Variable `NEXT_PUBLIC_API_URL` configurée (URL O2switch)
- [ ] Variable `NEXT_PUBLIC_HELLOASSO_FORM_URL` configurée
- [ ] Domaine personnalisé configuré (DNS mis à jour)
- [ ] HTTPS actif et valide
- [ ] Preview deployments fonctionnels sur les branches
- [ ] Build Next.js passe sans erreurs TypeScript en mode production (`npm run build`)
- [ ] `vercel.json` créé dans le repository

**Notes techniques :**
- Créer `frontend/vercel.json`
- Corriger les éventuelles erreurs TypeScript restantes avant déploiement
- Tester `NEXT_PUBLIC_API_URL` avec l'URL de prod O2switch

**Dépendances :** STORY-V2-D02 doit être en cours (URL API connue)

---

#### STORY-V2-D02 : Configuration O2switch — backend Laravel production

**Epic :** EPIC-D
**Priorité :** Must Have
**Points :** 5

**User Story :**
En tant que développeur,
je veux déployer le backend Laravel sur O2switch avec les bons paramètres CORS, BDD et emails,
afin que l'API soit accessible depuis le frontend Vercel.

**Critères d'acceptation :**
- [ ] `.env.production` template documenté (valeurs sensibles dans GitHub Secrets)
- [ ] GitHub Actions workflow `deploy-backend.yml` créé et fonctionnel
- [ ] `php artisan migrate --force` s'exécute sans erreur en production
- [ ] `php artisan config:cache && php artisan route:cache` appliqués
- [ ] CORS configuré : domaine Vercel autorisé + pattern preview Vercel
- [ ] Cron O2switch configuré : `* * * * * php artisan schedule:run`
- [ ] SSL actif sur le sous-domaine API
- [ ] Test : `curl https://api.[domaine]/api/v1/posts` répond 200

**Notes techniques :**
- Créer `.github/workflows/deploy-backend.yml`
- Créer `.env.example` à jour avec toutes les variables v2
- Vérifier que PHP 8.2+ est disponible sur O2switch (cPanel)

**Dépendances :** Domaine acheté (Q5 ouverte dans le PRD)

---

### EPIC-P — Paiement HelloAsso

---

#### STORY-V2-P01 : Page /adhesion et bouton HelloAsso

**Epic :** EPIC-P
**Priorité :** Must Have
**Points :** 2

**User Story :**
En tant que visiteur ou futur membre,
je veux accéder à une page dédiée à l'adhésion avec un bouton pour payer ma cotisation via HelloAsso,
afin de pouvoir rejoindre l'association facilement depuis le site.

**Critères d'acceptation :**
- [ ] Page `/adhesion` créée (publique, sans authentification requise)
- [ ] Contenu : présentation de l'association, montant cotisation, ce que ça inclut
- [ ] Bouton "Payer ma cotisation" ouvre HelloAsso dans un nouvel onglet
- [ ] Lien HelloAsso configuré via variable d'environnement `NEXT_PUBLIC_HELLOASSO_FORM_URL`
- [ ] Lien "Adhérer" visible sur la page d'accueil (hero ou navbar)
- [ ] Section "Statut cotisation" sur la page `/tableau-de-bord/profil` — affiche la date du dernier paiement si `membership_paid_at` renseigné

**Notes techniques :**
- Créer `frontend/src/app/(public)/adhesion/page.tsx`
- Ajouter le lien dans la navbar publique `(public)/layout.tsx`
- Ajouter section profil côté frontend uniquement (backend viendra avec STORY-V2-P02)

**Dépendances :** STORY-V2-R01 (palette)

---

#### STORY-V2-P02 : Webhook HelloAsso — mise à jour cotisation

**Epic :** EPIC-P
**Priorité :** Should Have
**Points :** 5

**User Story :**
En tant que trésorier (bureau),
je veux que le statut de cotisation d'un membre soit automatiquement mis à jour après son paiement HelloAsso,
afin de ne pas avoir à le saisir manuellement.

**Critères d'acceptation :**
- [ ] Migration : ajout `membership_paid_at` (timestamp nullable) et `membership_paid_amount` (decimal nullable) sur `users`
- [ ] Endpoint `POST /api/v1/webhooks/helloasso` créé (public, hors auth Sanctum)
- [ ] Middleware `VerifyHelloAssoSignature` (HMAC-SHA256) appliqué
- [ ] Controller : retrouve l'user par email, met à jour `membership_paid_at`
- [ ] Controller : crée une `budget_entry` (type: recette, category: cotisation) automatiquement
- [ ] Log webhook dans `helloasso_webhooks` (toujours, même si user non trouvé)
- [ ] Idempotence : si webhook pour cet email cette année-civile déjà traité → 200 sans doublon
- [ ] Test : simuler un POST avec signature valide → vérifier BDD mise à jour

**Notes techniques :**
- Migration `2026_03_29_000002_add_membership_paid_at_to_users_table.php`
- Migration `2026_03_29_000007_create_helloasso_webhooks_table.php`
- Configurer `HELLOASSO_WEBHOOK_SECRET` dans `.env`
- Tester en local avec un client HTTP (Insomnia/Postman) + signature manuellement calculée

**Dépendances :** STORY-V2-D02 (backend en production), STORY-V2-B01 (table budget_entries)

---

### EPIC-N — Newsletter Membres

---

#### STORY-V2-N01 : Backend newsletter — migrations et API opt-in

**Epic :** EPIC-N
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant que développeur,
je veux les migrations BDD et les endpoints API pour gérer l'abonnement newsletter des membres,
afin que le frontend puisse implémenter le toggle et l'admin puisse accéder aux abonnés.

**Critères d'acceptation :**
- [ ] Migration : ajout `newsletter_subscribed_at` (timestamp nullable) et `newsletter_unsubscribe_token` (varchar 64 nullable) sur `users`
- [ ] Migration : création table `newsletter_campaigns`
- [ ] `PATCH /api/v1/me/newsletter` — toggle abonnement (body: `{ subscribed: bool }`)
- [ ] `GET /api/v1/admin/newsletter/subscribers` — liste abonnés [Admin|Founder]
- [ ] `GET /api/v1/admin/newsletter/subscribers/export` — CSV [Admin|Founder]
- [ ] Policy `NewsletterPolicy::manageSubscribers()` appliquée
- [ ] Tests Pest : toggle subscribe/unsubscribe, vérification droit accès admin

**Notes techniques :**
- Migrations `2026_03_29_000001_add_newsletter_fields_to_users_table.php`
- Migrations `2026_03_29_000003_create_newsletter_campaigns_table.php`
- Controller `NewsletterController` à créer dans `app/Http/Controllers/Api/V1/`

**Dépendances :** STORY-V2-D02 (backend prod) en parallèle possible

---

#### STORY-V2-N02 : Frontend opt-in newsletter dans le profil

**Epic :** EPIC-N
**Priorité :** Must Have
**Points :** 2

**User Story :**
En tant que membre,
je veux activer ou désactiver la réception de la newsletter depuis mon profil,
afin de contrôler les communications que je reçois de l'association.

**Critères d'acceptation :**
- [ ] Toggle "Recevoir la newsletter" visible sur `/tableau-de-bord/profil`
- [ ] L'état initial reflète `newsletter_subscribed_at` (non null = coché)
- [ ] Le toggle appelle `PATCH /api/v1/me/newsletter`
- [ ] Feedback visuel (toast succès/erreur)
- [ ] Le texte explique ce que contient la newsletter

**Notes techniques :**
- Composant `NewsletterToggle.tsx` dans `components/features/newsletter/`
- Ajouter à `ProfilePage.tsx`
- `toggleNewsletter()` dans `lib/newsletter.ts`

**Dépendances :** STORY-V2-N01

---

#### STORY-V2-N03 : Page admin — liste abonnés et export CSV

**Epic :** EPIC-N
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant qu'administrateur,
je veux voir la liste des membres abonnés à la newsletter et pouvoir l'exporter,
afin de savoir combien de personnes je vais toucher avant d'envoyer une campagne.

**Critères d'acceptation :**
- [ ] Page `/tableau-de-bord/newsletter` accessible aux rôles `admin` et `founder`
- [ ] Tableau : nom, email, date d'abonnement — triable par date
- [ ] Compteur total affiché en haut ("X membres abonnés")
- [ ] Barre de recherche par nom ou email
- [ ] Bouton "Exporter CSV" télécharge `newsletter-abonnes-{date}.csv`
- [ ] Lien dans la sidebar du dashboard (section "Admin")

**Notes techniques :**
- Composant `NewsletterAdminPage.tsx` + `SubscribersTable.tsx`
- Ajouter lien dans `(dashboard)/layout.tsx` sidebar (rôle admin/founder)
- Route Next.js : `app/(dashboard)/tableau-de-bord/newsletter/page.tsx`
- Protéger avec `RoleGate` (admin, founder)

**Dépendances :** STORY-V2-N01

---

#### STORY-V2-N04 : Backend — création et envoi de campagne newsletter

**Epic :** EPIC-N
**Priorité :** Should Have
**Points :** 5

**User Story :**
En tant qu'administrateur,
je veux créer une newsletter et l'envoyer à tous les membres abonnés via le dashboard,
afin de communiquer les actualités de l'association sans outil externe.

**Critères d'acceptation :**
- [ ] `POST /api/v1/admin/newsletter/campaigns` — créer brouillon
- [ ] `PATCH /api/v1/admin/newsletter/campaigns/{id}` — modifier brouillon
- [ ] `POST /api/v1/admin/newsletter/campaigns/{id}/send` — déclencher envoi
- [ ] `GET /api/v1/admin/newsletter/campaigns` — historique (sent_at, recipient_count)
- [ ] Job `SendNewsletterEmail` dispatché en queue pour chaque abonné
- [ ] Chaque email Resend contient le lien de désabonnement unique (token HMAC)
- [ ] Mise à jour `newsletter_campaigns.sent_at` et `recipient_count` après envoi
- [ ] Pas de double envoi : vérification `sent_at IS NULL` avant envoi

**Notes techniques :**
- `app/Jobs/SendNewsletterEmail.php` (dispatché en queue `database`)
- Template email HTML dans `resources/views/emails/newsletter.blade.php`
- Générer le token désabonnement : `hash_hmac('sha256', $user->id.'|'.$user->email, config('app.key'))`
- Config Resend : `NEWSLETTER_FROM_ADDRESS=newsletter@[domaine]`

**Dépendances :** STORY-V2-N01, STORY-V2-D02 (queue prod)

---

#### STORY-V2-N05 : Frontend — interface création et envoi de campagne

**Epic :** EPIC-N
**Priorité :** Should Have
**Points :** 3

**User Story :**
En tant qu'administrateur,
je veux composer une newsletter avec un éditeur riche et la prévisualiser avant de l'envoyer,
afin de contrôler la qualité du contenu avant diffusion.

**Critères d'acceptation :**
- [ ] Bouton "Nouvelle newsletter" sur la page `/tableau-de-bord/newsletter`
- [ ] Formulaire : champ sujet + éditeur Tiptap (rich text)
- [ ] Bouton "Enregistrer brouillon" (sans envoi)
- [ ] Bouton "Envoyer" avec modale de confirmation "Vous allez envoyer à X membres"
- [ ] Liste des campagnes envoyées : date, sujet, nombre de destinataires
- [ ] Feedback toast après envoi réussi

**Notes techniques :**
- Composant `CampaignForm.tsx` avec éditeur Tiptap (`immediatelyRender: false`)
- API calls dans `lib/newsletter.ts`

**Dépendances :** STORY-V2-N03, STORY-V2-N04

---

#### STORY-V2-N06 : Désabonnement par lien email (RGPD)

**Epic :** EPIC-N
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant que membre abonné,
je veux pouvoir me désabonner en un clic depuis le lien dans l'email,
afin de gérer mes préférences sans avoir à me connecter.

**Critères d'acceptation :**
- [ ] Endpoint `POST /api/v1/newsletter/unsubscribe` (public, sans auth)
- [ ] Vérification token HMAC (`hash_equals()`) — résistant aux timing attacks
- [ ] Mise à jour : `newsletter_subscribed_at = NULL`, `newsletter_unsubscribe_token = NULL`
- [ ] Page Next.js `/desabonnement?token=XXX` — appelle l'endpoint et affiche confirmation
- [ ] La confirmation affiche : "Vous avez été désabonné." + lien retour accueil
- [ ] Token invalidé après utilisation (non-rejouable)
- [ ] Cas d'erreur : token invalide → page "Ce lien n'est plus valide."

**Notes techniques :**
- Route publique (pas de middleware `auth:sanctum`)
- Page `frontend/src/app/(public)/desabonnement/page.tsx` — client component avec `useSearchParams`
- Tester avec un token généré manuellement

**Dépendances :** STORY-V2-N01

---

### EPIC-I — Inventaire Équipements

---

#### STORY-V2-I01 : Backend inventaire — migrations et API CRUD

**Epic :** EPIC-I
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant que développeur,
je veux les migrations BDD et les endpoints API pour l'inventaire des équipements,
afin que le bureau puisse gérer le matériel de l'association.

**Critères d'acceptation :**
- [ ] Migration : table `equipment` (id, name, category, quantity, status, notes, created_by)
- [ ] `GET /api/v1/inventory` — liste filtrée (category, status) [Bureau+]
- [ ] `POST /api/v1/inventory` — créer équipement [Bureau+]
- [ ] `GET /api/v1/inventory/{id}` — détail + assignments actifs [Bureau+]
- [ ] `PATCH /api/v1/inventory/{id}` — modifier [Bureau+]
- [ ] `DELETE /api/v1/inventory/{id}` — supprimer [Admin|Founder]
- [ ] `GET /api/v1/inventory/export` — CSV [Bureau+]
- [ ] `InventoryPolicy` avec rôles corrects

**Notes techniques :**
- Migration `2026_03_29_000004_create_equipment_table.php`
- Controller `EquipmentController.php`
- Resource `EquipmentResource.php` pour la sérialisation

**Dépendances :** STORY-V2-D02

---

#### STORY-V2-I02 : Frontend — page inventaire (liste et formulaire)

**Epic :** EPIC-I
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant que membre du bureau,
je veux voir la liste des équipements avec leur état et pouvoir en ajouter ou modifier,
afin de tenir un inventaire à jour du matériel de l'association.

**Critères d'acceptation :**
- [ ] Page `/tableau-de-bord/inventaire` accessible aux rôles bureau+
- [ ] Tableau/grille des équipements : nom, catégorie, quantité, statut (badge coloré)
- [ ] Filtres : catégorie (dropdown) et état (dropdown)
- [ ] Bouton "Ajouter un équipement" → modal formulaire
- [ ] Formulaire : nom (req.), catégorie (select), quantité (number), état (select), notes (textarea)
- [ ] Bouton modifier (crayon) et supprimer (corbeille) sur chaque ligne
- [ ] Compteurs en haut : "X en bon état / Y usés / Z hors service"
- [ ] Bouton "Exporter CSV"
- [ ] Lien dans la sidebar (section bureau)

**Notes techniques :**
- `InventoryPage.tsx`, `EquipmentForm.tsx`, `EquipmentCard.tsx`
- API calls dans `lib/inventory.ts`
- Types dans `types/index.ts`

**Dépendances :** STORY-V2-I01

---

#### STORY-V2-I03 : Backend attributions — API assign/return

**Epic :** EPIC-I
**Priorité :** Should Have
**Points :** 3

**User Story :**
En tant que développeur,
je veux les endpoints API pour attribuer et récupérer des équipements,
afin que le bureau puisse tracer qui possède quoi.

**Critères d'acceptation :**
- [ ] Migration : table `equipment_assignments` (id, equipment_id, user_id, assigned_at, returned_at, notes, assigned_by)
- [ ] `POST /api/v1/inventory/{id}/assign` — attribuer à un membre (body: `{ user_id, notes? }`) [Bureau+]
- [ ] `PATCH /api/v1/inventory/assignments/{id}/return` — marquer retour [Bureau+]
- [ ] `GET /api/v1/inventory/{id}` — inclut `active_assignments` et `assignment_history`
- [ ] Règle métier : pas d'attribution si quantité en stock insuffisante

**Notes techniques :**
- Migration `2026_03_29_000005_create_equipment_assignments_table.php`
- Ajouter au `EquipmentController` ou créer `EquipmentAssignmentController`

**Dépendances :** STORY-V2-I01

---

#### STORY-V2-I04 : Frontend attributions et historique

**Epic :** EPIC-I
**Priorité :** Should Have
**Points :** 3

**User Story :**
En tant que membre du bureau,
je veux enregistrer l'attribution d'un équipement à un membre et voir l'historique,
afin de tracer qui possède quoi depuis quand.

**Critères d'acceptation :**
- [ ] Bouton "Attribuer" sur la page détail d'un équipement
- [ ] Modal d'attribution : sélection membre (dropdown), notes optionnelles
- [ ] Liste "Attributions actives" sur la page détail (nom membre + date)
- [ ] Bouton "Marquer comme rendu" sur chaque attribution active
- [ ] Onglet "Historique" avec toutes les attributions passées (rendu ou actif)

**Notes techniques :**
- Composant `AssignmentModal.tsx`
- API calls `assignEquipment()` et `returnEquipment()` dans `lib/inventory.ts`

**Dépendances :** STORY-V2-I02, STORY-V2-I03

---

#### STORY-V2-I05 : Export CSV inventaire

**Epic :** EPIC-I
**Priorité :** Could Have
**Points :** 2

**User Story :**
En tant que membre du bureau,
je veux télécharger un fichier CSV de l'inventaire complet,
afin de le partager ou l'importer dans un autre outil.

**Critères d'acceptation :**
- [ ] Bouton "Exporter CSV" sur la page inventaire
- [ ] Le fichier inclut : nom, catégorie, quantité, état, notes, date de création
- [ ] Nom du fichier : `inventaire-safoulee-{date}.csv`
- [ ] Encodage UTF-8 avec BOM (compatible Excel français)

**Notes techniques :**
- Controller Laravel : `return response()->streamDownload(fn() => ..., 'inventaire.csv')`
- Headers : `Content-Type: text/csv; charset=UTF-8`, ajouter BOM `\xEF\xBB\xBF`

**Dépendances :** STORY-V2-I01

---

### EPIC-B — Gestion Budgétaire

---

#### STORY-V2-B01 : Backend budget — migrations et API CRUD

**Epic :** EPIC-B
**Priorité :** Must Have
**Points :** 3

**User Story :**
En tant que développeur,
je veux les migrations BDD et les endpoints API pour la gestion budgétaire,
afin que le trésorier puisse saisir et consulter les finances de l'association.

**Critères d'acceptation :**
- [ ] Migration : table `budget_entries` (id, type, amount, entry_date, category, description, receipt_url, created_by)
- [ ] `GET /api/v1/budget` — liste avec filtres (?type, ?category, ?from, ?to, ?page) [Bureau+]
- [ ] `POST /api/v1/budget` — saisir mouvement [Bureau+]
- [ ] `PATCH /api/v1/budget/{id}` — modifier [Bureau+]
- [ ] `DELETE /api/v1/budget/{id}` — supprimer [Admin|Founder]
- [ ] `GET /api/v1/budget/summary` — solde + agrégats mensuels (12 mois) [Bureau+]
- [ ] `GET /api/v1/budget/export` — CSV sur période [Bureau+]
- [ ] `BudgetPolicy` appliquée

**Notes techniques :**
- Migration `2026_03_29_000006_create_budget_entries_table.php`
- Controller `BudgetController.php`
- La `summary` query : `SUM(amount) WHERE type = 'recette'` - `SUM(amount) WHERE type = 'depense'`

**Dépendances :** STORY-V2-D02

---

#### STORY-V2-B02 : Frontend — dashboard financier

**Epic :** EPIC-B
**Priorité :** Must Have
**Points :** 5

**User Story :**
En tant que trésorier (bureau),
je veux un tableau de bord financier avec le solde, un graphique mensuel et la liste des mouvements,
afin de suivre les finances de l'association en temps réel.

**Critères d'acceptation :**
- [ ] Page `/tableau-de-bord/budget` accessible aux rôles bureau+
- [ ] Solde courant affiché en grand (recettes - dépenses), coloré vert/rouge selon signe
- [ ] Graphique en barres : recettes vs dépenses par mois (12 derniers mois) — Recharts (lazy-loaded)
- [ ] Répartition par catégorie (liste avec pourcentages)
- [ ] Filtre par année (sélecteur)
- [ ] Liste des mouvements récents (10 derniers) avec type, montant, date, catégorie
- [ ] Bouton "Voir tout" → liste complète avec filtres avancés
- [ ] Lien dans la sidebar (section bureau)

**Notes techniques :**
- `BudgetPage.tsx`, `BudgetChart.tsx`
- `recharts` à installer (`npm install recharts`)
- Dynamic import pour `BudgetChart` : `const Chart = dynamic(() => import('./BudgetChart'), { ssr: false })`

**Dépendances :** STORY-V2-B01

---

#### STORY-V2-B03 : Frontend — formulaire saisie dépense/recette

**Epic :** EPIC-B
**Priorité :** Must Have
**Points :** 2

**User Story :**
En tant que trésorier,
je veux saisir rapidement une dépense ou une recette depuis le dashboard budget,
afin de tenir les comptes à jour au fil de l'eau.

**Critères d'acceptation :**
- [ ] Bouton "Ajouter une dépense" et "Ajouter une recette" bien visibles
- [ ] Modal formulaire : type (dépense/recette), montant (chiffre), date (date picker), catégorie (select), description (text req.)
- [ ] Validation : montant > 0, description non vide, date valide
- [ ] Après soumission : la liste et le solde se mettent à jour sans rechargement
- [ ] Bouton modifier sur chaque mouvement (réouvre le formulaire pré-rempli)
- [ ] Confirmation avant suppression

**Notes techniques :**
- Composant `BudgetEntryForm.tsx` — react-hook-form + zod (déjà installés)
- Optimistic update ou refetch après mutation

**Dépendances :** STORY-V2-B02

---

#### STORY-V2-B04 : Export CSV budget

**Epic :** EPIC-B
**Priorité :** Should Have
**Points :** 2

**User Story :**
En tant que trésorier,
je veux exporter les mouvements financiers sur une période en CSV,
afin de les importer dans un logiciel comptable ou de les présenter à l'AG.

**Critères d'acceptation :**
- [ ] Sélecteur "De — À" (dates) sur la page budget
- [ ] Bouton "Exporter CSV" déclenche le téléchargement
- [ ] Colonnes CSV : date, type, catégorie, description, recette, dépense (colonnes séparées)
- [ ] Ligne de totaux en bas du fichier
- [ ] Encodage UTF-8 avec BOM (compatible Excel français)
- [ ] Nom du fichier : `budget-safoulee-{from}-{to}.csv`

**Notes techniques :**
- `GET /api/v1/budget/export?from=2026-01-01&to=2026-12-31`
- Utiliser `Blob` côté frontend pour déclencher le téléchargement

**Dépendances :** STORY-V2-B01

---

## Allocation aux sprints

### Sprint 9 (2026-03-30 — 2026-04-05) — 10/10 pts

**Objectif :** Refonte graphique v2 — nouvelle palette, images officielles, nom association

| Story | Points | Priorité |
|-------|--------|---------|
| STORY-V2-R01 — Palette `#FB3936` | 5 | Must |
| STORY-V2-R02 — Images officielles | 3 | Must |
| STORY-V2-R03 — Nom association | 2 | Must |

**Risques :** Nombre de fichiers à modifier pour la palette peut être sous-estimé — prévoir du buffer.

---

### Sprint 10 (2026-04-06 — 2026-04-12) — 10/10 pts

**Objectif :** Site en production — Vercel + O2switch opérationnels + page adhésion

| Story | Points | Priorité |
|-------|--------|---------|
| STORY-V2-D01 — Configuration Vercel | 3 | Must |
| STORY-V2-D02 — Configuration O2switch | 5 | Must |
| STORY-V2-P01 — Page /adhesion HelloAsso | 2 | Must |

**Risques :** Achat de domaine et propagation DNS peuvent prendre 24–48 h. Lancer le sprint en avance si possible.

**Dépendance externe :** Domaine personnalisé à acheter avant ce sprint.

---

### Sprint 11 (2026-04-13 — 2026-04-19) — 10/10 pts

**Objectif :** Webhook HelloAsso + Newsletter backend

| Story | Points | Priorité |
|-------|--------|---------|
| STORY-V2-P02 — Webhook HelloAsso | 5 | Should |
| STORY-V2-N01 — Backend newsletter | 3 | Must |
| STORY-V2-N02 — Frontend opt-in profil | 2 | Must |

**Risques :** Tester le webhook HelloAsso nécessite un compte HelloAsso configuré. Commencer STORY-V2-N01 si P02 bloqué.

---

### Sprint 12 (2026-04-20 — 2026-04-26) — 11/10 pts

**Objectif :** Newsletter admin — liste abonnés + envoi campagnes + désabonnement RGPD

| Story | Points | Priorité |
|-------|--------|---------|
| STORY-V2-N03 — Admin liste abonnés | 3 | Must |
| STORY-V2-N04 — Backend envoi campagne | 5 | Should |
| STORY-V2-N06 — Désabonnement RGPD | 3 | Must |

**Note :** 11 pts = légèrement au-dessus de la capacité nominale, réaliste vu la vélocité moyenne de 11,6.

---

### Sprint 13 (2026-04-27 — 2026-05-03) — 9/10 pts

**Objectif :** Newsletter frontend complet + Inventaire backend

| Story | Points | Priorité |
|-------|--------|---------|
| STORY-V2-N05 — Frontend campagnes | 3 | Should |
| STORY-V2-I01 — Backend inventaire CRUD | 3 | Must |
| STORY-V2-I03 — Backend attributions | 3 | Should |

---

### Sprint 14 (2026-05-04 — 2026-05-10) — 8/10 pts

**Objectif :** Inventaire frontend complet (interface + attributions + export)

| Story | Points | Priorité |
|-------|--------|---------|
| STORY-V2-I02 — Frontend inventaire | 3 | Must |
| STORY-V2-I04 — Frontend attributions | 3 | Should |
| STORY-V2-I05 — Export CSV inventaire | 2 | Could |

**Buffer :** 2 pts disponibles pour corrections ou amélioration d'une story précédente.

---

### Sprint 15 (2026-05-11 — 2026-05-17) — 12/10 pts

**Objectif :** Gestion budgétaire complète — dashboard + saisie + export

| Story | Points | Priorité |
|-------|--------|---------|
| STORY-V2-B01 — Backend budget | 3 | Must |
| STORY-V2-B02 — Dashboard financier | 5 | Must |
| STORY-V2-B03 — Formulaire saisie | 2 | Must |
| STORY-V2-B04 — Export CSV budget | 2 | Should |

**Note :** 12 pts = sprint chargé mais cohérent avec la tendance de vélocité croissante. Si nécessaire, reporter STORY-V2-B04 en post-sprint.

---

## Stories post-sprint (backlog)

Ces stories de la v1 restent dans le backlog et peuvent être traitées après la v2 :

| Story | Points | Epic | Priorité |
|-------|--------|------|---------|
| STORY-013 — Chat temps réel (Pusher) | 5 | EPIC-003 | Should |
| STORY-014 — Notifications in-app | 3 | EPIC-003 | Should |
| STORY-016 — Intégration Strava | 5 | EPIC-004 | Could |

---

## Traçabilité Epics → Stories

| Epic ID | Epic Name | Stories | Points | Sprints |
|---------|-----------|---------|--------|---------|
| EPIC-R | Refonte Graphique | R01, R02, R03 (+UX01✅, UX02✅) | 10 | 9 |
| EPIC-D | Infrastructure Production | D01, D02 | 8 | 10 |
| EPIC-P | Paiement HelloAsso | P01, P02 | 7 | 10–11 |
| EPIC-N | Newsletter | N01, N02, N03, N04, N05, N06 | 19 | 11–12–13 |
| EPIC-I | Inventaire | I01, I02, I03, I04, I05 | 14 | 13–14 |
| EPIC-B | Budget | B01, B02, B03, B04 | 12 | 15 |
| **Total** | | **22 stories** | **70 pts** | **7 sprints** |

---

## Couverture des FRs

| FR | Story | Sprint |
|----|-------|--------|
| FR-R01 — Palette couleurs | STORY-V2-R01 | 9 |
| FR-R02 — Images officielles | STORY-V2-R02 | 9 |
| FR-R03 — Nom association | STORY-V2-R03 | 9 |
| FR-UX01 — Logo auth cliquable | Livré hors-sprint (2026-03-29) ✅ | — |
| FR-UX02 — Bug Tiptap SSR | Livré hors-sprint (2026-03-29) ✅ | — |
| FR-N01 — Opt-in newsletter | STORY-V2-N01, N02 | 11 |
| FR-N02 — Admin liste abonnés | STORY-V2-N03 | 12 |
| FR-N03 — Envoi campagne | STORY-V2-N04, N05 | 12–13 |
| FR-N04 — Désabonnement RGPD | STORY-V2-N06 | 12 |
| FR-I01 — CRUD équipements | STORY-V2-I01, I02 | 13–14 |
| FR-I02 — Attributions | STORY-V2-I03, I04 | 13–14 |
| FR-I03 — Export inventaire CSV | STORY-V2-I05 | 14 |
| FR-B01 — Saisie budget | STORY-V2-B01, B03 | 15 |
| FR-B02 — Dashboard financier | STORY-V2-B02 | 15 |
| FR-B03 — Export CSV budget | STORY-V2-B04 | 15 |
| FR-P01 — Bouton HelloAsso | STORY-V2-P01 | 10 |
| FR-P02 — Webhook HelloAsso | STORY-V2-P02 | 11 |
| FR-D01 — Déploiement Vercel | STORY-V2-D01 | 10 |
| FR-D02 — Déploiement O2switch | STORY-V2-D02 | 10 |

**Couverture : 19/19 FRs couverts (17 + 2 hors-sprint) ✅**

---

## Risques et mitigation

**Élevés :**
- **Domaine non acheté** avant Sprint 10 → bloque D01 et D02. Mitigation : acheter le domaine dès que possible, en parallèle du Sprint 9.
- **Compte HelloAsso non configuré** avant Sprint 11 → bloque le test de P02. Mitigation : créer le compte HelloAsso en avance (gratuit, 5 min).

**Moyens :**
- **Quota Resend** — 3000 emails/mois gratuits. Pour < 200 membres, la newsletter ne dépassera pas ce quota. Surveiller quand même.
- **Vélocité sprint 15** (12 pts) — légèrement au-dessus de la capacité. Prévoir de reporter B04 si B02 prend plus de temps que prévu.
- **CORS Vercel preview** — les preview deployments ont des URLs variables. La regex CORS Laravel doit couvrir `*.vercel.app`.

**Faibles :**
- Compatibilité `recharts` avec Next.js 14 App Router — mitigé par `dynamic import` avec `ssr: false`.

---

## Dépendances externes

| Dépendance | Sprint concerné | Action requise |
|-----------|----------------|---------------|
| Achat domaine personnalisé | Sprint 10 | Jules — avant le 2026-04-06 |
| Création compte HelloAsso | Sprint 11 | Bureau — avant le 2026-04-13 |
| Clé API HelloAsso webhook secret | Sprint 11 | Généré lors de la config HelloAsso |
| Accès cPanel O2switch | Sprint 10 | Disponible (hébergement déjà acheté ?) |

---

## Définition of Done (DoD)

Pour qu'une story soit considérée terminée :

- [ ] Code implémenté et commité sur la branche feature
- [ ] PR créée et mergée sur `main`
- [ ] Build Next.js passe sans erreur (`npm run build`)
- [ ] Aucune erreur console en mode dev
- [ ] Critères d'acceptation validés manuellement
- [ ] Types TypeScript à jour (`types/index.ts`)
- [ ] Migration Laravel appliquée localement
- [ ] Déployé en production (après Sprint 10)

---

## Cadence des sprints

- **Durée :** 1 semaine (lundi → dimanche)
- **Début Sprint 9 :** 2026-03-30
- **Fin prévue v2 :** 2026-05-17

---

**Ce plan a été créé avec BMAD Method v6 — Phase 4 (Implementation Planning) — v2**
