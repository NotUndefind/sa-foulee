# Product Requirements Document : La Neuville TAF sa Foulée — Responsive Design v4

**Date :** 2026-04-14
**Auteur :** Jules Bourin
**Version :** 4.0
**Projet :** saFoulee — Responsive Design (iPhone & Tablette)
**Statut :** Approuvé

---

## Aperçu du document

Ce PRD v4 est un amendement au PRD v3 (2026-03-30). Il couvre la révision complète du responsive design pour l'ensemble des pages du site, ciblant les formats iPhone (~375px) et tablette (~768px).

**Documents liés :**
- PRD v3 : `docs/prd-saFoulee-2026-03-30.md`
- Architecture v2 : `docs/architecture-saFoulee-2026-03-29.md`
- Sprint plan v3 : `docs/sprint-plan-saFoulee-2026-03-30-v3.md`

---

## Résumé exécutif

L'application n'a aucune optimisation mobile. Sur iPhone, la navbar publique déborde horizontalement (logo + texte + liens + boutons auth sur 375px), la landing page est trop longue avec des sections redondantes, et la page Activités affiche 12 cards identiques en grille sans intérêt éditorial. Ce PRD v4 définit une révision complète de toutes les pages pour offrir une expérience de qualité sur iPhone et tablette.

Choix utilisateur confirmés :
- Navbar publique mobile : **hamburger menu** (drawer)
- Page Activités mobile : **hero card + carousel horizontal**
- Landing mobile : supprimer **cards valeurs** + **CTA double** → garder un seul CTA
- Dashboard mobile : **sidebar collapsible** (drawer remplace la bottom nav actuelle)
- Périmètre : **toutes les pages** du site

---

## Objectifs produit

### Objectifs métier

1. **Rendre le site utilisable sur iPhone** — aucune page ne doit avoir de scroll horizontal ou de contenu inaccessible.
2. **Réduire la longueur des pages sur mobile** — supprimer/masquer les sections redondantes pour augmenter l'engagement.
3. **Briser la monotonie de la grille de cards** — apporter une hiérarchie visuelle et un design éditorial sur la page Activités.
4. **Accès complet au dashboard sur mobile** — y compris les liens admin/gestion, aujourd'hui coupés par la bottom nav limitée à 5 liens.

### Indicateurs de succès

| Indicateur | Cible |
|---|---|
| Scroll horizontal sur iPhone 375px | 0 page |
| Touch targets ≥ 44px | 100 % des éléments interactifs |
| Navbar publique fonctionnelle sur mobile | ✓ |
| Dashboard — liens admin accessibles sur mobile | ✓ |
| Landing page — hauteur réduite sur mobile (sections masquées) | ≥ 30 % |

---

## Exigences fonctionnelles — v4

### Groupe RN — Navigation Responsive

---

#### FR-RN01 : Hamburger menu navbar publique

**Priorité :** Must Have

**Description :**
La navbar publique (`frontend/src/app/(public)/layout.tsx`) n'a aucun comportement responsive. Sur mobile, logo + texte + liens + auth s'écrasent dans 375px. Il faut :
1. Sur mobile (< 768px) : masquer les liens nav et les boutons auth
2. Afficher un bouton hamburger (≡) à droite du logo
3. Au clic : ouvrir un drawer full-width avec les liens Activités, Blog, et les boutons Connexion/Rejoindre (ou Tableau de bord si connecté)
4. Le texte "sa Foulée" peut être masqué sur mobile — garder uniquement le logo image + "La Neuville TAF" sur une ligne

**Acceptance Criteria :**
- [ ] Sur iPhone 375px, la navbar tient en 1 ligne sans overflow horizontal
- [ ] Le bouton hamburger ouvre/ferme un drawer
- [ ] Le drawer contient tous les liens de navigation et les CTA auth
- [ ] Fermeture du drawer au clic sur un lien ou en dehors du drawer
- [ ] Sur tablette (768px+) et desktop, la navbar affiche les liens directement (comportement actuel)

**Fichiers concernés :**
- `frontend/src/app/(public)/layout.tsx`
- `frontend/src/components/features/public/PublicNavUser.tsx`

---

#### FR-RN02 : Dashboard — sidebar collapsible (drawer mobile)

**Priorité :** Must Have

