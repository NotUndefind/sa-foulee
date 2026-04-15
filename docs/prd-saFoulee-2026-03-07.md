# Product Requirements Document: saFoulee

**Date:** 2026-03-07
**Author:** julesbourin
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This Product Requirements Document (PRD) defines the functional and non-functional requirements for saFoulee. It serves as the source of truth for what will be built and provides traceability from requirements through implementation.

**Related Documents:**

- Product Brief: `docs/product-brief-saFoulee-2026-03-07.md`

---

## Executive Summary

saFoulee est une application web mobile-first pour l'association de running villageoise "sa Foulée" (La Neuville). Elle centralise la gestion des membres (licences, documents obligatoires), les rôles associatifs, la création assistée d'événements et de sessions d'entraînement, le suivi des performances via Strava, un blog d'actualité et un leaderboard communautaire. L'objectif est de doter l'association d'un outil fondateur professionnel dès sa création, avec une UX soignée et accessible à des utilisateurs peu technophiles.

---

## Product Goals

### Business Objectives

- Lancer l'application simultanément avec la création officielle de l'association (avril 2026)
- Atteindre 80% d'adoption active parmi les membres dans les 3 premiers mois, 100% à terme
- Organiser au minimum 1 événement par mois créé via l'application
- Maintenir 100% des dossiers membres complets et à jour
- Permettre à un nouveau membre de s'inscrire en moins de 5 minutes

### Success Metrics

- Taux d'adoption : ≥ 80% des membres connectés activement (cible long terme : 100%)
- Fréquence événements : ≥ 1 événement/mois créé via l'app
- Complétude documentaire : 100% des adhérents avec dossier complet
- Onboarding : inscription complète en < 5 minutes
- Engagement : utilisation régulière du chat et du blog par les membres

---

## Functional Requirements

Functional Requirements (FRs) define **what** the system does — specific features and behaviors.

---

### FR-001: Authentification & Profil membre

**Priority:** Must Have

**Description:**
Le système doit permettre l'inscription, la connexion et la gestion du profil des membres.

**Acceptance Criteria:**

- [ ] Un visiteur peut s'inscrire avec email + mot de passe
- [ ] Un membre peut se connecter et se déconnecter
- [ ] Un membre peut réinitialiser son mot de passe par email
- [ ] Un membre peut renseigner et modifier son profil (nom, prénom, photo, biographie)
- [ ] Le flux d'inscription complet (profil + documents) se termine en < 5 minutes

**Dependencies:** Aucune

---

### FR-002: Gestion des documents des adhérents

**Priority:** Must Have

**Description:**
Le système doit permettre aux membres d'uploader leurs documents obligatoires et aux admins de suivre la complétude des dossiers.

**Acceptance Criteria:**

- [ ] Un membre peut uploader sa licence sportive (PDF, JPG, PNG, max 10 MB)
- [ ] Un membre peut uploader sa fiche d'adhésion
- [ ] Un membre peut uploader son certificat médical
- [ ] Chaque dossier affiche un indicateur de complétude (% documents fournis)
- [ ] Le système notifie le membre si un document est manquant ou expiré
- [ ] Les documents sont accessibles uniquement par le membre concerné et les Admins
- [ ] Les documents sont sauvegardés automatiquement (stockage S3 ou équivalent)

**Dependencies:** FR-001, FR-003

---

### FR-003: Système de rôles & permissions

**Priority:** Must Have

**Description:**
Le système doit gérer 5 rôles avec des permissions différenciées pour contrôler l'accès aux fonctionnalités.

**Acceptance Criteria:**

- [ ] Les 5 rôles existent : Admin, Fondateur, Entraîneur, Membre du bureau, Membre
- [ ] Un Admin peut assigner et modifier le rôle d'un membre
- [ ] Les permissions sont respectées : seuls les rôles autorisés peuvent créer des événements/sessions/posts
- [ ] Un visiteur non connecté n'a accès qu'aux informations publiques
- [ ] La matrice de permissions est configurable par l'Admin

