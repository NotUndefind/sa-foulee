# Sprint Plan : La Neuville TAF sa Foulée — Responsive Design v4

**Date :** 2026-04-14
**Scrum Master :** Jules Bourin
**Niveau projet :** 2
**PRD source :** `docs/prd-saFoulee-responsive-2026-04-14.md`
**Sprint précédent (v3) :** `docs/sprint-plan-saFoulee-2026-03-30-v3.md`

---

## Résumé exécutif

Ce plan couvre les **11 stories** issues du PRD v4 Responsive Design (2026-04-14), réparties sur **5 sprints** d'une semaine. La numérotation reprend à **Sprint 21** (suite au plan v3 qui couvrait les Sprints 16–20).

**Métriques clés :**

| Métrique | Valeur |
|---|---|
| Stories | 11 |
| Points totaux | 43 pts |
| Sprints planifiés | 5 (Sprint 21 → 25) |
| Capacité | ~10–11 pts/sprint |
| Vélocité historique | 11.6 pts/sprint (moyenne v1/v2/v3) |
| Livraison estimée | ~2026-05-17 |

**Ordre de priorité des epics :**

1. **EPIC-R01** — Navigation responsive (navbar hamburger + dashboard drawer) → Sprints 21-22
2. **EPIC-R02** — Landing page responsive (hero, valeurs, CTA, stats) → Sprint 21 + 23
3. **EPIC-R04** — Dashboard pages responsives → Sprint 22-23
4. **EPIC-R03** — Activités + Blog → Sprint 24-25
5. **EPIC-R05** — Auth responsive → Sprint 21

---

## Inventaire des stories

### EPIC-R01 — Navigation Responsive

---

#### STORY-RES-01 : Navbar publique — hamburger menu mobile

**Epic :** EPIC-R01
**Priorité :** Must Have
**Points :** 5
**Sprint :** 21

**User Story :**
En tant que visiteur sur iPhone,
Je veux que la navbar se replie en hamburger menu,
Afin de naviguer sans overflow horizontal ni contenu inaccessible.

**Critères d'acceptation :**
- [ ] Sur mobile (< 768px) : les liens nav et les boutons auth sont masqués
- [ ] Un bouton hamburger (≡) est visible à droite du logo sur mobile
- [ ] Au clic, un drawer full-screen s'ouvre avec : liens Activités, Blog, et les boutons auth (Connexion/Rejoindre ou Tableau de bord selon état)
- [ ] Fermeture du drawer : au clic sur un lien, sur le fond overlay, ou sur le bouton ✕
- [ ] Sur tablet (≥ 768px) et desktop : comportement actuel inchangé (liens directs)
- [ ] Sur iPhone 375px : la navbar tient sur 1 ligne sans overflow horizontal

**Notes techniques :**
- `layout.tsx` est un Server Component → créer un composant client séparé `MobileNavMenu.tsx` avec le state `isOpen`
- Le composant `MobileNavMenu` inclut le bouton hamburger + le drawer
- Pour accéder à l'état auth dans le drawer, réutiliser `PublicNavUser` ou passer les props nécessaires
- Classes Tailwind : `hidden md:flex` pour masquer les liens, `md:hidden` pour afficher le hamburger
- Drawer : `fixed inset-0 z-50`, fond overlay `rgba(0,0,0,0.4)`, panneau `bg-[#FAFAFA]` pleine hauteur
- Le texte "sa Foulée" peut être masqué sur mobile (`hidden md:inline`)

**Dépendances :** Aucune

**Fichiers :**
- `frontend/src/app/(public)/layout.tsx`
- `frontend/src/components/features/public/MobileNavMenu.tsx` _(nouveau)_
- `frontend/src/components/features/public/PublicNavUser.tsx`

---

#### STORY-RES-02 : Dashboard — sidebar collapsible drawer mobile

**Epic :** EPIC-R01
**Priorité :** Must Have
**Points :** 8
**Sprint :** 22

**User Story :**
En tant que membre sur mobile,
Je veux accéder à tous les liens du dashboard via un drawer latéral,
Afin de naviguer et gérer l'association depuis mon iPhone (y compris les liens admin).