**Description :**
Le dashboard layout (`frontend/src/app/(dashboard)/layout.tsx`) a une sidebar desktop masquée sur mobile (`hidden lg:flex`) et une bottom nav mobile limitée à 5 liens (les liens admin sont inaccessibles). Il faut :
1. Supprimer la bottom nav mobile actuelle (lignes 716-747 de layout.tsx)
2. Ajouter un header mobile : logo + titre de la page courante + bouton hamburger (≡)
3. Au clic sur le hamburger : ouvrir un drawer latéral gauche avec TOUS les liens (y compris section Gestion admin)
4. Le drawer reprend l'apparence de la sidebar desktop (fond `#C0302E`, mêmes icônes SVG)

**Acceptance Criteria :**
- [ ] Sur mobile, un header visible avec bouton hamburger
- [ ] Le drawer expose tous les liens nav y compris admin (Inventaire, Budget, Admin, Newsletter, Paramètres)
- [ ] Fermeture du drawer au clic sur un lien ou en dehors
- [ ] Pas de régression sur desktop (sidebar `hidden lg:flex` inchangée)
- [ ] `safe-area-inset-bottom` pris en compte sur iOS

**Fichiers concernés :**
- `frontend/src/app/(dashboard)/layout.tsx`

---

### Groupe RL — Landing Page Responsive

---

#### FR-RL01 : Masquer la section "valeurs" sur mobile

**Priorité :** Must Have

**Description :**
La landing page contient une section avec des cards présentant les valeurs de l'asso (bienveillance, partage, etc.). Sur mobile, cette section allonge inutilement la page sans apporter de valeur supplémentaire. Elle doit être masquée en dessous de 768px.

**Acceptance Criteria :**
- [ ] Section "valeurs" invisible sur iPhone (< 768px)
- [ ] Section "valeurs" visible sur tablette et desktop
- [ ] Aucune zone blanche ou layout shift au masquage

**Fichiers concernés :**
- `frontend/src/app/(public)/page.tsx`

---

#### FR-RL02 : Supprimer le CTA secondaire sur mobile

**Priorité :** Must Have

**Description :**
La landing page a deux blocs d'appel à l'action. Sur mobile, garder uniquement le CTA principal (premier bloc). Le second CTA doit être masqué sous 768px.

**Acceptance Criteria :**
- [ ] 1 seul bloc CTA visible sur mobile
- [ ] Les 2 blocs CTA visibles sur desktop

**Fichiers concernés :**
- `frontend/src/app/(public)/page.tsx`

---

#### FR-RL03 : Hero section responsive

**Priorité :** Must Have

**Description :**
Le hero de la landing page doit s'adapter au mobile : texte en pleine largeur, image/illustration en dessous (ou masquée), boutons en colonne. Les décorations SVG/blobs peuvent rester mais ne doivent pas créer d'overflow.

**Acceptance Criteria :**
- [ ] Texte hero lisible sur iPhone (taille font adaptée)
- [ ] Aucun débordement horizontal
- [ ] Boutons CTA tactiles (≥ 44px hauteur)

**Fichiers concernés :**
- `frontend/src/app/(public)/page.tsx`

---

#### FR-RL04 : Section stats en grille 2×2 sur mobile

**Priorité :** Should Have

**Description :**
La section "En chiffres" doit passer de sa disposition horizontale à une grille 2×2 sur mobile pour rester lisible.

**Acceptance Criteria :**
- [ ] 4 stats en 2 colonnes sur mobile
- [ ] Contraste texte/fond respecté (correction existante PRD v3 : fond crème `#F5F0EB`)

**Fichiers concernés :**
- `frontend/src/app/(public)/page.tsx`

---

### Groupe RA — Page Activités Responsive

---

#### FR-RA01 : Événements à venir — hero card + carousel

**Priorité :** Must Have

**Description :**
Sur la page Activités (`ActivitesPage.tsx`), la liste des événements à venir doit avoir un design éditorial sur mobile :
1. La première card (événement le plus proche) est affichée en "hero" grande taille avec photo, titre, date et bouton S'inscrire proéminent
2. Les événements suivants sont affichés dans un carousel horizontal avec `scroll-snap` CSS natif (pas de librairie externe)

**Acceptance Criteria :**
- [ ] 1 hero card visible au-dessus de la ligne de flottaison sur mobile
- [ ] Carousel horizontal avec scroll-snap pour les autres événements
- [ ] Design desktop inchangé (liste verticale actuelle)

