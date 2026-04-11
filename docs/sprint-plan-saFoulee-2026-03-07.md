# Sprint Plan: saFoulee

**Date:** 2026-03-07
**Scrum Master:** julesbourin
**Project Level:** 2
**Total Stories:** 17
**Total Points:** 52
**Planned Sprints:** 4 (+ 1 buffer)
**Sprint Length:** 1 semaine
**Capacité par sprint:** 10 points (1 dev × 5 jours × 4h/jour ÷ 2h/point)
**Lancement cible:** Début avril 2026

---

## Executive Summary

Le plan de sprint couvre les 4 epics de saFoulee sur 4 semaines. Sprint 1 pose les fondations (infrastructure, auth, rôles). Sprint 2 complète la gestion des membres et documents. Sprint 3 livre les événements, sessions et blog. Sprint 4 finalise la communauté (chat, notifications, leaderboard). L'intégration Strava est planifiée en sprint 4 mais conditionnelle (selon disponibilité API free tier).

**Note importante :** 52 points pour 40 points de capacité → un léger dépassement est attendu. Les stories Could Have (Strava) passent en post-lancement si nécessaire.

**Métriques clés :**

- Total Stories : 17
- Total Points : 52
- Sprints : 4
- Capacité totale : 40 points
- Lancement cible : 07/04/2026

---

## Story Inventory

### INFRASTRUCTURE

---

### STORY-000: Setup du projet

**Epic:** Infrastructure
**Priority:** Must Have

**User Story:**
En tant que **développeur**,
je veux avoir un projet Next.js + Laravel correctement configuré avec CI/CD,
afin de pouvoir développer et déployer de manière fiable dès le premier jour.

**Acceptance Criteria:**

- [ ] Repo GitHub créé avec structure monorepo ou repos séparés (frontend/backend)
- [ ] Next.js 14 initialisé (TypeScript, App Router, Tailwind CSS, Motion.dev)
- [ ] Laravel 11 initialisé (PHP 8.2, Sanctum, Spatie Permission, Laravel Media Library)
- [ ] Variables d'environnement documentées (.env.example frontend et backend)
- [ ] ESLint + Prettier configurés (frontend), PHP-CS-Fixer configuré (backend)
- [ ] Vercel connecté au repo GitHub (auto-deploy sur push main)
- [ ] GitHub Actions configuré : lint + tests + deploy backend via SSH
- [ ] README complet (setup local, architecture, conventions)

**Technical Notes:**
Stack: Next.js 14 (App Router) + Laravel 11 + MySQL. Référencer l'architecture doc.

**Estimation:** 2 points
**Dependencies:** Aucune

---

### STORY-001: Schéma base de données & migrations

**Epic:** Infrastructure
**Priority:** Must Have

**User Story:**
En tant que **développeur**,
je veux avoir toutes les migrations Laravel définies,
afin que la structure de données soit prête avant le développement des fonctionnalités.

**Acceptance Criteria:**

- [ ] Migrations créées pour toutes les tables : users, user_documents, events, event_registrations, training_sessions, session_participations, posts, comments, performances, chat_messages, notifications, notification_preferences
- [ ] Indexes créés sur les colonnes fréquemment filtrées (voir architecture doc)
- [ ] Seeders pour les données de test (1 admin, 5 membres, rôles)
- [ ] `php artisan migrate:fresh --seed` fonctionne sans erreur

**Technical Notes:**
Utiliser le schéma exact défini dans `docs/architecture-saFoulee-2026-03-07.md` section Data Model.

**Estimation:** 2 points
**Dependencies:** STORY-000

---

### EPIC-001 — Gestion des membres & administration

---

### STORY-002: Inscription membre

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
En tant que **visiteur**,
je veux pouvoir m'inscrire sur saFoulee,
afin de rejoindre l'association et accéder à l'espace membre.

**Acceptance Criteria:**

- [ ] Formulaire d'inscription : prénom, nom, email, mot de passe (confirmation)
- [ ] Validation côté client (react-hook-form + zod) et côté serveur (Laravel FormRequest)
- [ ] Email de confirmation envoyé via Resend (vérification optionnelle v1)
- [ ] Rôle `member` assigné automatiquement à l'inscription
- [ ] Redirection vers le dashboard après inscription réussie
- [ ] Messages d'erreur clairs (email déjà utilisé, mot de passe trop court, etc.)
- [ ] Accessible et utilisable sur mobile (iOS Safari, Android Chrome)
- [ ] Flux complet terminé en < 5 minutes (inscription + profil de base)