**Matrice de permissions:**
| Action | Admin | Fondateur | Entraîneur | Bureau | Membre |
|--------|-------|-----------|------------|--------|--------|
| Gérer les membres | ✓ | ✓ | — | — | — |
| Créer sessions entraînement | ✓ | ✓ | ✓ | — | — |
| Créer événements | ✓ | ✓ | ✓ | ✓ | — |
| Publier posts blog | ✓ | ✓ | ✓ | ✓ | — |
| Voir son profil/documents | ✓ | ✓ | ✓ | ✓ | ✓ |
| Chat / leaderboard | ✓ | ✓ | ✓ | ✓ | ✓ |

**Dependencies:** FR-001

---

### FR-004: Création assistée de sessions d'entraînement

**Priority:** Must Have

**Description:**
Le système doit fournir une interface guidée pour créer des sessions d'entraînement structurées.

**Acceptance Criteria:**

- [ ] Un Entraîneur/rôle autorisé peut créer une session via un formulaire guidé
- [ ] Les champs disponibles : type (course, interval, fartlek, récupération, etc.), distance, durée estimée, intensité (faible/moyenne/élevée), exercices complémentaires, description libre
- [ ] Des templates de sessions réutilisables sont disponibles et créables
- [ ] La session peut être publiée avec une date/heure et visible par les membres
- [ ] Un membre peut marquer sa participation à une session

**Dependencies:** FR-001, FR-003

---

### FR-005: Gestion des événements

**Priority:** Must Have

**Description:**
Le système doit permettre la création, publication et gestion d'événements associatifs.

**Acceptance Criteria:**

- [ ] Un rôle autorisé peut créer un événement (nom, description, date, lieu, type : course/sortie/compétition)
- [ ] L'événement est visible dans un calendrier partagé
- [ ] Un membre peut s'inscrire à un événement
- [ ] L'organisateur voit la liste des inscrits
- [ ] Un événement peut être modifié ou annulé
- [ ] Les membres inscrits sont notifiés en cas de modification ou annulation

**Dependencies:** FR-001, FR-003, FR-012

---

### FR-006: Blog / fil d'actualité

**Priority:** Must Have

**Description:**
Le système doit fournir un fil d'actualité communautaire avec aide à la création de posts.

**Acceptance Criteria:**

- [ ] Un rôle autorisé peut créer un post (titre, contenu riche, image optionnelle)
- [ ] Des templates de posts sont disponibles (compte-rendu de course, annonce, résultats)
- [ ] Les posts sont affichés en ordre chronologique inversé
- [ ] Les posts sont visibles publiquement (sans données personnelles des membres)
- [ ] Les membres connectés peuvent commenter les posts
- [ ] Les posts peuvent être épinglés en haut du fil par un Admin

**Dependencies:** FR-001, FR-003

---

### FR-007: Leaderboard & suivi des performances

**Priority:** Should Have

**Description:**
Le système doit afficher un classement des membres basé sur leurs performances.

**Acceptance Criteria:**

- [ ] Un leaderboard affiche les membres classés par distance totale ou nombre de sessions
- [ ] Chaque membre peut consulter ses propres performances (historique, distance, sessions)
- [ ] Le leaderboard est filtrable par période (semaine, mois, saison)
- [ ] Les performances sont visibles uniquement par les membres connectés (pas en public)

**Dependencies:** FR-001, FR-008

---

### FR-008: Intégration Strava

**Priority:** Could Have

**Description:**
Le système doit permettre la connexion avec Strava pour importer automatiquement les activités sportives. Cette fonctionnalité est conditionnelle à la gratuité de l'API.

**Acceptance Criteria:**

- [ ] Un membre peut connecter son compte Strava via OAuth
- [ ] Les activités Strava sont automatiquement synchronisées et alimentent les performances
- [ ] Le membre peut déconnecter son compte Strava à tout moment
- [ ] En l'absence de connexion Strava, le membre peut saisir ses performances manuellement

**Dependencies:** FR-001, FR-007

---

### FR-013: Navigation & Design System cohérent

**Priority:** Must Have (Post-MVP)