**Fichiers concernés :**
- `frontend/src/components/features/events/ActivitesPage.tsx`

---

#### FR-RA02 : Grille "Nos dernières sorties" — 2 colonnes + lazy

**Priorité :** Must Have

**Description :**
La grille de 12 sorties passées (`repeat(3, 1fr)`) est redondante sur mobile. Sur mobile :
1. Passer à 2 colonnes maximum
2. Afficher 4 items par défaut + bouton "Voir plus" pour les items restants

**Acceptance Criteria :**
- [ ] Max 2 colonnes sur mobile
- [ ] 4 items visibles par défaut + bouton "Voir plus (X)" sur mobile
- [ ] Sur desktop, la grille 3 colonnes actuelle est inchangée

**Fichiers concernés :**
- `frontend/src/components/features/events/ActivitesPage.tsx`

---

#### FR-RA03 : Page Activités — layout général tablette

**Priorité :** Should Have

**Description :**
Sur tablette (768px-1024px), optimiser l'espacement et les tailles de police pour éviter les espaces vides excessifs.

**Acceptance Criteria :**
- [ ] Padding latéraux adaptés tablette
- [ ] Grille événements 2 colonnes sur tablette

**Fichiers concernés :**
- `frontend/src/components/features/events/ActivitesPage.tsx`

---

### Groupe RB — Page Blog Responsive

---

#### FR-RB01 : Blog — 1 colonne sur mobile

**Priorité :** Must Have

**Description :**
La page blog doit afficher les articles en colonne unique sur mobile, avec des cards larges et des images pleine largeur.

**Acceptance Criteria :**
- [ ] 1 colonne sur < 768px
- [ ] Images d'articles responsive (aspect-ratio préservé)
- [ ] Texte lisible (font-size ≥ 15px)

**Fichiers concernés :**
- `frontend/src/components/features/blog/PublicBlogPage.tsx`
- `frontend/src/components/features/blog/PostCard.tsx`

---

#### FR-RB02 : Blog — 2 colonnes sur tablette

**Priorité :** Should Have

**Description :**
Sur tablette (768px-1024px), afficher 2 colonnes d'articles (au lieu de 3).

**Acceptance Criteria :**
- [ ] 2 colonnes sur tablette
- [ ] 3 colonnes maintenues sur desktop

**Fichiers concernés :**
- `frontend/src/components/features/blog/PublicBlogPage.tsx`

---

### Groupe RD — Dashboard Pages Intérieures Responsive

---

#### FR-RD01 : Tableau de bord principal — cards empilées

**Priorité :** Must Have

**Description :**
La page principale du dashboard (`tableau-de-bord/page.tsx`) doit s'adapter au mobile : sections en colonne unique, quick actions 2×2, sections événements/sessions empilées.

**Acceptance Criteria :**
- [ ] Quick actions : 2 colonnes sur mobile (déjà partiellement `grid-cols-2` ✓)
- [ ] Sections événements + sessions : 1 colonne sur mobile
- [ ] Blog cards : 1 colonne sur mobile
- [ ] Padding bottom suffisant (safe area + espace pour le header mobile)

**Fichiers concernés :**
- `frontend/src/app/(dashboard)/tableau-de-bord/page.tsx`

---

#### FR-RD02 : Pages dashboard intérieures — responsive général

**Priorité :** Should Have

**Description :**
Les pages intérieures du dashboard (Événements, Sessions, Blog, Profil, Classement) doivent être utilisables sur mobile : pas de scroll horizontal, tableaux scrollables, formulaires pleine largeur.

**Acceptance Criteria :**
- [ ] Aucun scroll horizontal sur ces pages
- [ ] Les tableaux/listes sont scrollables horizontalement si nécessaire (`overflow-x: auto`)
- [ ] Les formulaires sont en pleine largeur sur mobile

**Fichiers concernés :**
- `frontend/src/app/(dashboard)/tableau-de-bord/evenements/page.tsx`
- `frontend/src/app/(dashboard)/tableau-de-bord/sessions/page.tsx`
- `frontend/src/app/(dashboard)/tableau-de-bord/profil/page.tsx`
- Autres pages dashboard

---

### Groupe RT — Pages Auth Responsive

---

#### FR-RT01 : Pages connexion et inscription responsive

**Priorité :** Must Have