**Critères d'acceptation :**
- [ ] La bottom nav mobile actuelle (lignes 716-747 de `layout.tsx`) est supprimée
- [ ] Un header mobile s'affiche (< 1024px) : logo icon + titre de la page courante + bouton hamburger
- [ ] Au clic sur le hamburger : drawer latéral gauche s'ouvre avec TOUS les liens (nav + section Gestion admin)
- [ ] Le drawer reprend l'apparence de la sidebar desktop (fond `#C0302E`, icônes SVG, même structure)
- [ ] Fermeture : au clic sur un lien ou sur l'overlay
- [ ] La sidebar desktop (≥ 1024px, `hidden lg:flex`) reste inchangée
- [ ] `safe-area-inset-*` appliqué sur le header mobile et le drawer
- [ ] Les liens admin (Inventaire, Budget, Admin, Newsletter, Paramètres) sont accessibles

**Notes techniques :**
- `layout.tsx` est déjà `'use client'` ✓ — ajouter `useState(isDrawerOpen)`
- Header mobile : `flex items-center justify-between px-4 h-14 lg:hidden` avec fond `#C0302E`
- Pour le titre de la page courante : dériver de `pathname` (ex: `/tableau-de-bord/evenements` → "Événements")
- Drawer : `fixed inset-y-0 left-0 z-50 w-72` avec `translate-x` animation (`translate-x-0` ouvert, `-translate-x-full` fermé)
- Overlay : `fixed inset-0 z-40 bg-black/40 lg:hidden`
- Fermer le drawer à chaque changement de `pathname` (useEffect)
- Padding bottom du `main` : `pb-4` (pas de bottom nav à compenser)

**Dépendances :** Aucune (STORY-RES-01 est indépendante)

**Fichiers :**
- `frontend/src/app/(dashboard)/layout.tsx`

---

### EPIC-R02 — Landing Page Responsive

---

#### STORY-RES-03 : Landing — masquer section valeurs + CTA secondaire sur mobile

**Epic :** EPIC-R02
**Priorité :** Must Have
**Points :** 2
**Sprint :** 21

**User Story :**
En tant que visiteur sur iPhone,
Je veux une landing page concise,
Afin de comprendre l'association sans scroller indéfiniment.

**Critères d'acceptation :**
- [ ] La section "valeurs" (cards bienveillance, partage, etc.) est masquée sur < 768px
- [ ] Le second bloc CTA est masqué sur < 768px
- [ ] Ces sections restent visibles sur tablette et desktop
- [ ] Aucun layout shift ou espace blanc résiduel au masquage

**Notes techniques :**
- `page.tsx` utilise des inline styles → identifier les sections par leur contenu/structure
- Ajouter `className="hidden md:block"` sur le wrapper des sections à masquer
- Les inline styles CSS peuvent coexister avec les classes Tailwind responsive

**Dépendances :** Aucune

**Fichiers :**
- `frontend/src/app/(public)/page.tsx`

---

#### STORY-RES-04 : Landing — hero section responsive

**Epic :** EPIC-R02
**Priorité :** Must Have
**Points :** 3
**Sprint :** 23

**User Story :**
En tant que visiteur sur iPhone,
Je veux que la section hero de la landing soit lisible et sans débordement,
Afin de comprendre immédiatement l'identité de l'association.

**Critères d'acceptation :**
- [ ] Le texte hero est lisible sur iPhone 375px (font-size adapté, pas de troncature)
- [ ] Les boutons CTA sont en colonne sur mobile (flex-col) et en ligne sur desktop
- [ ] Les éléments décoratifs (blobs, SVG) ne créent pas de scroll horizontal
- [ ] Les boutons ont une hauteur ≥ 44px (touch target)

**Notes techniques :**
- Utiliser `clamp()` ou classes Tailwind (`text-3xl md:text-5xl`) pour les titres
- Boutons : `flex flex-col sm:flex-row gap-3` au lieu du `display: 'flex'` inline
- Éléments déco : `overflow: hidden` sur le conteneur hero, ou `pointer-events: none; max-width: 100vw`

**Dépendances :** Aucune

**Fichiers :**
- `frontend/src/app/(public)/page.tsx`

---

#### STORY-RES-05 : Landing — section stats 2×2 mobile + overflow global

**Epic :** EPIC-R02
**Priorité :** Should Have
**Points :** 3
**Sprint :** 23

**User Story :**
En tant que visiteur sur iPhone,
Je veux voir les statistiques de l'asso en grille lisible,
Afin d'avoir les chiffres clés d'un coup d'oeil sans scroll horizontal.

**Critères d'acceptation :**
- [ ] Section stats : 2 colonnes sur mobile (grille 2×2), 4 colonnes sur desktop
- [ ] Aucun scroll horizontal sur la page landing sur iPhone 375px
- [ ] `overflow-x: hidden` ajouté sur le body/wrapper principal