**Description:**
L'application doit disposer d'une navigation cohérente, moderne et identitaire sur toutes les pages du dashboard, avec une charte graphique unifiée utilisant la palette de marque sa Foulée.

**Acceptance Criteria:**

- [ ] Sidebar desktop avec icônes SVG cohérentes, active state visible, section utilisateur en bas
- [ ] Navigation mobile bottom avec indicateurs visuels clairs
- [ ] Font Baloo 2 utilisée sur tous les composants de navigation
- [ ] Couleur brand #FF383E appliquée sur tous les éléments actifs/CTA
- [ ] Accent #7EAA99 utilisé en couleur secondaire cohérente
- [ ] Animations d'entrée (fadeUp) sur toutes les pages
- [ ] Logo "sF" avec design premium dans la sidebar

**Dependencies:** Aucune

---

### FR-014: Redesign des pages dashboard

**Priority:** Must Have (Post-MVP)

**Description:**
Chaque page du dashboard doit être redesignée pour offrir une expérience utilisateur riche, vivante et cohérente avec la charte graphique du club.

**Acceptance Criteria:**

- [ ] Page Accueil : hero greeting personnalisé, quick actions colorées, cards vivantes, skeleton loaders
- [ ] Page Événements : header impactant, filter pills par type, EventCard avec date badge coloré
- [ ] Page Sessions : filter pills type, header contextuel, form intégré élégant
- [ ] Page Blog : style éditorial, gradient décoratif, PostCard enrichie
- [ ] Page Classement : podium visuel top 3, stat cards colorées, allure/km en badge
- [ ] Page Profil : avatar ring gradient, progress bar documents animée, role badges colorés
- [ ] Page Administration : KPI cards, tableau membres propre, slide-over dossier

**Dependencies:** FR-013

---

### FR-009: Chat entre membres

**Priority:** Should Have

**Description:**
Le système doit fournir une messagerie en temps réel entre les membres de l'association.

**Acceptance Criteria:**

- [ ] Un canal général est disponible pour tous les membres
- [ ] Des canaux dédiés peuvent être créés par événement ou session
- [ ] Les messages s'affichent en temps réel (WebSocket ou équivalent)
- [ ] Un membre peut voir l'historique des messages
- [ ] Les messages sont accessibles uniquement aux membres connectés

**Dependencies:** FR-001

---

### FR-010: Accès public

**Priority:** Must Have

**Description:**
Le système doit exposer une page publique de l'association sans données personnelles.

**Acceptance Criteria:**

- [ ] Une page publique présente l'association (nom, description, logo, couleurs)
- [ ] Le blog/fil d'actualité est visible publiquement
- [ ] Le calendrier des événements est visible publiquement
- [ ] Aucune donnée personnelle (noms, performances, documents) n'est accessible sans connexion
- [ ] Un bouton "Rejoindre" redirige vers l'inscription

**Dependencies:** FR-006, FR-005

---

### FR-011: Tableau de bord Admin

**Priority:** Must Have

**Description:**
Le système doit fournir un tableau de bord de gestion pour les Admins.

**Acceptance Criteria:**

- [ ] Un Admin voit la liste complète des membres avec leur statut de dossier
- [ ] Un Admin peut modifier, suspendre ou supprimer un compte membre
- [ ] Un Admin peut assigner/modifier les rôles
- [ ] Un tableau de bord affiche des statistiques basiques (nombre de membres, taux de complétude des dossiers, événements créés)
- [ ] Un Admin peut exporter la liste des membres (CSV)

**Dependencies:** FR-001, FR-002, FR-003

---

### FR-012: Notifications

**Priority:** Should Have

**Description:**
Le système doit envoyer des notifications in-app et par email pour les événements importants.

**Acceptance Criteria:**

- [ ] Notifications in-app : nouvel événement, nouveau post, nouveau message chat, modification/annulation d'un événement inscrit
- [ ] Email automatique si un document est manquant ou expiré dans le dossier
- [ ] Un membre peut configurer ses préférences de notification
- [ ] Les notifications in-app sont accessibles via une icône cloche