**Description :**
Les pages de connexion (`/connexion`) et inscription doivent être utilisables sur mobile avec formulaires pleine largeur et boutons tactiles.

**Acceptance Criteria :**
- [ ] Formulaire centré en pleine largeur sur mobile
- [ ] Bouton submit ≥ 44px de hauteur
- [ ] Clavier virtuel ne cache pas le bouton submit (scroll approprié)

**Fichiers concernés :**
- `frontend/src/app/(auth)/` (pages connexion/inscription)

---

## Exigences non-fonctionnelles — v4

### NFR-R01 : Aucun scroll horizontal

**Priorité :** Must Have

**Description :**
Aucune page ne doit générer un scroll horizontal sur iPhone 375px (iPhone SE) ou 390px (iPhone 14).

**Critère :** `overflow-x: hidden` sur le body, et 0 élément avec `width > 100vw` non intentionnel.

---

### NFR-R02 : Touch targets minimum 44px

**Priorité :** Must Have

**Description :**
Tous les éléments interactifs (boutons, liens, icônes) doivent avoir une zone tactile d'au moins 44×44px (WCAG 2.5.5).

---

### NFR-R03 : Support safe-area iOS

**Priorité :** Must Have

**Description :**
Utiliser `env(safe-area-inset-*)` pour les éléments fixes (navbar, drawer) afin d'éviter les chevauchements avec l'encoche ou la Dynamic Island des iPhones.

---

### NFR-R04 : Aucune régression desktop

**Priorité :** Must Have

**Description :**
Toutes les modifications responsives doivent être mobile-first et ne pas altérer l'affichage desktop (breakpoint ≥ 1024px).

---

### NFR-R05 : Breakpoints cohérents

**Priorité :** Should Have

**Description :**
Utiliser exclusivement les breakpoints Tailwind standards :
- Mobile : < 640px (`sm`)
- Phablet/tablette : 640px–1024px (`sm` à `lg`)
- Desktop : ≥ 1024px (`lg+`)

Les media queries inline en px (actuellement dans `ActivitesPage.tsx`, `page.tsx`) doivent être migrées vers les utilitaires Tailwind v4 autant que possible.

---

## Epics

### EPIC-R01 : Navigation responsive

**Description :**
Rendre accessible et utilisable la navigation de tout le site sur mobile. Hamburger menu pour le site public, sidebar collapsible pour le dashboard.

**Functional Requirements :** FR-RN01, FR-RN02

**Story Count Estimate :** 4-6

**Priorité :** Must Have

**Business Value :**
Sans navigation fonctionnelle sur mobile, le reste du responsive est inutile. C'est le prérequis de tout le sprint.

---

### EPIC-R02 : Landing page responsive

**Description :**
Adapter la page d'accueil publique au mobile : masquer les sections redondantes, hero adapté, stats en grille 2×2.

**Functional Requirements :** FR-RL01, FR-RL02, FR-RL03, FR-RL04

**Story Count Estimate :** 3-5

**Priorité :** Must Have

**Business Value :**
La landing est la première impression — si elle est cassée sur mobile, les visiteurs partent immédiatement.

---

### EPIC-R03 : Pages Activités et Blog responsives

**Description :**
Redesign éditorial de la page Activités (hero card + carousel) et adaptation du blog en colonnes adaptées.

**Functional Requirements :** FR-RA01, FR-RA02, FR-RA03, FR-RB01, FR-RB02

**Story Count Estimate :** 5-7

**Priorité :** Must Have

**Business Value :**
Pages les plus visitées après la landing — l'expérience doit convertir les visiteurs mobiles en membres.

---

### EPIC-R04 : Dashboard responsive

**Description :**
Rendre le dashboard membre utilisable sur mobile : drawer de navigation complet (tous les liens), pages intérieures adaptées.

**Functional Requirements :** FR-RD01, FR-RD02

**Story Count Estimate :** 4-6

**Priorité :** Must Have

**Business Value :**
Les membres accèdent au dashboard depuis leur téléphone pour voir les événements et s'inscrire.

---

### EPIC-R05 : Auth et pages secondaires responsives

**Description :**
Adapter les pages de connexion/inscription et les formulaires du dashboard au mobile.

**Functional Requirements :** FR-RT01

**Story Count Estimate :** 2-3

**Priorité :** Must Have

---

## User Stories (high-level)