**Technical Notes:**
POST /api/v1/auth/register → Sanctum token → cookie httpOnly. Composant Next.js dans `(auth)/register/`.

**Estimation:** 3 points
**Dependencies:** STORY-001

---

### STORY-003: Authentification (login, logout, reset password)

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
En tant que **membre**,
je veux pouvoir me connecter, me déconnecter et réinitialiser mon mot de passe,
afin d'accéder à mon compte en toute sécurité.

**Acceptance Criteria:**

- [ ] Formulaire de connexion (email + mot de passe)
- [ ] Token Sanctum stocké en cookie httpOnly après login
- [ ] Déconnexion révoque le token en BDD
- [ ] "Mot de passe oublié" → email avec lien de reset (60 min, via Resend)
- [ ] Middleware de protection des routes dashboard (`auth:sanctum`)
- [ ] Redirection automatique si non connecté
- [ ] Rate limiting sur les tentatives de connexion (5/minute)

**Technical Notes:**
POST /auth/login, POST /auth/logout, POST /auth/forgot-password, POST /auth/reset-password.

**Estimation:** 3 points
**Dependencies:** STORY-002

---

### STORY-004: Système de rôles & permissions (RBAC)

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
En tant qu'**Admin**,
je veux pouvoir assigner des rôles aux membres,
afin de contrôler qui peut créer des événements, sessions et posts.

**Acceptance Criteria:**

- [ ] 5 rôles configurés via Spatie Permission : admin, founder, coach, bureau, member
- [ ] Laravel Policies créées pour chaque ressource (EventPolicy, PostPolicy, SessionPolicy, DocumentPolicy)
- [ ] Middleware `role:` et `permission:` appliqués sur les routes API
- [ ] Interface admin pour modifier le rôle d'un membre
- [ ] Matrice de permissions respectée (voir architecture doc)
- [ ] Réponse 403 JSON formatée pour les accès non autorisés

**Technical Notes:**
Utiliser `spatie/laravel-permission`. Policies enregistrées dans AuthServiceProvider.

**Estimation:** 3 points
**Dependencies:** STORY-003

---

### STORY-005: Profil membre & gestion des documents

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
En tant que **membre**,
je veux uploader mes documents obligatoires et voir l'état de mon dossier,
afin de valider mon adhésion à l'association.

**Acceptance Criteria:**

- [ ] Page profil : modifier nom, prénom, photo (upload vers R2), bio
- [ ] Section "Mon dossier" : upload licence, fiche d'adhésion, certificat médical (PDF/JPG/PNG, max 10 MB)
- [ ] Indicateur de complétude du dossier (0/3, 1/3, 2/3, 3/3 documents)
- [ ] Documents accessibles uniquement via URLs signées R2 (15 min)
- [ ] Suppression de document avec double confirmation
- [ ] Documents visibles uniquement par le membre concerné et les Admins

**Technical Notes:**
Cloudflare R2 via SDK S3-compatible. `spatie/laravel-media-library` pour la gestion des fichiers. GET /documents/{id}/download → temporaryUrl(15min).

**Estimation:** 5 points
**Dependencies:** STORY-004

---

### STORY-006: Tableau de bord Admin

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
En tant qu'**Admin**,
je veux avoir une vue d'ensemble des membres et de leurs dossiers,
afin de gérer l'association efficacement.

**Acceptance Criteria:**

- [ ] Liste des membres avec statut de dossier (complet/incomplet) et rôle
- [ ] Filtres : par rôle, par statut de dossier
- [ ] Action : modifier le rôle d'un membre
- [ ] Action : suspendre/supprimer un compte
- [ ] Export CSV de la liste des membres
- [ ] Statistiques basiques : nombre de membres, % dossiers complets, événements créés
- [ ] Accessible uniquement aux rôles admin et founder

**Technical Notes:**
GET /api/v1/users (admin), GET /api/v1/users/export (CSV via StreamedResponse Laravel).

**Estimation:** 3 points
**Dependencies:** STORY-005

---

### EPIC-002 — Événements & sessions d'entraînement

---

### STORY-007: Gestion des événements

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
En tant que **Membre du bureau**,
je veux créer, modifier et supprimer des événements,
afin d'organiser les activités de l'association.