**Dependencies:** FR-001, FR-002, FR-005, FR-006, FR-009

---

## Non-Functional Requirements

---

### NFR-001: Performance

**Priority:** Must Have

**Description:**
L'application doit être réactive, en particulier sur mobile.

**Acceptance Criteria:**

- [ ] Temps de chargement initial des pages < 2 secondes sur mobile 4G
- [ ] Réponse de l'API Laravel < 500ms pour 95% des requêtes
- [ ] Score Lighthouse Mobile ≥ 80 (Performance)

**Rationale:** Les utilisateurs peu tech-savvy abandonnent rapidement une app lente.

---

### NFR-002: Sécurité

**Priority:** Must Have

**Description:**
Les données personnelles et documents des adhérents doivent être protégés.

**Acceptance Criteria:**

- [ ] Authentification via JWT avec refresh tokens (expiration 15min access, 7j refresh)
- [ ] Toutes les communications en HTTPS/TLS
- [ ] Documents personnels chiffrés au repos (AES-256 ou équivalent)
- [ ] Accès aux fichiers limité par rôle via URLs signées (expiration courte)
- [ ] Journalisation des actions sensibles (upload/suppression de documents, changement de rôle)
- [ ] Protection contre CSRF, XSS, SQL injection

**Rationale:** Risque identifié : piratage et fuite de données personnelles.

---

### NFR-003: Conformité RGPD

**Priority:** Must Have

**Description:**
L'application doit respecter le Règlement Général sur la Protection des Données.

**Acceptance Criteria:**

- [ ] Consentement explicite lors de l'inscription
- [ ] Un membre peut demander la suppression de ses données
- [ ] Politique de confidentialité accessible depuis toutes les pages
- [ ] Données personnelles hébergées en Europe (ou conformes RGPD)
- [ ] Aucune transmission de données à des tiers sans consentement (hors Strava si connecté)

**Rationale:** Obligation légale — données de santé (certificat médical) et données personnelles.

---

### NFR-004: Fiabilité & Sauvegardes

**Priority:** Must Have

**Description:**
Les documents des adhérents ne doivent jamais être perdus.

**Acceptance Criteria:**

- [ ] Sauvegardes automatiques quotidiennes des documents
- [ ] Aucune suppression de document sans confirmation explicite (double confirmation)
- [ ] Uptime cible : 99% (compatible Vercel free tier)
- [ ] Restauration possible des documents en cas d'incident

**Rationale:** Risque identifié : perte de documents des adhérents.

---

### NFR-005: Mobile-first & Compatibilité

**Priority:** Must Have

**Description:**
L'interface doit être conçue prioritairement pour mobile.

**Acceptance Criteria:**

- [ ] Interface optimisée pour iOS Safari et Android Chrome
- [ ] Responsive de 320px (mobile S) à 1440px (desktop)
- [ ] Toutes les fonctionnalités accessibles sur mobile sans perte de fonctionnalité
- [ ] PWA optionnelle (manifest + service worker) pour accès rapide sans app store

**Rationale:** Utilisateurs sur téléphone en contexte sportif.

---

### NFR-006: Scalabilité

**Priority:** Should Have

**Description:**
L'architecture doit supporter la croissance de l'association sans refactoring majeur.

**Acceptance Criteria:**

- [ ] Architecture API stateless (Laravel REST) découplée du frontend (Next.js)
- [ ] Passage de 10 à 200 membres sans modification d'architecture
- [ ] Stockage de documents dimensionnable (S3 ou compatible)

**Rationale:** L'association grandit — éviter une réécriture coûteuse à 50+ membres.

---

### NFR-007: Maintenabilité

**Priority:** Must Have

**Description:**
Le code doit être structuré pour accueillir de nouveaux développeurs.

**Acceptance Criteria:**

- [ ] README complet (setup, architecture, conventions)
- [ ] Conventions de code appliquées (ESLint + Prettier pour Next.js, PHP-CS-Fixer pour Laravel)
- [ ] Tests unitaires sur les fonctions critiques (permissions, upload, authentification)
- [ ] Variables d'environnement documentées (.env.example)
- [ ] Code commenté sur les logiques complexes

