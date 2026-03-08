# Sprint Plan — Refonte Graphique & Pages Publiques

**Date :** 2026-03-08
**Scrum Master :** BMAD v6
**Projet :** saFoulee — Level 2
**Epic :** EPIC-006 — Refonte Graphique & Expérience Publique
**Total stories :** 11
**Total points :** 28
**Sprints planifiés :** 3 (Sprints 6, 7, 8)
**Capacité :** 10 pts/sprint (1 dev, 1 semaine, 4h/jour)

---

## Contexte & Objectifs

L'application est fonctionnelle mais souffre d'une **incohérence visuelle** entre la landing page (palette chaude crème/forêt/terra) et le dashboard (palette froide zinc/rouge). L'expérience utilisateur est jugée "froide" et peu attrayante.

Cette refonte vise à :
1. **Unifier la palette** landing ↔ dashboard (cream `#F4EFE6`, forest `#1E3A14`, terra `#D05918`)
2. **Enrichir la landing page** avec du contenu vivant (événements, inscription, témoignages)
3. **Créer une page publique `/activites`** qui présente l'association comme un service convivial
4. **Rendre le dashboard chaleureux** — fond crème, accents chauds, micro-textes humains

---

## Palette de référence

| Token | Couleur | Usage |
|-------|---------|-------|
| `--cream` | `#F4EFE6` | Fond principal pages |
| `--cream-dark` | `#EAE3D5` | Sections alternées |
| `--forest` | `#1E3A14` | Couleur principale (sidebar, titres, CTA) |
| `--forest-light` | `#3A6B2A` | Accents, labels |
| `--terra` | `#D05918` | CTA primaire, active states, highlight |
| `--sage` | `#7A9E6E` | Accents secondaires, badges |
| `--bark` | `#2E1A0E` | Texte foncé |

---

## Inventory Stories

---

### STORY-GFX-01 : CSS design tokens & fond crème dashboard

**Epic :** EPIC-006
**Points :** 2
**Priorité :** Must Have
**Sprint :** 6

**User Story :**
En tant que développeur, je veux définir les variables CSS de la palette unifiée et les appliquer au fond des pages dashboard, afin que toutes les pages suivantes héritent automatiquement du bon fond.

**Acceptance Criteria :**
- [ ] Variables CSS définies dans le globals.css ou équivalent Tailwind config
- [ ] Fond des pages dashboard : `#F9F6F1` (crème légère, lisible)
- [ ] Cards restent blanches mais ombres réchauffées (plus de zinc-100, plutôt `rgba(30,58,20,0.06)`)
- [ ] Aucun rouge `#FF383E` dans les fichiers de config globaux (gardé uniquement si besoin back-compat)

**Notes techniques :**
- Modifier `tailwind.config.ts` pour exposer les tokens
- Modifier `globals.css` pour les variables CSS
- Le sidebar forest-green est déjà fait (Sprint 5/6)

---

### STORY-GFX-02 : Landing — "Comment rejoindre" + témoignages

**Epic :** EPIC-006
**Points :** 3
**Priorité :** Must Have
**Sprint :** 6

**User Story :**
En tant que visiteur de la landing page, je veux voir comment m'inscrire au club et lire des retours de membres, afin d'être convaincu de rejoindre sa Foulée.

**Acceptance Criteria :**
- [ ] Section "Comment rejoindre" visible avec 3 étapes claires :
  - Étape 1 : Remplir le formulaire en ligne + documents requis + cotisation
  - Étape 2 : Validation par un admin ou fondateur du club
  - Étape 3 : Accès immédiat aux sorties et événements
