# Product Brief: saFoulee

**Date:** 2026-03-07
**Author:** julesbourin
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2

---

## Executive Summary

saFoulee est une application web mobile-first pour l'association de running villageoise "sa Foulée" (La Neuville). Elle centralise la gestion des membres (licences, documents obligatoires), les rôles associatifs, la création assistée d'événements et de sessions d'entraînement, le suivi des performances via Strava, un blog d'actualité et un leaderboard communautaire. L'objectif est de doter l'association d'un outil fondateur professionnel dès sa création, avec une expérience soignée et accessible à des utilisateurs peu technophiles.

---

## Problem Statement

### The Problem

La gestion manuelle des documents des adhérents (licences, fiches d'adhésion, documents obligatoires) est difficile et complexe à maintenir pour un grand nombre de personnes. La planification et la création d'événements sont fastidieuses sans outil dédié. Sans application, l'association démarrerait sur des bases artisanales (Excel, papier, WhatsApp) qui deviendraient ingérables avec la croissance.

### Why Now?

L'association "sa Foulée" vient d'être officiellement créée. L'application est l'outil fondateur — elle doit être disponible dès le lancement pour éviter toute prise de mauvaises habitudes de gestion manuelle.

### Impact if Unsolved

Sans cet outil, l'association risque une désorganisation administrative (documents perdus, membres mal enregistrés), une démotivation des membres faute de communication centralisée, et une difficulté croissante à organiser des événements de qualité.

---

## Target Audience

### Primary Users

Membres de l'association "sa Foulée" :

- **Âge :** 20 à 40 ans
- **Profil tech :** Peu à l'aise avec les applications numériques (contexte village)
- **Volume :** ~10 membres au lancement, ~50 membres à terme
- **Usage :** Quotidien — consultation du blog, chat, suivi des performances, participation aux événements

### Secondary Users

- **Administrateurs** — Gestion globale de l'application et des membres
- **Fondateur** — Rôle de référence, décisions associatives
- **Entraîneurs & membres du bureau** — Création de sessions d'entraînement et d'événements
- **Visiteurs publics** — Consultation des informations générales de l'association (sans accès aux données personnelles ni aux détails des sessions/performances)

### User Needs

1. **Gestion documentaire simplifiée** — Centraliser et gérer facilement les documents obligatoires des adhérents (licences, fiches d'adhésion, registre) avec un suivi de complétude
2. **Création assistée d'événements et de sessions** — Interface simple et guidée pour créer des sessions de running (type d'exercice, distance, intensité) ou des événements associatifs
3. **Blog d'actualité communautaire** — Fil d'actualité regroupant tous les événements de l'association avec une aide à la création de posts

---

## Solution Overview

### Proposed Solution

Une application web mobile-first (Next.js + Laravel) qui sert de plateforme centrale pour l'association : gestion administrative des membres, outil de planification d'événements avec assistance à la création, blog communautaire, suivi des performances et communication entre membres.

### Key Features

- **Gestion des membres** — Inscription, profil, licences, documents obligatoires avec suivi de complétude
- **Système de rôles** — Admin, Fondateur, Entraîneur, Membre du bureau, Membre
- **Création assistée de sessions** — Interface guidée pour composer des entraînements (course, exercices, intervalles, etc.)
- **Gestion d'événements** — Création, publication et gestion des événements par les rôles autorisés
- **Blog / fil d'actualité** — Posts avec aide à la rédaction, visible par tous (y compris visiteurs)
- **Leaderboard** — Classement des coureurs sur leurs performances
- **Suivi des performances** — Intégration Strava (si API gratuite disponible, sinon reporté en v2)
- **Chat entre membres** — Communication interne à l'association
- **Accès public limité** — Informations générales de l'association visibles sans compte, données personnelles protégées

### Value Proposition

saFoulee professionnalise l'association dès sa création avec un outil unique, simple pour des utilisateurs non-tech, sécurisé pour les données personnelles, et conçu pour grandir avec l'association.

---

## Business Objectives

### Goals

- Lancer l'application simultanément avec la création officielle de l'association (avril 2026)
- Atteindre 80% d'adoption active parmi les membres dans les 3 premiers mois
- Organiser au minimum 1 événement par mois créé via l'application
- Maintenir 100% des dossiers membres complets et à jour
- Permettre à un nouveau membre de s'inscrire en moins de 5 minutes

### Success Metrics

- Taux d'adoption : ≥ 80% des membres connectés activement (cible long terme : 100%)
- Fréquence événements : ≥ 1 événement/mois créé via l'app
- Complétude documentaire : 100% des adhérents avec dossier complet
- Onboarding : inscription complète en < 5 minutes
- Engagement : utilisation régulière du chat et du blog par les membres

### Business Value

Outil associatif fondateur qui structure et professionnalise l'association dès le premier jour, renforce la cohésion communautaire et réduit la charge administrative à zéro pour les responsables.

---

## Scope

### In Scope (v1)

- Gestion complète des membres (inscription, profil, documents, licences)
- Système de rôles et permissions (Admin, Fondateur, Entraîneur, Bureau, Membre)
- Création assistée de sessions de running et d'entraînements
- Gestion et publication d'événements par les rôles autorisés
- Blog / fil d'actualité avec aide à la création de posts
- Leaderboard et suivi des performances
- Intégration Strava (si API gratuite)
- Chat entre membres
- Accès public limité (informations générales, sans données personnelles)
- Sécurité des données personnelles et documents (conformité RGPD)

### Out of Scope (v1)

- Application mobile native (iOS/Android)
- Fonctionnalités de paiement (cotisations en ligne)
- Intégration d'autres apps sportives (Garmin, Polar, etc.)

### Future Considerations (v2+)

- Application mobile native iOS/Android
- Intégration Strava si non disponible en v1
- Module de gestion des cotisations en ligne
- Statistiques avancées et rapports pour le bureau

---

## Key Stakeholders

- **julesbourin (Développeur)** — Influence : Haute. Porteur technique unique du projet, responsable de la conception et du développement.
- **Fondateur de l'association** — Influence : Haute. Décisionnaire associatif, utilisateur clé pour la validation des fonctionnalités de gestion.
- **Membres du bureau / Entraîneurs** — Influence : Moyenne. Créateurs de sessions et d'événements, retours terrain essentiels pour l'UX.
- **Membres adhérents** — Influence : Basse. Utilisateurs finaux principaux, leur adoption définit le succès de l'application.

---

## Constraints and Assumptions

### Constraints

- **Budget minimal** — Projet bénévole, coûts limités aux services gratuits (Vercel free tier, domaine)
- **Développeur unique** — julesbourin est seul à développer ; la codebase doit être structurée pour accueillir d'autres développeurs à terme
- **Délai serré** — 1 mois pour livrer une v1 complète (lancement cible : début avril 2026)
- **Intégration Strava conditionnelle** — Si l'API Strava est payante, la fonctionnalité est reportée en v2
- **Conformité RGPD** — Les documents personnels des adhérents imposent des exigences légales de sécurité et de confidentialité

### Assumptions

- Les membres disposent d'un smartphone et d'un accès internet
- L'API Strava est accessible gratuitement pour le volume prévu (~50 utilisateurs)
- Le fondateur et les membres du bureau seront disponibles pour tester et valider les fonctionnalités clés
- Vercel (free tier) supporte la charge initiale de 10 à 50 utilisateurs

---

## Success Criteria

- Tous les nouveaux adhérents peuvent s'inscrire et compléter leur dossier en moins de 5 minutes, sans assistance
- Le fondateur et le bureau gèrent l'association de manière totalement autonome via l'application
- L'application fonctionne de manière stable sur le long terme avec une maintenance minimale
- 100% des adhérents utilisent l'application régulièrement (chat, blog, événements)
- Les données personnelles sont sécurisées — aucune fuite, aucune perte de document
- La codebase est suffisamment propre et documentée pour accueillir de nouveaux développeurs sans friction

---

## Timeline and Milestones

### Target Launch

**Début avril 2026** (dans 1 mois)

### Key Milestones

- **Semaine 1 (7-14 mars)** — Architecture technique, setup du projet (Next.js + Laravel), authentification et système de rôles
- **Semaine 2 (14-21 mars)** — Gestion des membres et documents, onboarding < 5 min
- **Semaine 3 (21-28 mars)** — Événements, sessions assistées, blog/actualités
- **Semaine 4 (28 mars - 4 avril)** — Chat, leaderboard, intégration Strava (si possible), tests et déploiement Vercel
- **Lancement v1 — début avril 2026**

---

## Risks and Mitigation

- **Risque : Perte de documents des adhérents**
  - **Probabilité :** Moyenne
  - **Mitigation :** Stockage sécurisé avec sauvegardes automatiques (S3 ou équivalent), pas de suppression sans confirmation, journalisation des actions

- **Risque : Piratage / fuite de données personnelles**
  - **Probabilité :** Moyenne
  - **Mitigation :** Authentification robuste (JWT + refresh tokens), chiffrement des données sensibles au repos et en transit, conformité RGPD, accès aux documents strictement limité par rôle

- **Risque : Délai trop serré (1 mois, développeur seul)**
  - **Probabilité :** Haute
  - **Mitigation :** Prioriser les fonctionnalités core (membres, documents, événements) ; différer Strava et fonctionnalités secondaires si nécessaire

- **Risque : Faible adoption (utilisateurs non-tech)**
  - **Probabilité :** Moyenne
  - **Mitigation :** UX mobile-first ultra-simple, onboarding guidé < 5 min, accompagnement du fondateur au lancement

- **Risque : API Strava payante**
  - **Probabilité :** Basse
  - **Mitigation :** Fonctionnalité conditionnelle — reportée en v2 si coût non nul

---

## Next Steps

1. Créer le Product Requirements Document (PRD) — `/prd`
2. Concevoir l'architecture technique — `/architecture`
3. Lancer le sprint planning — `/sprint-planning`

---

**This document was created using BMAD Method v6 - Phase 1 (Analysis)**

_To continue: Run `/workflow-status` to see your progress and next recommended workflow._