**Rationale:** Projet solo qui doit pouvoir accueillir d'autres développeurs.

---

### NFR-008: Coût d'infrastructure

**Priority:** Must Have

**Description:**
L'infrastructure doit rester à coût nul ou minimal au lancement.

**Acceptance Criteria:**

- [ ] Frontend déployé sur Vercel (free tier)
- [ ] Backend Laravel sur hébergement économique (VPS < 10€/mois ou shared hosting)
- [ ] Stockage documents sur service S3-compatible abordable (ex: Cloudflare R2 free tier)
- [ ] Intégration Strava uniquement si API gratuite pour le volume prévu

**Rationale:** Budget bénévole, association sans but lucratif.

---

## Epics

---

### EPIC-001: Gestion des membres & administration

**Description:**
Tout ce qui concerne l'inscription des membres, la gestion de leurs profils et documents, le système de rôles, et le tableau de bord administratif.

**Functional Requirements:**

- FR-001 (Authentification & Profil)
- FR-002 (Gestion des documents)
- FR-003 (Système de rôles & permissions)
- FR-011 (Tableau de bord Admin)

**Story Count Estimate:** 5-8

**Priority:** Must Have

**Business Value:**
Fondation de l'association — sans cet epic, aucune gestion d'adhérents n'est possible.

---

### EPIC-002: Événements & sessions d'entraînement

**Description:**
Création assistée de sessions d'entraînement et d'événements associatifs, avec calendrier et gestion des inscriptions.

**Functional Requirements:**

- FR-004 (Création assistée de sessions)
- FR-005 (Gestion des événements)

**Story Count Estimate:** 4-6

**Priority:** Must Have

**Business Value:**
Cœur de l'activité sportive — structure les entraînements et events de l'association.

---

### EPIC-003: Communauté & communication

**Description:**
Blog/fil d'actualité, chat entre membres, notifications, et page d'accueil publique de l'association.

**Functional Requirements:**