- [ ] Section "Ils courent avec nous" : 3 témoignages avec prénom, rôle/ancienneté, citation
- [ ] Icônes SVG (pas d'emojis)
- [ ] Animation scroll-reveal cohérente avec le reste de la landing
- [ ] Bouton CTA "Rejoindre" pointant vers `/inscription`
- [ ] Design cohérent avec la palette crème/forêt/terra

**Notes techniques :**
- Ajouter deux sections dans `/frontend/src/app/(public)/page.tsx`
- Témoignages : données statiques intégrées directement dans le composant
- Utiliser les classes `.sF-reveal`, `.sF-card` déjà définies

---

### STORY-GFX-03 : Landing — Teaser activités (3 prochains événements)

**Epic :** EPIC-006
**Points :** 2
**Priorité :** Must Have
**Sprint :** 6

**User Story :**
En tant que visiteur, je veux voir apercevoir les prochains événements du club depuis la landing page, afin de juger de l'activité de l'association avant de m'inscrire.

**Acceptance Criteria :**
- [ ] Section "Nos prochaines sorties" sur la landing page
- [ ] Fetch des 3 prochains événements via l'API publique `/events?upcoming=true&per_page=3`
- [ ] Chaque événement affiché : titre, date, type, lieu
- [ ] Lien "Voir toutes les activités →" vers `/activites`
- [ ] État de chargement (skeleton ou fade-in)
- [ ] État vide géré proprement si aucun événement
- [ ] Pas d'emojis, icônes SVG uniquement

**Notes techniques :**
- La landing est un Server Component (`revalidate = 300`)
- Fetch côté serveur avec `fetch('/api/events?upcoming=true&per_page=3')`
- Vérifier que l'endpoint events est accessible sans authentification

---

### STORY-GFX-04 : Page publique `/activites` — événements futurs + inscription

**Epic :** EPIC-006
**Points :** 3
**Priorité :** Must Have
**Sprint :** 6

**User Story :**
En tant que visiteur ou membre, je veux voir toutes les activités à venir de l'association sur une page dédiée et pouvoir m'y inscrire, afin de participer à la vie du club.

**Acceptance Criteria :**
- [ ] Page accessible à `/activites` (route publique)
- [ ] Liste de tous les événements futurs (pagination)
- [ ] Card événement : titre, date, type, lieu, capacité (X places restantes)
- [ ] Bouton "Rejoindre" :
  - Si non connecté → redirige vers `/connexion`
  - Si connecté + pas inscrit + places disponibles → inscription directe
  - Si connecté + déjà inscrit → "Inscrit" (readonly)
  - Si complet → "Complet" (disabled)
- [ ] Filtre par type d'événement (course, sortie, compétition, autre)
- [ ] Design friendly "service" — pas de tableau, cards visuelles avec date badge coloré
- [ ] Palette crème/forêt/terra, pas d'emojis

**Notes techniques :**
- Créer `/frontend/src/app/(public)/activites/page.tsx`
- Réutiliser le layout public existant
- Appels API : GET `/events?upcoming=true`, POST `/events/{id}/registrations`
- Le bouton d'inscription nécessite le token auth (client component pour la partie interactive)

---

### STORY-GFX-05 : Page `/activites` — événements passés + galerie photos

**Epic :** EPIC-006
**Points :** 5
**Priorité :** Must Have
**Sprint :** 7

**User Story :**
En tant que membre créateur d'un événement passé, je veux uploader des photos de cet événement. En tant que visiteur, je veux voir les galeries photos des événements passés, afin de découvrir l'ambiance du club.

**Acceptance Criteria :**
- [ ] Section "Nos dernières sorties" sur la page `/activites` (événements passés)
- [ ] Card événement passé : photo de couverture (ou placeholder), titre, date, nb participants
- [ ] Clic sur une card → vue détail avec galerie photos
- [ ] Admin/Fondateur/Créateur de l'événement peut uploader des photos (depuis le dashboard)
- [ ] Backend : endpoint `POST /events/{id}/photos` (upload R2, même pattern que documents)
- [ ] Backend : endpoint `GET /events/{id}/photos`
- [ ] Maximum 20 photos par événement
- [ ] Photos affichées en grille responsive (3 colonnes desktop, 2 tablette, 1 mobile)

**Notes techniques :**
- Migration BDD : table `event_photos` (id, event_id, url, uploaded_by, created_at)
- Laravel controller `EventPhotoController` avec store/index/destroy
- Réutiliser le pattern R2 de `DocumentController`
- Frontend : modal lightbox simple (CSS only ou minimal JS)

**Dépendances :** STORY-GFX-04

---

### STORY-GFX-06 : Dashboard Accueil + Sessions — palette chaude

**Epic :** EPIC-006
**Points :** 3
**Priorité :** Must Have
**Sprint :** 7

**User Story :**
En tant que membre connecté, je veux que l'accueil et la page sessions du dashboard me semblent chaleureux et accueillants, avec une palette cohérente avec la landing page.

**Acceptance Criteria :**
- [ ] `tableau-de-bord/page.tsx` : fond crème `#F9F6F1`, accents terra `#D05918` (plus de rouge `#FF383E`)
- [ ] `SessionsPage.tsx` : même migration de palette
- [ ] Cards : fond blanc, ombres chaudes `rgba(30,58,20,0.07)`, bordures `rgba(30,58,20,0.08)`
- [ ] Boutons primaires : terra `#D05918` avec shadow `rgba(208,89,24,0.3)`
- [ ] Boutons secondaires : forest `#1E3A14` ghost
- [ ] Pas d'emojis dans les sections de contenu (garder icônes SVG)
- [ ] Micro-textes humains : salutation personnalisée, messages d'encouragement

**Notes techniques :**
- Remplacer systématiquement `#FF383E` → `#D05918` et `#7EAA99` → `#7A9E6E` dans ces fichiers
- Section headers : barre décorative forest/terra à la place du rouge/sage

---

### STORY-GFX-07 : EventCard + EventsPage dashboard — palette harmonisée

**Epic :** EPIC-006
**Points :** 2
**Priorité :** Must Have
**Sprint :** 7

**User Story :**
En tant que membre, je veux que la page événements du dashboard utilise la même palette chaude que le reste de l'application.

**Acceptance Criteria :**
- [ ] `EventsPage.tsx` : palette crème/terra/forest
- [ ] `EventCard.tsx` : TYPE_CONFIG adapté à la nouvelle palette (terra pour race, sage pour outing…)
- [ ] Filtres type : pills terra actif, fond crème inactif
- [ ] Bouton "Nouveau" : terra avec shadow
- [ ] Bouton inscription : forest ou terra selon contexte

**Dépendances :** STORY-GFX-01

---

### STORY-GFX-08 : Blog & Classement dashboard — palette harmonisée

**Epic :** EPIC-006
**Points :** 2
**Priorité :** Should Have
**Sprint :** 8

**User Story :**
En tant que membre, je veux que le blog et le classement soient visuellement cohérents avec le reste du dashboard rénové.

**Acceptance Criteria :**
- [ ] `PostsPage.tsx` + `PostCard.tsx` : palette terra/forest, pas de violet/rouge
- [ ] `LeaderboardPage.tsx` : podium et stat cards avec palette chaude
- [ ] Badges de rang : terra pour médailles, forest pour texte
- [ ] Pas d'emojis

---

### STORY-GFX-09 : Profil & Admin — palette harmonisée

**Epic :** EPIC-006
**Points :** 3
**Priorité :** Should Have
**Sprint :** 8

**User Story :**
En tant que membre et administrateur, je veux que les pages profil et administration soient cohérentes avec la nouvelle charte.

**Acceptance Criteria :**
- [ ] `ProfilePage.tsx` : palette crème/terra/forest, progress bar terra/forest
- [ ] Pages admin : palette harmonisée, indicateurs de statut lisibles
- [ ] Avatar ring : gradient forest → terra (à la place du rouge → sage)
- [ ] Boutons save/delete : terra/rouge naturel selon action (pas de rouge vif `#FF383E`)

---

### STORY-GFX-10 : Inputs, buttons, forms — composants unifiés

**Epic :** EPIC-006
**Points :** 2
**Priorité :** Should Have
**Sprint :** 8

**User Story :**
En tant qu'utilisateur, je veux que tous les formulaires et boutons de l'application aient un style cohérent et chaleureux.

**Acceptance Criteria :**
- [ ] Inputs : focus ring terra `rgba(208,89,24,0.2)`, bordure forest au focus
- [ ] Boutons primaires : terra `#D05918` partout (formulaires inscription, login, etc.)
- [ ] Pages auth (`/connexion`, `/inscription`) : fond crème, pas de blanc pur
- [ ] Boutons destructifs : rouge naturel `#c0392b` (pas de brand red)
- [ ] Checkboxes : `accent-color: #D05918`

---

### STORY-GFX-11 : Empty states, loaders, micro-textes humains

**Epic :** EPIC-006
**Points :** 1
**Priorité :** Could Have
**Sprint :** 8

**User Story :**
En tant qu'utilisateur, je veux que les états vides et les chargements soient accueillants et donnent envie d'agir.

**Acceptance Criteria :**
- [ ] Spinners : couleur terra `#D05918` (actuellement rouge `#FF383E`)
- [ ] Empty states : icône SVG simple + texte d'encouragement + CTA
- [ ] Pas d'emojis dans les empty states (icônes SVG uniquement)
- [ ] Micro-textes chaleureux (ex: "Aucune sortie pour l'instant — soyez le premier à en créer une !")

---

## Allocation par sprint

### Sprint 6 — Landing enrichie + Page activités future
**Dates :** 2026-03-09 → 2026-03-15
**Capacité :** 10 pts
**Engagé :** 10 pts

| Story | Points | Statut |
|-------|--------|--------|
| STORY-GFX-01 : CSS tokens + fond crème | 2 | not_started |
| STORY-GFX-02 : Landing — rejoindre + témoignages | 3 | not_started |
| STORY-GFX-03 : Landing — teaser activités | 2 | not_started |
| STORY-GFX-04 : Page /activites futurs + inscription | 3 | not_started |

**Goal :** Visiteurs et prospects découvrent une landing complète et engageante ; la page /activites permet de voir et rejoindre les prochains événements.

---

### Sprint 7 — Galerie photos + Dashboard warm
**Dates :** 2026-03-16 → 2026-03-22
**Capacité :** 10 pts
**Engagé :** 10 pts

| Story | Points | Statut |
|-------|--------|--------|
| STORY-GFX-05 : /activites passés + photos | 5 | not_started |
| STORY-GFX-06 : Dashboard Accueil + Sessions | 3 | not_started |
| STORY-GFX-07 : EventCard + EventsPage | 2 | not_started |

**Goal :** La page /activites est complète (futur + passé + galeries). Les premières pages dashboard adoptent la palette chaude.

---

### Sprint 8 — Polish dashboard complet
**Dates :** 2026-03-23 → 2026-03-29
**Capacité :** 10 pts
**Engagé :** 8 pts (buffer 2pts)

| Story | Points | Statut |
|-------|--------|--------|
| STORY-GFX-08 : Blog & Classement | 2 | not_started |
| STORY-GFX-09 : Profil & Admin | 3 | not_started |
| STORY-GFX-10 : Inputs, buttons, forms | 2 | not_started |
| STORY-GFX-11 : Empty states + micro-textes | 1 | not_started |

**Goal :** 100% des pages dashboard en palette crème/forêt/terra. Expérience utilisateur cohérente de A à Z.

---

## Traceability

| Epic | Stories | Points | Sprints |
|------|---------|--------|---------|
| EPIC-006 | GFX-01 à GFX-11 | 28 pts | 6, 7, 8 |

---

## Risques

**Moyen** — GFX-05 (photos événements) implique une migration BDD et un nouveau controller. Risque de dépassement du sprint 7.
**Mitigation :** Si nécessaire, déplacer GFX-05 en Sprint 8 et avancer GFX-06/07.

**Faible** — Cohérence palette sur toutes les pages (beaucoup de fichiers à toucher).
**Mitigation :** GFX-01 (tokens CSS) doit être fait en premier pour simplifier tous les suivants.

---

## Next Steps

Sprint 6 démarre avec `/bmad:dev-story STORY-GFX-01` ou directement l'implémentation des 4 stories dans l'ordre.

---

*BMAD Method v6 — Phase 4 Implementation Planning*