**Acceptance Criteria:**

- [ ] Formulaire de création d'événement : titre, description, type (course/sortie/compétition/autre), date, heure, lieu
- [ ] Publication immédiate ou planifiée
- [ ] Modification et suppression par le créateur ou Admin
- [ ] Notification aux membres inscrits en cas de modification ou annulation
- [ ] Vue liste des événements (admin)
- [ ] CRUD API complet (POST/GET/PATCH/DELETE /api/v1/events)

**Technical Notes:**
Accessible aux rôles admin, founder, coach, bureau. Notification async via Job Laravel + Resend.

**Estimation:** 3 points
**Dependencies:** STORY-004

---

### STORY-008: Calendrier événements & inscriptions

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
En tant que **membre**,
je veux voir le calendrier des événements et m'y inscrire,
afin de participer aux activités de l'association.

**Acceptance Criteria:**

- [ ] Calendrier mensuel des événements (vue liste + vue calendrier)
- [ ] Détail d'un événement : infos complètes, liste des inscrits (count)
- [ ] Bouton "S'inscrire" / "Se désinscrire"
- [ ] Confirmation de l'inscription (toast notification)
- [ ] Calendrier public (événements visibles sans connexion)
- [ ] Détails des inscrits visibles uniquement par les membres connectés

**Technical Notes:**
Composant calendrier Next.js (react-calendar ou custom). POST /events/{id}/register, DELETE /events/{id}/register.

**Estimation:** 3 points
**Dependencies:** STORY-007

---

### STORY-009: Création assistée de sessions d'entraînement

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
En tant qu'**Entraîneur**,
je veux créer une session d'entraînement guidée avec des exercices structurés,
afin de proposer un programme clair aux membres.

**Acceptance Criteria:**

- [ ] Formulaire guidé multi-étapes : type de session (course/interval/fartlek/récupération/renforcement), distance (km), durée estimée (min), intensité (faible/moyenne/élevée)
- [ ] Section "Exercices" : ajout dynamique d'exercices (nom, répétitions/durée, repos)
- [ ] Description libre (rich text simple)
- [ ] Option "Sauvegarder comme template"
- [ ] Publication de la session (date, heure)
- [ ] Les membres peuvent marquer leur participation

**Technical Notes:**
Exercices stockés en JSON dans la colonne `exercises`. Accessible aux rôles admin, founder, coach.

**Estimation:** 5 points
**Dependencies:** STORY-004

---

### STORY-010: Templates de sessions

**Epic:** EPIC-002
**Priority:** Should Have

**User Story:**
En tant qu'**Entraîneur**,
je veux réutiliser des templates de sessions,
afin de créer rapidement des entraînements récurrents.

**Acceptance Criteria:**

- [ ] Liste des templates créés (personnels + partagés)
- [ ] Créer une session à partir d'un template (pré-remplit le formulaire)
- [ ] Modifier et supprimer un template
- [ ] Templates filtrables par type de session

**Technical Notes:**
Colonne `is_template` boolean sur `training_sessions`. GET /api/v1/sessions/templates.

**Estimation:** 2 points
**Dependencies:** STORY-009

---

### EPIC-003 — Communauté & communication

---

### STORY-011: Page publique de l'association

**Epic:** EPIC-003
**Priority:** Must Have

**User Story:**
En tant que **visiteur**,
je veux voir la page de présentation de l'association,
afin de découvrir "sa Foulée" et décider de la rejoindre.

**Acceptance Criteria:**

- [ ] Page d'accueil publique : logo, nom, description, couleurs (#FF383E, #7EAA99)
- [ ] Aperçu des derniers posts du blog (3 articles)
- [ ] Aperçu des prochains événements (3 événements)
- [ ] Bouton "Rejoindre l'association" → redirection inscription
- [ ] Page statique (SSG Next.js) pour performance maximale
- [ ] Aucune donnée personnelle des membres affichée

**Technical Notes:**
Next.js SSG avec `generateStaticParams`. Revalidation toutes les 5 min (ISR).

**Estimation:** 2 points
**Dependencies:** STORY-008, STORY-013

---

### STORY-012: Blog / fil d'actualité

**Epic:** EPIC-003
**Priority:** Must Have