**Notes techniques :**
- Stats section : passer de `flex` horizontal à `grid grid-cols-2 md:grid-cols-4`
- Ajouter `overflow-x: hidden` sur `<body>` dans `globals.css` ou sur le wrapper de `PublicLayout`
- Vérifier tous les éléments de la page avec Chrome DevTools pour détecter les overflow résiduels

**Dépendances :** STORY-RES-04 (même fichier)

**Fichiers :**
- `frontend/src/app/(public)/page.tsx`
- `frontend/src/app/(public)/layout.tsx` _(overflow-x: hidden)_
- `frontend/src/app/globals.css` _(optionnel)_

---

### EPIC-R03 — Page Activités et Blog Responsives

---

#### STORY-RES-06 : Page Activités — hero card + carousel horizontal mobile

**Epic :** EPIC-R03
**Priorité :** Must Have
**Points :** 8
**Sprint :** 24

**User Story :**
En tant que visiteur sur iPhone,
Je veux voir la prochaine sortie mise en avant et les autres en carousel,
Afin d'avoir une expérience éditoriale engageante sans grille monotone.

**Critères d'acceptation :**
- [ ] Sur mobile : le premier événement s'affiche en "hero card" pleine largeur avec photo (si disponible), titre, date, et bouton S'inscrire proéminent
- [ ] Les événements suivants s'affichent dans un carousel horizontal avec scroll-snap
- [ ] Le carousel utilise CSS scroll-snap natif (pas de librairie externe)
- [ ] Swipe horizontal fluide sur iOS
- [ ] Sur desktop : la liste verticale actuelle est inchangée
- [ ] Si 0 ou 1 événement : pas de carousel (affichage normal)

**Notes techniques :**
- Sur mobile, conditionner le rendu : `const [heroEvent, ...carouselEvents] = events`
- Hero card : `w-full`, hauteur minimale `min-h-[280px]`, fond dégradé/rouge avec date en grand
- Carousel container : `flex overflow-x-auto scroll-snap-type-x-mandatory gap-4 pb-2`
  - En Tailwind v4 : `flex overflow-x-auto snap-x snap-mandatory`
- Carousel items : `flex-shrink-0 w-[85vw] snap-start` (légèrement débordant pour signaler le scroll)
- Masquer la scrollbar : `-webkit-scrollbar { display: none }` ou `scrollbar-width: none`
- Wrapper mobile/desktop : conditionné par `@media` ou Tailwind hidden/block

**Dépendances :** STORY-RES-02 (dashboard drawer, indépendant de cette story)

**Fichiers :**
- `frontend/src/components/features/events/ActivitesPage.tsx`

---

#### STORY-RES-07 : Page Activités — grille "Nos dernières sorties" 2 cols + lazy mobile

**Epic :** EPIC-R03
**Priorité :** Must Have
**Points :** 2
**Sprint :** 24

**User Story :**
En tant que visiteur sur iPhone,
Je veux voir les dernières sorties sans me noyer dans 12 items identiques,
Afin de parcourir la galerie de façon progressive.

**Critères d'acceptation :**
- [ ] Sur mobile : max 2 colonnes dans la grille
- [ ] 4 items affichés par défaut sur mobile
- [ ] Bouton "Voir plus (X restants)" pour révéler les items suivants
- [ ] Sur desktop : la grille 3 colonnes actuelle est inchangée

**Notes techniques :**
- Ajouter `showAll` state (useState(false)) dans `ActivitesPage.tsx`
- `const visibleItems = isMobile && !showAll ? items.slice(0, 4) : items`
- Pour détecter mobile dans le composant client : `useMediaQuery` hook ou CSS responsive (préférer CSS)
- Approche CSS préférée : afficher tous les items mais masquer les suivants sur mobile avec `hidden md:block` via un wrapper conditionnel
- Grille : `gridTemplateColumns: 'repeat(2, 1fr)'` sur mobile via media query inline existante (déjà `repeat(2, 1fr)` à < 700px)

**Dépendances :** STORY-RES-06 (même fichier)

**Fichiers :**
- `frontend/src/components/features/events/ActivitesPage.tsx`

---

#### STORY-RES-08 : Blog public — 1 colonne mobile + 2 colonnes tablette

**Epic :** EPIC-R03
**Priorité :** Must Have
**Points :** 3
**Sprint :** 25

**User Story :**
En tant que visiteur sur iPhone,
Je veux lire les articles du blog en colonne unique avec des images lisibles,
Afin d'avoir une bonne expérience de lecture sur mobile.