- FR-006 (Blog / fil d'actualité)
- FR-009 (Chat entre membres)
- FR-010 (Accès public)
- FR-012 (Notifications)

**Story Count Estimate:** 4-6

**Priority:** Must Have / Should Have

**Business Value:**
Cohésion communautaire et visibilité publique de l'association.

---

### EPIC-005: UX / Navigation Refactor

**Description:**
Refonte complète de l'interface utilisateur du dashboard — navigation, charte graphique, animations, et cohérence visuelle sur toutes les pages membres. L'objectif est d'aligner l'expérience utilisateur sur le niveau de qualité attendu pour un club sportif moderne, en utilisant la palette de marque (brand #FF383E, accent #7EAA99, police Baloo 2).

**Functional Requirements:**

- FR-013 (Navigation & Design System cohérent)
- FR-014 (Redesign des pages dashboard)

**Story Count Estimate:** 6-8

**Priority:** Must Have (Post-MVP)

**Business Value:**
L'adoption de l'app dépend directement de la qualité de l'expérience utilisateur. Un design vivant et cohérent renforce l'identité du club et encourage l'utilisation quotidienne.

---

### EPIC-004: Performances & intégrations

**Description:**
Leaderboard des coureurs, suivi individuel des performances, et intégration Strava (conditionnelle).

**Functional Requirements:**

- FR-007 (Leaderboard & suivi des performances)
- FR-008 (Intégration Strava)

**Story Count Estimate:** 3-5

**Priority:** Should Have / Could Have

**Business Value:**
Motivation des membres par la gamification et la connexion avec leurs outils sportifs existants.

---

## User Stories (High-Level)

### EPIC-001 — Gestion des membres & administration

- En tant que **nouveau membre**, je veux m'inscrire et compléter mon dossier en moins de 5 minutes afin d'être opérationnel rapidement.
- En tant qu'**Admin**, je veux voir l'état des dossiers de tous les membres afin de relancer ceux dont les documents sont incomplets.
- En tant que **Fondateur**, je veux assigner des rôles aux membres afin de déléguer la gestion des événements et sessions.

### EPIC-002 — Événements & sessions d'entraînement

- En tant qu'**Entraîneur**, je veux créer une session d'entraînement guidée afin de proposer un plan structuré aux membres.
- En tant que **Membre**, je veux consulter le calendrier des événements et m'y inscrire afin de participer aux activités de l'association.
- En tant que **Membre du bureau**, je veux créer un événement (course, sortie) afin de l'annoncer à tous les membres.

### EPIC-003 — Communauté & communication

- En tant que **Membre**, je veux consulter le fil d'actualité afin de rester informé des dernières nouvelles de l'association.
- En tant que **Visiteur**, je veux voir la page publique de l'association et ses événements afin de découvrir "sa Foulée".
- En tant que **Membre**, je veux envoyer un message dans le chat afin de communiquer avec les autres coureurs.

### EPIC-004 — Performances & intégrations

- En tant que **Membre**, je veux voir le leaderboard afin de me comparer aux autres coureurs de l'association.
- En tant que **Membre**, je veux connecter mon compte Strava afin que mes activités soient automatiquement importées.

---

## User Personas

### Persona 1 — Le Membre Coureur (utilisateur primaire)

- **Âge :** 20-40 ans, habitant La Neuville
- **Tech savviness :** Faible à moyen (smartphone, WhatsApp, Facebook)
- **Besoin principal :** S'inscrire facilement, voir les événements, partager ses performances
- **Frustration actuelle :** Informations dispersées (WhatsApp, bouche-à-oreille)

### Persona 2 — L'Entraîneur / Membre du bureau (utilisateur avancé)

- **Rôle :** Crée les sessions, organise les événements, anime la communauté
- **Besoin principal :** Outils simples pour créer du contenu sans compétences techniques
- **Frustration actuelle :** Pas d'outil dédié, organisation manuelle

### Persona 3 — L'Admin / Fondateur (gestionnaire)

- **Rôle :** Gère les adhérents, les documents, les rôles
- **Besoin principal :** Vue d'ensemble claire, aucun dossier perdu
- **Frustration actuelle :** Gestion papier ou Excel difficile à maintenir

### Persona 4 — Le Visiteur public

- **Rôle :** Habitant du village ou coureur intéressé
- **Besoin principal :** Découvrir l'association, voir les événements
- **Action souhaitée :** Rejoindre l'association

---

## User Flows

### Flow 1 — Onboarding nouveau membre (< 5 min)

1. Visite la page publique → clique "Rejoindre"
2. Inscription (email, mot de passe, nom, prénom)
3. Complétion du profil (photo optionnelle)
4. Upload des documents (licence, fiche adhésion, certificat médical)
5. Confirmation → accès au tableau de bord membre

### Flow 2 — Création d'une session d'entraînement

1. Entraîneur connecté → "Créer une session"
2. Choix du type (course, interval, etc.)
3. Renseignement des paramètres (distance, durée, intensité, exercices)
4. Prévisualisation → Publication
5. Notification envoyée aux membres

### Flow 3 — Consultation du fil d'actualité (public et membre)

1. Visiteur/Membre ouvre l'app
2. Fil d'actualité affiché (posts chronologiques)
3. Clic sur un post → lecture complète
4. Membre connecté → peut commenter
5. Visiteur → invitation à rejoindre l'association

---

## Dependencies

### Internal Dependencies

- Le système de rôles (FR-003) est un prérequis pour toutes les fonctionnalités de création de contenu
- FR-001 (auth) est un prérequis pour tous les autres FRs
- FR-007 (leaderboard) dépend de FR-008 (Strava) ou d'une saisie manuelle des performances

### External Dependencies

- **API Strava** (FR-008) : OAuth 2.0, webhooks pour synchronisation temps réel — conditionnel à la gratuité
- **Service de stockage S3-compatible** : Pour les documents des adhérents (Cloudflare R2 recommandé)
- **Service d'email transactionnel** : Pour les notifications email (Resend, Mailgun free tier)
- **Vercel** : Hébergement frontend Next.js
- **Laravel Forge / VPS** : Hébergement backend Laravel

---

## Assumptions

- Les membres disposent d'un smartphone avec accès internet
- L'API Strava est accessible gratuitement pour un volume de 10-50 utilisateurs
- Le fondateur et les membres du bureau valideront les fonctionnalités lors du développement
- Vercel free tier supporte la charge initiale de 10 à 50 utilisateurs
- Les membres accepteront de fournir leurs documents en format numérique

---

## Out of Scope (v1)

- Application mobile native iOS/Android
- Module de paiement des cotisations en ligne
- Intégration d'autres apps sportives (Garmin, Polar, Apple Health)
- Messagerie privée entre membres (uniquement chat général/canal)
- Système de notation ou de feedback des sessions
- Statistiques avancées et rapports exportables (hors liste membres CSV)

---

## Open Questions

- **Strava API** : Vérifier les limites du free tier pour < 50 utilisateurs avant implémentation
- **Stockage documents** : Confirmer la solution S3-compatible (Cloudflare R2 recommandé pour coût nul)
- **Chat temps réel** : WebSocket (Laravel Reverb) ou solution externe (Pusher free tier) ?
- **Hébergement Laravel** : VPS ou shared hosting avec PHP 8.2+ ?
- **RGPD** : Un DPO (délégué à la protection des données) est-il nécessaire pour une association de cette taille ?

---

## Approval & Sign-off

### Stakeholders

- **julesbourin (Développeur)** — Influence : Haute
- **Fondateur de l'association** — Influence : Haute
- **Membres du bureau / Entraîneurs** — Influence : Moyenne

### Approval Status

- [ ] Product Owner (Fondateur)
- [ ] Engineering Lead (julesbourin)
- [ ] Design Lead
- [ ] QA Lead

---

## Revision History

| Version | Date       | Author      | Changes                                               |
| ------- | ---------- | ----------- | ----------------------------------------------------- |
| 1.0     | 2026-03-07 | julesbourin | Initial PRD                                           |
| 1.1     | 2026-03-08 | julesbourin | Added EPIC-005 UX Refactor, FR-013, FR-014 (Sprint 5) |

---

## Next Steps

### Phase 3: Architecture

Run `/architecture` to create system architecture based on these requirements.

The architecture will address:

- All functional requirements (FRs)
- All non-functional requirements (NFRs)
- Technical stack decisions (Next.js + Laravel + Tailwind + Motion.dev)
- Data models and APIs
- System components

### Phase 4: Sprint Planning

After architecture is complete, run `/sprint-planning` to:

- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

_To continue: Run `/workflow-status` to see your progress and next recommended workflow._

---

## Appendix A: Requirements Traceability Matrix

| Epic ID  | Epic Name                            | Functional Requirements        | Story Count (Est.) |
| -------- | ------------------------------------ | ------------------------------ | ------------------ |
| EPIC-001 | Gestion des membres & administration | FR-001, FR-002, FR-003, FR-011 | 5-8                |
| EPIC-002 | Événements & sessions d'entraînement | FR-004, FR-005                 | 4-6                |
| EPIC-003 | Communauté & communication           | FR-006, FR-009, FR-010, FR-012 | 4-6                |
| EPIC-004 | Performances & intégrations          | FR-007, FR-008                 | 3-5                |

**Total estimé : 16-25 stories**

---

## Appendix B: Prioritization Details

### Functional Requirements

| Priorité    | Count | FRs                                                            |
| ----------- | ----- | -------------------------------------------------------------- |
| Must Have   | 7     | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-010, FR-011 |
| Should Have | 3     | FR-007, FR-009, FR-012                                         |
| Could Have  | 1     | FR-008                                                         |

### Non-Functional Requirements

| Priorité    | Count | NFRs                                                          |
| ----------- | ----- | ------------------------------------------------------------- |
| Must Have   | 6     | NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-007, NFR-008 |
| Should Have | 1     | NFR-006                                                       |