**User Story:**
En tant que **Membre du bureau**,
je veux créer et publier des posts sur le blog de l'association,
afin de partager les actualités avec les membres et le public.

**Acceptance Criteria:**

- [ ] Éditeur de post : titre, contenu riche (bold, italic, listes, liens), image optionnelle
- [ ] Templates de posts prédéfinis : compte-rendu de course, annonce d'événement, résultats
- [ ] Publication immédiate ou planifiée
- [ ] Posts épinglables en haut du fil (Admin uniquement)
- [ ] Fil d'actualité en ordre chronologique inversé (infinitive scroll ou pagination)
- [ ] Commentaires sur les posts (membres connectés)
- [ ] Posts publics (visibles sans connexion, sans données personnelles)

**Technical Notes:**
Rich text : `@tiptap/react` (léger, open source). POST /api/v1/posts, GET /api/v1/posts (public).

**Estimation:** 5 points
**Dependencies:** STORY-004

---

### STORY-013: Chat entre membres

**Epic:** EPIC-003
**Priority:** Should Have

**User Story:**
En tant que **membre**,
je veux envoyer des messages en temps réel dans le chat,
afin de communiquer avec les autres coureurs de l'association.

**Acceptance Criteria:**

- [ ] Canal général accessible à tous les membres
- [ ] Canaux par événement (créés automatiquement à la création d'un événement)
- [ ] Messages affichés en temps réel (WebSocket via Pusher)
- [ ] Historique des messages (50 derniers au chargement)
- [ ] Affichage du nom et avatar de l'expéditeur
- [ ] Indicateur de connexion (online/offline via Pusher Presence)
- [ ] Messages accessibles uniquement aux membres connectés

**Technical Notes:**
`pusher-js` côté client. Broadcasting Laravel → Pusher. Canal : `private-chat.general`, `private-chat.event.{id}`. Auth canal : POST /api/v1/chat/pusher/auth.

**Estimation:** 5 points
**Dependencies:** STORY-004

---

### STORY-014: Système de notifications

**Epic:** EPIC-003
**Priority:** Should Have

**User Story:**
En tant que **membre**,
je veux recevoir des notifications in-app et par email pour les événements importants,
afin de ne rien manquer de la vie de l'association.

**Acceptance Criteria:**

- [ ] Icône cloche dans le header avec compteur de notifications non lues
- [ ] Notifications in-app : nouvel événement, nouveau post, message chat, modification d'événement inscrit
- [ ] Email automatique si document manquant ou expiré dans le dossier
- [ ] Marquer comme lu (unitaire et tout marquer)
- [ ] Page préférences de notification (activer/désactiver par type et canal)

**Technical Notes:**
Laravel Notifications (database + mail). Broadcast in-app via Pusher. Queue jobs pour emails Resend.

**Estimation:** 3 points
**Dependencies:** STORY-013

---

### EPIC-004 — Performances & intégrations

---

### STORY-015: Leaderboard & suivi des performances

**Epic:** EPIC-004
**Priority:** Should Have

**User Story:**
En tant que **membre**,
je veux voir le classement des coureurs et mes propres performances,
afin de me motiver et suivre ma progression.

**Acceptance Criteria:**

- [ ] Leaderboard : classement des membres par distance totale (semaine/mois/saison)
- [ ] Profil performance individuel : historique des sessions, distance totale, évolution
- [ ] Saisie manuelle d'une performance (distance, durée, date)
- [ ] Filtres leaderboard : période, type de performance
- [ ] Visible uniquement par les membres connectés

**Technical Notes:**
GET /api/v1/leaderboard (cache 5 min). POST /api/v1/performances (saisie manuelle). LeaderboardService avec requête MySQL agrégée.

**Estimation:** 3 points
**Dependencies:** STORY-004

---

### STORY-016: Intégration Strava (conditionnel)

**Epic:** EPIC-004
**Priority:** Could Have

**User Story:**
En tant que **membre**,
je veux connecter mon compte Strava,
afin que mes activités sportives soient automatiquement importées dans saFoulee.

**Acceptance Criteria:**

- [ ] Bouton "Connecter Strava" dans le profil → OAuth2 Strava
- [ ] Synchronisation automatique des activités de course (distance, durée, date)
- [ ] Webhook Strava pour les nouvelles activités en temps réel
- [ ] Déconnexion Strava (révocation tokens)
- [ ] Saisie manuelle maintenue comme fallback
- [ ] Implémenté uniquement si API Strava gratuite pour le volume prévu

**Technical Notes:**
Strava OAuth2 + webhook. Tokens chiffrés (`encrypted` cast). StravaService avec refresh automatique. Conditionnel : vérifier les limites API (15 req/15min, 100/jour) avant implémentation.

**Estimation:** 5 points
**Dependencies:** STORY-015

---

## Sprint Allocation

**Capacity:** 10 points/sprint | **Sprint length:** 1 semaine

---

### Sprint 1 — Semaine du 09/03/2026 — 9/10 points

**Goal:** Fondations solides — projet configuré, base de données prête, membres peuvent s'inscrire et se connecter

**Stories:**
| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-000 | Setup du projet | 2 | Must Have |
| STORY-001 | Schéma BDD & migrations | 2 | Must Have |
| STORY-002 | Inscription membre | 3 | Must Have |
| STORY-003 | Authentification | 3 | Must Have |

**Total:** 10 points / 10 capacité _(100% — sprint dense, infrastructure critique)_

**Risques:**

- Setup CI/CD peut prendre plus de temps que prévu → commencer par l'essentiel (repo + Laravel + Next.js) avant de configurer Vercel + GitHub Actions

**Livrables démontrables :**

- Un visiteur peut s'inscrire et se connecter sur l'application déployée

---

### Sprint 2 — Semaine du 16/03/2026 — 11/10 points

**Goal:** Gestion complète des membres — rôles, profils, documents, admin dashboard

**Stories:**
| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-004 | Système de rôles & permissions | 3 | Must Have |
| STORY-005 | Profil & documents adhérents | 5 | Must Have |
| STORY-006 | Tableau de bord Admin | 3 | Must Have |

**Total:** 11 points / 10 capacité _(+1 point → acceptable, STORY-006 peut déborder légèrement sur Sprint 3)_

**Risques:**

- Intégration Cloudflare R2 peut nécessiter du débogage (premier usage)
- URLs signées S3 : tester sur les navigateurs mobiles

**Livrables démontrables :**

- Un Admin peut voir tous les membres, leurs dossiers et modifier leurs rôles
- Un membre peut uploader ses documents

---

### Sprint 3 — Semaine du 23/03/2026 — 11/10 points

**Goal:** Activités de l'association — événements, sessions d'entraînement, blog

**Stories:**
| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-007 | Gestion des événements | 3 | Must Have |
| STORY-008 | Calendrier & inscriptions | 3 | Must Have |
| STORY-009 | Sessions d'entraînement | 5 | Must Have |

**Total:** 11 points / 10 capacité _(+1 point — STORY-009 peut déborder légèrement sur Sprint 4)_

**Risques:**

- Formulaire multi-étapes pour les sessions : complexité UX potentielle
- Gestion des JSON exercises côté Laravel

**Livrables démontrables :**

- Un Entraîneur peut créer une session d'entraînement guidée
- Un membre peut voir le calendrier et s'inscrire à un événement

---

### Sprint 4 — Semaine du 30/03/2026 — 10/10 points

**Goal:** Lancement — communauté active, page publique, chat, leaderboard

**Stories:**
| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-010 | Templates de sessions | 2 | Should Have |
| STORY-011 | Page publique | 2 | Must Have |
| STORY-012 | Blog / fil d'actualité | 5 | Must Have |
| STORY-015 | Leaderboard | 3 | Should Have |

**Total:** 12 points / 10 capacité _(+2 points — prioriser 011 et 012 absolument, 010 et 015 si temps)_

**Risques:**

- Sprint le plus dense, potentiel de dépassement
- Prioriser la page publique et le blog (visibles des visiteurs)

**Livrables démontrables :**

- L'association est visible publiquement avec blog et événements
- Les membres voient le leaderboard

---

### Post-lancement (après 07/04/2026)

**Stories différées mais importantes :**
| Story | Titre | Points | Priorité |
|-------|-------|--------|----------|
| STORY-013 | Chat temps réel | 5 | Should Have |
| STORY-014 | Notifications | 3 | Should Have |
| STORY-016 | Intégration Strava | 5 | Could Have |

**Total différé :** 13 points (~1,5 semaine post-lancement)

**Rationale :** Le chat et les notifications sont des améliorations de confort — l'application est pleinement fonctionnelle sans eux au lancement. Strava est conditionnel.

---

## Epic Traceability

| Epic ID        | Epic Name             | Stories                       | Points | Sprints         |
| -------------- | --------------------- | ----------------------------- | ------ | --------------- |
| Infrastructure | Setup & BDD           | STORY-000, STORY-001          | 4      | Sprint 1        |
| EPIC-001       | Membres & Admin       | STORY-002, 003, 004, 005, 006 | 17     | Sprint 1-2      |
| EPIC-002       | Événements & Sessions | STORY-007, 008, 009, 010      | 13     | Sprint 3-4      |
| EPIC-003       | Communauté            | STORY-011, 012, 013, 014      | 15     | Sprint 4 + post |
| EPIC-004       | Performances          | STORY-015, 016                | 8      | Sprint 4 + post |

---

## Requirements Coverage

| FR ID  | FR Name                    | Story                | Sprint         |
| ------ | -------------------------- | -------------------- | -------------- |
| FR-001 | Authentification & Profil  | STORY-002, STORY-003 | 1              |
| FR-002 | Gestion des documents      | STORY-005            | 2              |
| FR-003 | Système de rôles           | STORY-004            | 2              |
| FR-004 | Création sessions          | STORY-009, STORY-010 | 3-4            |
| FR-005 | Gestion événements         | STORY-007, STORY-008 | 3              |
| FR-006 | Blog / actualités          | STORY-012            | 4              |
| FR-007 | Leaderboard & performances | STORY-015            | 4              |
| FR-008 | Intégration Strava         | STORY-016            | Post-lancement |
| FR-009 | Chat                       | STORY-013            | Post-lancement |
| FR-010 | Accès public               | STORY-011            | 4              |
| FR-011 | Tableau de bord Admin      | STORY-006            | 2              |
| FR-012 | Notifications              | STORY-014            | Post-lancement |

**Couverture Must Have au lancement :** FR-001 à FR-007, FR-010, FR-011 ✓ (9/12 FRs)
**Post-lancement :** FR-008, FR-009, FR-012 (3/12 FRs — Should/Could Have)

---

## Risks and Mitigation

**Élevé :**

- **Timeline serrée** (52 points pour 40 de capacité) → Mitigation : différer chat, notifications et Strava post-lancement. Prioriser Must Have absolus.
- **Cloudflare R2 + URLs signées** (première intégration) → Mitigation : prototyper en Sprint 2 jour 1, prévoir 2h de débogage.

**Moyen :**

- **Pusher WebSocket sur shared hosting** → Mitigation : architecture choisie pour éviter ce problème (client initie la connexion vers Pusher). Tester en Sprint 4.
- **Formulaire sessions multi-étapes** (UX complexe) → Mitigation : commencer par une version simple (formulaire unique) et améliorer en post-lancement.

**Faible :**

- **Strava API payante** → Mitigation : vérifier en Sprint 4, différer si nécessaire.
- **O2switch limitations cron** → Mitigation : tester les crons dès Sprint 1 (task scheduler Laravel).

---

## Definition of Done

Pour une story considérée comme complète :

- [ ] Code implémenté et commité sur `main`
- [ ] Tests Pest (backend) ou Vitest (frontend) écrits sur les cas critiques
- [ ] Code lint (ESLint + PHP-CS-Fixer) sans erreur
- [ ] Testé manuellement sur mobile (iOS Safari ou Android Chrome)
- [ ] Acceptance criteria validés
- [ ] Déployé en production (Vercel auto-deploy + GitHub Actions backend)

---

## Cadence des sprints

- **Durée :** 1 semaine (lundi → vendredi)
- **Début de sprint :** Lundi matin — révision du sprint backlog
- **Fin de sprint :** Vendredi — démo des livrables, rétrospective rapide
- **Suivi :** Mise à jour du `sprint-status.yaml` après chaque story complétée

---

## Next Steps

**Immédiat :** Démarrer Sprint 1

Pour chaque story, utiliser `/dev-story {STORY-ID}` pour obtenir une implémentation guidée détaillée.

**Ordre recommandé Sprint 1 :**

1. `/dev-story STORY-000` — Setup du projet
2. `/dev-story STORY-001` — Schéma BDD
3. `/dev-story STORY-002` — Inscription membre
4. `/dev-story STORY-003` — Authentification

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**

_Run `/workflow-status` to check overall progress._