**Critères d'acceptation :**
- [ ] 1 colonne sur < 768px (mobile)
- [ ] 2 colonnes sur 768px–1023px (tablette)
- [ ] 3 colonnes maintenues sur ≥ 1024px (desktop)
- [ ] Images des articles : responsive, aspect-ratio préservé, no overflow
- [ ] Font-size du contenu : ≥ 15px sur mobile

**Notes techniques :**
- `PublicBlogPage.tsx` : changer le grid de `sm:grid-cols-3` en `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `PostCard.tsx` : vérifier que `h-48 w-full` sur l'image est bien responsive (doit l'être)
- Font adjustments : `text-sm md:text-base` sur les textes de body de card

**Dépendances :** Aucune

**Fichiers :**
- `frontend/src/components/features/blog/PublicBlogPage.tsx`
- `frontend/src/components/features/blog/PostCard.tsx`

---

### EPIC-R04 — Dashboard Pages Intérieures Responsives

---

#### STORY-RES-09 : Dashboard — page principale layout mobile

**Epic :** EPIC-R04
**Priorité :** Must Have
**Points :** 2
**Sprint :** 22

**User Story :**
En tant que membre sur mobile,
Je veux accéder au tableau de bord principal avec un layout adapté,
Afin de voir mes événements et actions rapides sans scroll horizontal ni layout cassé.

**Critères d'acceptation :**
- [ ] Quick actions : 2 colonnes sur mobile (déjà `grid-cols-2` ✓ — vérifier et ajuster si besoin)
- [ ] Sections événements + sessions : 1 colonne sur mobile (le `lg:grid-cols-2` actuel gère déjà ça ✓)
- [ ] Blog cards : 1 colonne sur mobile (changer `sm:grid-cols-3` en `grid-cols-1 sm:grid-cols-3`)
- [ ] Aucun overflow horizontal sur la page
- [ ] Padding top approprié pour le header mobile (ne pas être caché sous le header fixe)

**Notes techniques :**
- Vérifier `pb-24 lg:pb-8` (actuel) → supprimer le `pb-24` puisque la bottom nav est supprimée par STORY-RES-02, remplacer par `pt-14 lg:pt-0` (padding top pour le header mobile)
- Le `main` du dashboard layout n'a pas de padding top actuellement — le ajouter pour mobile
- Blog section grid : `grid gap-4 sm:grid-cols-3` → `grid gap-4 grid-cols-1 sm:grid-cols-3`

**Dépendances :** STORY-RES-02 (dashboard layout, à faire en même sprint)

**Fichiers :**
- `frontend/src/app/(dashboard)/tableau-de-bord/page.tsx`

---

#### STORY-RES-10 : Dashboard pages intérieures — overflow + formulaires mobile

**Epic :** EPIC-R04
**Priorité :** Should Have
**Points :** 5
**Sprint :** 23

**User Story :**
En tant que membre sur mobile,
Je veux utiliser les pages Événements, Sessions, Profil et Classement sans scroll horizontal ni formulaires cassés,
Afin de gérer l'application depuis mon téléphone.

**Critères d'acceptation :**
- [ ] Page Événements : liste des events scrollable, pas d'overflow horizontal
- [ ] Page Sessions : grille sessions adapte (1 col mobile, 2 cols tablette)
- [ ] Page Profil : formulaire pleine largeur, champs empilés, bouton submit ≥ 44px
- [ ] Page Classement : tableau scrollable horizontalement si nécessaire (`overflow-x: auto`)
- [ ] Pages admin (tablette) : lisibles à ≥ 768px, pas de coupure de contenu

**Notes techniques :**
- `SessionsPage.tsx` : déjà `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` → vérifier que ça tient sur 375px
- `LeaderboardPage.tsx` : vérifier `grid-cols-12`, probablement besoin d'un wrapper `overflow-x: auto` sur le tableau
- `ProfilePage.tsx` : vérifier les inputs et leur width sur mobile
- Approche systématique : ouvrir chaque page dans Chrome DevTools iPhone SE et noter les overflows

**Dépendances :** STORY-RES-02 (dashboard drawer doit être en place)

**Fichiers :**
- `frontend/src/app/(dashboard)/tableau-de-bord/evenements/`
- `frontend/src/components/features/sessions/SessionsPage.tsx`
- `frontend/src/components/features/profile/ProfilePage.tsx`
- `frontend/src/components/features/leaderboard/LeaderboardPage.tsx`

---

### EPIC-R05 — Pages Auth Responsives

---

#### STORY-RES-11 : Pages connexion et inscription responsive

**Epic :** EPIC-R05
**Priorité :** Must Have
**Points :** 2
**Sprint :** 21

**User Story :**
En tant que visiteur sur iPhone,
Je veux me connecter ou m'inscrire sans formulaire cassé,
Afin de rejoindre l'application depuis mon téléphone.

**Critères d'acceptation :**
- [ ] Formulaire centré en pleine largeur sur mobile (max-w-full sur input)
- [ ] Bouton submit ≥ 44px de hauteur
- [ ] Aucun overflow horizontal sur les pages auth
- [ ] Le clavier virtuel iOS ne masque pas le bouton submit

**Notes techniques :**
- Vérifier `frontend/src/app/(auth)/connexion/page.tsx` et la page d'inscription
- Les formulaires utilisent probablement des `input` avec `.auth-input` (défini dans globals.css) — vérifier le width sur mobile
- `max-width` du wrapper : s'assurer qu'il est < 100vw avec padding horizontal

**Dépendances :** Aucune

**Fichiers :**
- `frontend/src/app/(auth)/` (connexion, inscription)

---

## Allocation par Sprint

### Sprint 21 (Semaine du ~2026-04-14) — 9 pts / 10-11 cap

**Objectif :** Navigation publique mobile fonctionnelle + Landing allégée

**Stories :**

| Story | Titre | Points | Priorité |
|---|---|---|---|
| STORY-RES-01 | Navbar publique hamburger menu | 5 | Must Have |
| STORY-RES-03 | Landing — masquer valeurs + CTA secondaire | 2 | Must Have |
| STORY-RES-11 | Pages connexion/inscription responsive | 2 | Must Have |

**Total :** 9 pts (82% capacité)

**Résultat livrable :** Un visiteur peut naviguer sur le site public depuis un iPhone sans overflow. La landing est moins longue sur mobile.

**Risques :** `layout.tsx` public est Server Component → besoin d'un composant client séparé pour le state du drawer.

---

### Sprint 22 (Semaine du ~2026-04-21) — 10 pts / 10-11 cap

**Objectif :** Dashboard entièrement accessible sur mobile (tous les liens disponibles)

**Stories :**

| Story | Titre | Points | Priorité |
|---|---|---|---|
| STORY-RES-02 | Dashboard sidebar collapsible drawer | 8 | Must Have |
| STORY-RES-09 | Dashboard page principale layout mobile | 2 | Must Have |

**Total :** 10 pts (91% capacité)

**Résultat livrable :** Un membre peut utiliser tout le dashboard depuis son iPhone, y compris les liens admin.

**Risques :** STORY-RES-02 est la plus complexe du sprint (8 pts). Si elle dépasse, STORY-RES-09 peut glisser en Sprint 23 (elle est légère et indépendante).

---

### Sprint 23 (Semaine du ~2026-04-28) — 11 pts / 10-11 cap

**Objectif :** Landing page complètement responsive + Dashboard intérieur fonctionnel

**Stories :**

| Story | Titre | Points | Priorité |
|---|---|---|---|
| STORY-RES-04 | Landing — hero section responsive | 3 | Must Have |
| STORY-RES-05 | Landing — stats 2×2 + overflow global | 3 | Should Have |
| STORY-RES-10 | Dashboard pages intérieures overflow + forms | 5 | Should Have |

**Total :** 11 pts (100% capacité — tenir avec rigueur)

**Résultat livrable :** La landing page est entièrement responsive. Les pages dashboard (sessions, profil, classement) sont utilisables sur mobile.

**Risques :** Sprint chargé. Si STORY-RES-10 prend plus de temps, STORY-RES-05 peut être décalée en Sprint 25.

---

### Sprint 24 (Semaine du ~2026-05-05) — 10 pts / 10-11 cap

**Objectif :** Page Activités avec design éditorial mobile (hero + carousel)

**Stories :**

| Story | Titre | Points | Priorité |
|---|---|---|---|
| STORY-RES-06 | Activités — hero card + carousel | 8 | Must Have |
| STORY-RES-07 | Activités — grille sorties 2 cols + lazy | 2 | Must Have |

**Total :** 10 pts (91% capacité)

**Résultat livrable :** La page Activités a un design éditorial mobile engageant — plus de grille de 12 cards identiques.

**Risques :** STORY-RES-06 est complexe (scroll-snap carousel custom). Prévoir de tester sur Chrome DevTools iOS spécifiquement pour le comportement touch.

---

### Sprint 25 (Semaine du ~2026-05-12) — 3 pts + QA

**Objectif :** Blog responsive + révision finale cross-pages

**Stories :**

| Story | Titre | Points | Priorité |
|---|---|---|---|
| STORY-RES-08 | Blog — 1 col mobile + 2 cols tablette | 3 | Must Have |
| _Buffer QA_ | Révision globale, fixes cross-pages | ~3-5 pts implicites | — |

**Total committé :** 3 pts (27% capacité — volontairement léger pour absorber les corrections)

**Résultat livrable :** Blog responsive + correction de tous les bugs découverts durant les 4 premiers sprints. Sprint de QA/polish.

---

## Traceability

### Epic → Stories

| Epic | Stories | Points | Sprints |
|---|---|---|---|
| EPIC-R01 Navigation | RES-01, RES-02 | 13 pts | 21, 22 |
| EPIC-R02 Landing | RES-03, RES-04, RES-05 | 8 pts | 21, 23 |
| EPIC-R03 Activités + Blog | RES-06, RES-07, RES-08 | 13 pts | 24, 25 |
| EPIC-R04 Dashboard | RES-09, RES-10 | 7 pts | 22, 23 |
| EPIC-R05 Auth | RES-11 | 2 pts | 21 |

### FR → Stories

| FR | Description | Story | Sprint |
|---|---|---|---|
| FR-RN01 | Hamburger navbar publique | RES-01 | 21 |
| FR-RN02 | Dashboard drawer mobile | RES-02 | 22 |
| FR-RL01 | Masquer valeurs mobile | RES-03 | 21 |
| FR-RL02 | Supprimer CTA secondaire mobile | RES-03 | 21 |
| FR-RL03 | Hero section responsive | RES-04 | 23 |
| FR-RL04 | Stats 2×2 mobile | RES-05 | 23 |
| FR-RA01 | Activités hero + carousel | RES-06 | 24 |
| FR-RA02 | Grille sorties 2 cols + lazy | RES-07 | 24 |
| FR-RA03 | Activités layout tablette | RES-06/07 | 24 |
| FR-RB01 | Blog 1 col mobile | RES-08 | 25 |
| FR-RB02 | Blog 2 cols tablette | RES-08 | 25 |
| FR-RD01 | Dashboard principal mobile | RES-09 | 22 |
| FR-RD02 | Dashboard intérieur overflow | RES-10 | 23 |
| FR-RT01 | Auth responsive | RES-11 | 21 |

---

## Risques et Mitigation

**Élevé :**
- `layout.tsx` public est Server Component → il faut créer un composant client pour le hamburger. Mitigation : créer `MobileNavMenu.tsx` comme composant client isolé.

**Moyen :**
- STORY-RES-06 (carousel) : comportement touch iOS parfois imprévisible avec scroll-snap. Mitigation : tester tôt dans le sprint sur Chrome DevTools iPhone.
- Sprint 23 chargé (11 pts). Mitigation : STORY-RES-05 peut glisser en Sprint 25 si besoin.

**Faible :**
- `ActivitesPage.tsx` est un gros fichier avec beaucoup de logique inline. Risque de casser accidentellement d'autres sections. Mitigation : tester toute la page après chaque modification.

---

## Definition of Done

Pour qu'une story soit considérée terminée :
- [ ] Code implémenté et committé sur la branche feature
- [ ] Testé sur Chrome DevTools : iPhone SE (375px), iPhone 14 (390px), iPad (768px)
- [ ] Aucun scroll horizontal sur les pages modifiées
- [ ] Aucune régression desktop (≥ 1024px)
- [ ] PR créée vers `dev` (jamais directement vers `main`)
- [ ] Critères d'acceptation validés

---

## Prochaines étapes

**Immédiat :** Démarrer Sprint 21

1. `/dev-story STORY-RES-01` — Navbar hamburger (story la plus bloquante, prérequis UX)
2. `/dev-story STORY-RES-03` — Masquer valeurs + CTA landing
3. `/dev-story STORY-RES-11` — Pages auth responsive

**Cadence des sprints :**
- Durée : 1 semaine
- Démarrage : lundi
- Revue : vendredi
- Livraison finale estimée : Sprint 25 (~2026-05-17)

---

*Sprint plan créé avec BMAD Method v6 — Phase 4 (Implementation Planning)*
*Pour démarrer : `/dev-story STORY-RES-01`*