- En tant que visiteur sur iPhone, je veux que la navbar se replie en hamburger menu pour pouvoir naviguer sans overflow.
- En tant que visiteur sur iPhone, je veux voir le prochain événement en hero card pour avoir une expérience éditoriale immédiate.
- En tant que membre sur mobile, je veux accéder à tous les liens du dashboard (y compris admin) via un drawer latéral pour gérer l'association depuis mon téléphone.
- En tant que visiteur sur mobile, je veux que la landing page soit concise et rapide pour comprendre l'asso sans scroller indéfiniment.

---

## Personas

- **Visiteur mobile** : Découvre l'association via un lien partagé sur téléphone. Première visite, doit comprendre l'asso et trouver les prochaines sorties en < 30 secondes.
- **Membre coureur** : Consulte les événements et s'inscrit depuis son iPhone entre deux entraînements.
- **Admin/Bureau** : Gère les événements, le budget, la newsletter depuis tablette ou laptop.

---

## Périmètre

**In Scope :**
- Toutes les pages publiques (landing, activités, blog, détail événement)
- Toutes les pages du dashboard (tableau de bord, événements, sessions, blog, profil, classement, admin)
- Pages auth (connexion, inscription)
- Navigation (navbar publique hamburger + sidebar dashboard collapsible)

**Out of Scope :**
- Refonte du design desktop — ce PRD ne touche que les breakpoints mobiles/tablette
- Application native iOS/Android
- Nouvelles fonctionnalités (pas de nouvelles features dans ce sprint)

---

## Dépendances

### Internes

- Design system v2 (palette `#FB3936`) déjà en place — les composants responsive respectent les tokens existants
- Tailwind CSS v4 déjà configuré (`@theme inline` dans `globals.css`)
- Composants cards existants (`EventCard`, `SessionCard`, `PostCard`) réutilisés tels quels

### Externes

- Aucune dépendance externe nouvelle (carousel : scroll-snap CSS natif, pas de librairie)

---

## Hypothèses

- Les breakpoints Tailwind v4 par défaut (`sm:640px`, `md:768px`, `lg:1024px`) sont suffisants
- Les tests se font sur Chrome DevTools : iPhone SE (375px), iPhone 14 (390px), iPad (768px)
- Pas de test sur device physique requis pour la livraison

---

## Questions ouvertes

- Les pages admin (`AdminUsersPage`, `AdminSettingsPage`) doivent-elles être pleinement responsive ou seulement lisibles sur tablette ? Ce PRD suppose qu'elles doivent être au moins utilisables sur tablette (768px).

---

## Approval & Sign-off

### Stakeholders

- Jules Bourin — Product Owner / Développeur

### Approval Status

- [x] Product Owner

---

## Revision History

| Version | Date | Auteur | Changements |
|---|---|---|---|
| 4.0 | 2026-04-14 | Jules Bourin | PRD Responsive Design — révision complète iPhone & tablette |

---

## Appendix A : Requirements Traceability Matrix

| Epic ID | Epic Name | FRs | Story Count (Est.) |
|---|---|---|---|
| EPIC-R01 | Navigation responsive | FR-RN01, FR-RN02 | 4-6 stories |
| EPIC-R02 | Landing page responsive | FR-RL01, FR-RL02, FR-RL03, FR-RL04 | 3-5 stories |
| EPIC-R03 | Activités + Blog responsives | FR-RA01, FR-RA02, FR-RA03, FR-RB01, FR-RB02 | 5-7 stories |
| EPIC-R04 | Dashboard responsive | FR-RD01, FR-RD02 | 4-6 stories |
| EPIC-R05 | Auth responsive | FR-RT01 | 2-3 stories |
| **Total** | | **14 FRs** | **18-27 stories** |

---

## Appendix B : Prioritization Details

**Must Have (10 FRs) :**
FR-RN01, FR-RN02, FR-RL01, FR-RL02, FR-RL03, FR-RA01, FR-RA02, FR-RB01, FR-RD01, FR-RT01

**Should Have (4 FRs) :**
FR-RL04, FR-RA03, FR-RB02, FR-RD02

**NFRs Must Have :** NFR-R01, NFR-R02, NFR-R03, NFR-R04

**NFRs Should Have :** NFR-R05

---

*PRD v4 créé avec BMAD Method — Phase 2 (Planning)*
*Pour continuer : `/sprint-planning` pour décomposer en stories et planifier les sprints.*
