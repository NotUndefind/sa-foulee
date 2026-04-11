# Product Requirements Document : La Neuville TAF sa Foulée — v2

**Date :** 2026-03-29
**Auteur :** Jules Bourin
**Version :** 2.0
**Projet :** saFoulee — Refonte v2
**Statut :** Approuvé

---

## Aperçu du document

Ce PRD définit les exigences fonctionnelles et non-fonctionnelles pour la **version 2** du site de l'association La Neuville TAF sa Foulée. Il couvre la refonte graphique, les correctifs UX bloquants, et quatre nouvelles fonctionnalités majeures.

**Documents liés :**

- PRD v1 : `docs/prd-saFoulee-2026-03-07.md`
- Architecture : `docs/architecture-saFoulee-2026-03-07.md`
- Product Brief : `docs/product-brief-saFoulee-2026-03-07.md`

---

## Résumé exécutif

Le site de l'association La Neuville TAF sa Foulée (anciennement "sa Foulée") doit évoluer sur six axes :

1. **Refonte graphique** — Nouvelle palette (primaire `#FB3936`, secondaire `#FAFAFA`), intégration des visuels officiels (logo, mascotte, photo du bureau), correction systématique du nom.
2. **Correctifs UX bloquants** — Navigation retour sur les pages d'authentification, correction du bug SSR Tiptap dans l'éditeur de blog.
3. **Newsletter** — Abonnement opt-in pour les membres, envoi depuis le dashboard admin via Resend.
4. **Inventaire équipements** — Suivi du matériel de l'association (état, quantité, attribution) par admin/bureau.
5. **Gestion budgétaire** — Saisie et visualisation des dépenses/recettes par admin/bureau.
6. **Paiement HelloAsso** — Intégration du paiement de la cotisation annuelle via HelloAsso.

**Infrastructure de production confirmée :** Next.js sur Vercel + Laravel sur O2switch (serveur mutualisé PHP 8.2).

---

## Objectifs produit

### Objectifs métier

1. **Professionnaliser l'image** de l'association avec une identité visuelle cohérente et des visuels officiels.
2. **Réduire la charge administrative** du bureau grâce à des outils numériques (inventaire, budget, newsletter).
3. **Faciliter l'adhésion** en permettant le paiement de la cotisation directement depuis le site.
4. **Respecter le RGPD** pour la collecte d'emails newsletter et les données financières.
5. **Mettre le site en production** sur une infrastructure stable et économique (Vercel + O2switch).

### Indicateurs de succès

| Indicateur                                               | Cible                   |
| -------------------------------------------------------- | ----------------------- |
| Taux d'erreur console sur les pages auth/blog            | 0                       |
| Membres abonnés à la newsletter dans les 3 premiers mois | ≥ 30 %                  |
| Cotisations payées en ligne vs. espèces                  | ≥ 50 % en année 1       |
| Inventaire renseigné dès le lancement                    | 100 % du matériel connu |
| Score Core Web Vitals (LCP)                              | < 2,5 s                 |

---

## Exigences fonctionnelles

### Groupe R — Refonte Graphique & Identité

---

#### FR-R01 : Nouvelle palette de couleurs

**Priorité :** Must Have

**Description :**
Remplacer l'intégralité des tokens de couleur actuels (`--forest`, `--terra`, `--sage`, etc.) par la nouvelle palette officielle. La couleur primaire est `#FB3936` (rouge association), la couleur secondaire est `#FAFAFA` (blanc crème). Les déclinaisons (hover, dark, light) doivent être calculées à partir de ces deux couleurs de base.

**Critères d'acceptation :**

- [ ] Tous les boutons CTA primaires utilisent `#FB3936`
- [ ] Les hover states sont une nuance plus sombre de `#FB3936` (ex. `#D42F2D`)
- [ ] Le fond de page utilise `#FAFAFA`
- [ ] La sidebar du dashboard utilise une teinte sombre de `#FB3936` (ex. `#C0302E`)
- [ ] Aucune référence aux anciens tokens verts (`--forest`, `--sage`) dans les fichiers CSS/TSX

---

#### FR-R02 : Intégration des images officielles

**Priorité :** Must Have

**Description :**
Utiliser les trois visuels officiels fournis dans `/frontend/public/` :

- `logo-removebg-preview.png` — Logo de l'association (fond transparent)
- `mascotte-removebg-preview.png` — Mascotte (fond transparent)
- `bureau.png` — Photo des membres du bureau devant le panneau du village

**Utilisation recommandée :**

- **Logo** : Navbar publique, layout auth, favicon (via `next/image`)
- **Mascotte** : Section hero de la page d'accueil, section CTA, page 404
- **Bureau** : Section "À propos" / "Notre association" sur la page d'accueil

**Critères d'acceptation :**

- [ ] Le logo apparaît dans la navbar publique en remplacement du texte "sF"
- [ ] Le logo apparaît dans le layout auth avec un lien vers `/`
- [ ] La mascotte est visible sur la page d'accueil (hero ou section CTA)
- [ ] La photo du bureau est visible dans une section dédiée à l'association
- [ ] Toutes les images utilisent `next/image` avec des attributs `alt` descriptifs
- [ ] Les images sont optimisées (formats modernes via Next.js)

---

#### FR-R03 : Correction du nom de l'association

**Priorité :** Must Have

**Description :**
L'entité est une **association** et non un club. Le nom complet est **"La Neuville TAF sa Foulée"**. Toutes les occurrences de "club", "sa Foulée" seul, ou "saFoulee" visibles par l'utilisateur doivent être corrigées.

**Critères d'acceptation :**

- [ ] La balise `<title>` du site affiche "La Neuville TAF sa Foulée"
- [ ] Le footer affiche "La Neuville TAF sa Foulée"
- [ ] Le layout auth affiche "La Neuville TAF sa Foulée"
- [ ] La navbar publique affiche le nom complet ou le logo
- [ ] Aucune mention de "club" dans les textes visibles
- [ ] Les métadonnées Open Graph sont mises à jour

---

### Groupe UX — Correctifs

---

#### FR-UX01 : Navigation retour sur les pages d'authentification

**Priorité :** Must Have

**Description :**
Les pages `/connexion`, `/inscription`, `/mot-de-passe-oublie` et `/reinitialiser-mot-de-passe` ne proposent aucun moyen de revenir à l'accueil. Le layout auth doit afficher un logo cliquable qui redirige vers `/`.

**Critères d'acceptation :**

- [ ] Le logo de l'association est affiché en haut du layout auth
- [ ] Le logo est un `<Link href="/">` discret (pas un bouton "Retour")
- [ ] Le logo utilise `next/image` avec `logo-removebg-preview.png`
- [ ] Le lien fonctionne sur les quatre pages d'auth
- [ ] Le hover indique visuellement que l'élément est cliquable (opacity ou underline)

**Note :** Ce correctif est déjà appliqué dans cette itération.

---

#### FR-UX02 : Correction bug SSR Tiptap

**Priorité :** Must Have

**Description :**
L'éditeur de blog (`PostForm.tsx`) génère une erreur SSR Tiptap au rendu serveur. L'option `immediatelyRender: false` doit être ajoutée à `useEditor()`.

**Critères d'acceptation :**

- [ ] Aucune erreur console "SSR has been detected" sur la page de création/édition de post
- [ ] L'éditeur se charge correctement côté client
- [ ] Aucune hydration mismatch en mode production

**Note :** Ce correctif est déjà appliqué dans cette itération.

---

### Groupe N — Newsletter

---

#### FR-N01 : Opt-in newsletter pour les membres

**Priorité :** Must Have

**Description :**
Un membre connecté peut activer ou désactiver son abonnement à la newsletter depuis son profil. Le consentement est explicite (case à cocher ou toggle) et horodaté.

**Critères d'acceptation :**

- [ ] Un toggle "Recevoir la newsletter" est visible sur la page `/tableau-de-bord/profil`
- [ ] L'état (abonné/non-abonné) est persisté en base de données
- [ ] La date de consentement est enregistrée (`newsletter_subscribed_at`)
- [ ] La désactivation du toggle supprime l'abonnement instantanément
- [ ] L'état par défaut pour un nouveau membre est "non-abonné"

**Dépendances :** Migration BDD — ajout colonne `newsletter_subscribed_at` (nullable) sur `users`

---

#### FR-N02 : Gestion des abonnés (admin)

**Priorité :** Must Have

**Description :**
Les administrateurs et fondateurs peuvent voir la liste des membres abonnés à la newsletter, avec leur email et la date d'abonnement. Un export CSV est disponible.

**Critères d'acceptation :**

- [ ] Page `/tableau-de-bord/admin/newsletter` accessible aux rôles `admin` et `founder`
- [ ] Tableau : nom, email, date d'abonnement, statut actif/inactif
- [ ] Bouton "Exporter CSV" télécharge la liste des abonnés actifs
- [ ] Nombre total d'abonnés affiché en haut de page
- [ ] Recherche par nom ou email

---

#### FR-N03 : Envoi de newsletter depuis le dashboard

**Priorité :** Should Have

**Description :**
Un admin peut composer et envoyer une newsletter à tous les membres abonnés actifs. L'envoi utilise Resend (déjà intégré dans le projet).

**Critères d'acceptation :**

- [ ] Formulaire de création : sujet, corps (éditeur rich text Tiptap), prévisualisation
- [ ] Bouton "Envoyer" avec confirmation modale ("Vous allez envoyer à X abonnés")
- [ ] Envoi via Resend avec l'expéditeur `newsletter@[domaine]`
- [ ] Chaque email contient un lien de désabonnement unique (FR-N04)
- [ ] Historique des newsletters envoyées (date, sujet, nombre de destinataires)
- [ ] Gestion des erreurs Resend (quota, email invalide)

**Contrainte Vercel/O2switch :** L'envoi en masse doit être déclenché depuis le backend Laravel (O2switch), pas depuis une API route Next.js (limite de timeout Vercel à 10–60 s).

---

#### FR-N04 : Désabonnement par lien email

**Priorité :** Must Have

**Description :**
Chaque email de newsletter contient un lien de désabonnement unique. Un clic sur ce lien désabonne le membre sans nécessiter de connexion.

**Critères d'acceptation :**

- [ ] Le lien de désabonnement est présent dans le footer de chaque email envoyé
- [ ] Le lien contient un token unique et signé (non-devinable)
- [ ] Une page publique `/desabonnement?token=XXX` confirme le désabonnement
- [ ] Le token est invalidé après utilisation
- [ ] La page de confirmation affiche un message clair et un lien vers l'accueil
- [ ] Conforme RGPD : désabonnement effectif en 1 clic, sans formulaire

---

### Groupe I — Inventaire Équipements

---

#### FR-I01 : CRUD des équipements

**Priorité :** Must Have

**Description :**
Les admins et membres bureau peuvent gérer une liste des équipements de l'association. Chaque équipement a un nom, une catégorie, une quantité, un état et des notes libres.

**Champs :**

- `name` (string, obligatoire)
- `category` (enum : textile / matériel / électronique / autre)
- `quantity` (integer, ≥ 1)
- `status` (enum : bon / usé / hors_service)
- `notes` (text, optionnel)

**Critères d'acceptation :**

- [ ] Page `/tableau-de-bord/inventaire` accessible aux rôles `admin`, `founder`, `bureau`
- [ ] Liste paginée des équipements avec filtres (catégorie, état)
- [ ] Formulaire d'ajout / modification en modal ou page dédiée
- [ ] Suppression avec confirmation
- [ ] Compteur total par état (bon / usé / hors service) en haut de page

---

#### FR-I02 : Historique des mouvements

**Priorité :** Should Have

**Description :**
Les admins peuvent enregistrer des attributions d'équipements (quel membre possède quoi depuis quand) et les restitutions.

**Critères d'acceptation :**

- [ ] Formulaire "Attribuer à un membre" sur chaque fiche équipement
- [ ] Liste des attributions actives (nom membre, équipement, date d'attribution)
- [ ] Bouton "Marquer comme rendu" pour clore une attribution
- [ ] Historique complet (attributions passées et présentes) par équipement

---

#### FR-I03 : Export de l'inventaire

**Priorité :** Could Have

**Description :**
Export CSV de l'inventaire complet (tous les équipements avec leur état actuel).

**Critères d'acceptation :**

- [ ] Bouton "Exporter CSV" sur la page inventaire
- [ ] Le fichier contient : nom, catégorie, quantité, état, notes, date de dernière modification

---

### Groupe B — Gestion Budgétaire

---

#### FR-B01 : Saisie des dépenses et recettes

**Priorité :** Must Have

**Description :**
Les admins et bureau peuvent saisir des mouvements financiers (dépenses ou recettes) avec leur montant, date, catégorie et description.

**Champs :**

- `type` (enum : dépense / recette)
- `amount` (decimal, > 0)
- `date` (date)
- `category` (enum : achat_matériel / cotisation / événement / subvention / autre)
- `description` (string, obligatoire)
- `receipt_url` (optionnel — URL ou chemin vers justificatif)

**Critères d'acceptation :**

- [ ] Page `/tableau-de-bord/budget` accessible aux rôles `admin`, `founder`, `bureau`
- [ ] Formulaire de saisie rapide (dépense ou recette) avec tous les champs
- [ ] Liste chronologique des mouvements avec filtres (type, catégorie, période)
- [ ] Modification et suppression d'un mouvement existant
- [ ] Solde courant affiché en permanence (recettes - dépenses)

---

#### FR-B02 : Tableau de bord financier

**Priorité :** Must Have

**Description :**
Vue synthétique des finances de l'association : solde, graphique mensuel, répartition par catégorie.

**Critères d'acceptation :**

- [ ] Solde total (recettes cumulées - dépenses cumulées) affiché en valeur absolue
- [ ] Graphique en barres : recettes vs dépenses par mois (12 derniers mois)
- [ ] Répartition par catégorie (graphique donut ou liste)
- [ ] Filtre par exercice annuel (année sélectionnable)
- [ ] Total recettes / total dépenses / solde sur la période filtrée

---

#### FR-B03 : Export comptable

**Priorité :** Should Have

**Description :**
Export CSV des mouvements sur une période définie, pour une utilisation dans un logiciel comptable.

**Critères d'acceptation :**

- [ ] Sélection d'une plage de dates (date début / date fin)
- [ ] Export CSV : date, type, catégorie, description, montant
- [ ] Colonnes séparées dépenses / recettes pour faciliter l'import comptable

---

### Groupe P — Paiement HelloAsso

---

#### FR-P01 : Intégration HelloAsso pour le paiement de cotisation

**Priorité :** Must Have

**Description :**
Les membres peuvent payer leur cotisation annuelle via HelloAsso. L'intégration se fait via un lien ou widget HelloAsso pointant vers le formulaire de l'association.

**Critères d'acceptation :**

- [ ] Bouton "Payer ma cotisation" visible sur la page profil membre
- [ ] Bouton "Adhérer" sur la page publique (landing ou page dédiée `/adhesion`)
- [ ] Le lien ouvre le formulaire HelloAsso dans un nouvel onglet (ou widget embarqué)
- [ ] La page `/adhesion` explique le montant, ce que ça inclut, et le processus
- [ ] Compatible avec le serveur mutualisé O2switch (pas de SDK serveur nécessaire)

---

#### FR-P02 : Mise à jour du statut de cotisation via webhook HelloAsso

**Priorité :** Should Have

**Description :**
HelloAsso envoie un webhook après chaque paiement confirmé. Le backend Laravel met à jour le champ `membership_paid_at` du membre correspondant.

**Critères d'acceptation :**

- [ ] Endpoint API `POST /api/v1/webhooks/helloasso` créé et documenté
- [ ] Vérification de la signature HelloAsso sur chaque requête entrante
- [ ] Mise à jour de `membership_paid_at` pour le membre identifié par email
- [ ] Création automatique d'une recette dans le budget (FR-B01) avec catégorie "cotisation"
- [ ] Log des webhooks reçus (date, email, montant, statut)
- [ ] Gestion des doublons (même email, même année)

**Contrainte :** Le webhook doit être accessible depuis internet sur O2switch (pas de tunnel). URL : `https://api.[domaine]/api/v1/webhooks/helloasso`

---

### Groupe D — Infrastructure Production

---

#### FR-D01 : Déploiement Next.js sur Vercel

**Priorité :** Must Have

**Description :**
Le frontend Next.js est déployé sur Vercel avec les bonnes variables d'environnement, un domaine personnalisé et les preview deployments activés.

**Critères d'acceptation :**

- [ ] Variable `NEXT_PUBLIC_API_URL` configurée sur Vercel (pointe vers O2switch)
- [ ] Domaine personnalisé configuré (ex. `safoulee.fr` ou `laneuvilletafsafoulee.fr`)
- [ ] Preview deployments fonctionnels sur les PR GitHub
- [ ] Build sans erreurs TypeScript en mode production
- [ ] Variables sensibles (tokens, clés API) dans les variables d'environnement Vercel, jamais dans le code

---

#### FR-D02 : Déploiement Laravel sur O2switch

**Priorité :** Must Have

**Description :**
Le backend Laravel est déployé sur le serveur mutualisé O2switch avec une configuration CORS adaptée au domaine Vercel.

**Critères d'acceptation :**

- [ ] Fichier `.env.production` configuré (DB, CORS, Resend, Pusher)
- [ ] `APP_URL` pointe vers le sous-domaine API sur O2switch
- [ ] `CORS_ALLOWED_ORIGINS` inclut le domaine Vercel (production + preview)
- [ ] `php artisan migrate --force` exécuté sans erreur
- [ ] `php artisan config:cache && php artisan route:cache` appliqués
- [ ] SSL actif sur le sous-domaine API

---

## Exigences non-fonctionnelles

---

#### NFR-01 : Conformité RGPD

**Priorité :** Must Have

**Description :** Les données personnelles collectées (newsletter, budget) doivent respecter le RGPD.

**Critères d'acceptation :**

- [ ] Consentement explicite et horodaté pour la newsletter
- [ ] Lien de désabonnement en 1 clic dans chaque email
- [ ] Données financières visibles uniquement par admin/bureau
- [ ] Politique de confidentialité accessible sur le site

---

#### NFR-02 : Compatibilité Vercel (serverless)

**Priorité :** Must Have

**Description :** Le frontend Next.js ne doit pas dépendre de processus serveur persistants. Les fonctions API Route ne doivent pas dépasser 10 s (tier gratuit Vercel).

**Critères d'acceptation :**

- [ ] L'envoi de newsletter est déclenché depuis le backend O2switch, pas une API Route Next.js
- [ ] Pusher fonctionne via API HTTP (pas de WebSocket persistant côté Vercel)
- [ ] Aucune session serveur persistante dans Next.js

---

#### NFR-03 : Compatibilité O2switch (mutualisé PHP 8.2)

**Priorité :** Must Have

**Description :** Le backend Laravel doit fonctionner dans les contraintes d'un hébergement mutualisé.

**Critères d'acceptation :**

- [ ] PHP 8.2 minimum (vérifié dans `composer.json`)
- [ ] Pas de processus démon (pas de `php artisan queue:work` en continu)
- [ ] Queues Laravel configurées via cron O2switch si nécessaire
- [ ] Pas de modification des paramètres `php.ini` système

---

#### NFR-04 : Performance — Core Web Vitals

**Priorité :** Should Have

**Description :** Le site public doit atteindre de bonnes performances de chargement.

**Critères d'acceptation :**

- [ ] LCP (Largest Contentful Paint) < 2,5 s sur la page d'accueil
- [ ] Toutes les images utilisent `next/image` (optimisation automatique WebP/AVIF)
- [ ] Pas de blocking scripts dans le `<head>`
- [ ] Score Lighthouse Performance ≥ 80

---

#### NFR-05 : Accessibilité WCAG AA

**Priorité :** Should Have

**Description :** La nouvelle palette rouge doit conserver un ratio de contraste suffisant.

**Critères d'acceptation :**

- [ ] Ratio de contraste `#FB3936` sur blanc : ≥ 3:1 pour les UI, ≥ 4.5:1 pour le texte
- [ ] Les boutons et liens ont des `aria-label` ou du texte visible
- [ ] Navigation clavier fonctionnelle sur les formulaires auth

---

## Epics

### EPIC-R : Refonte Graphique & Identité

**Description :**
Mise à jour complète de l'identité visuelle du site — nouvelle palette, visuels officiels, correction du nom et des correctifs UX bloquants.

**Exigences fonctionnelles :**

- FR-R01, FR-R02, FR-R03
- FR-UX01, FR-UX02

**Estimation stories :** 4–6

**Priorité :** Must Have

**Valeur métier :** Image professionnelle de l'association, élimination des bugs visibles par tous les utilisateurs.

---

### EPIC-N : Newsletter Membres

**Description :**
Système complet de newsletter opt-in pour les membres : abonnement depuis le profil, gestion admin, envoi via Resend, désabonnement RGPD.

**Exigences fonctionnelles :**

- FR-N01, FR-N02, FR-N03, FR-N04

**Estimation stories :** 5–7

**Priorité :** Must Have / Should Have

**Valeur métier :** Communication directe avec les membres, conformité RGPD, remplacement des emails manuels.

---

### EPIC-I : Inventaire Équipements

**Description :**
Outil de gestion du matériel de l'association — CRUD équipements, suivi état, historique des attributions.

**Exigences fonctionnelles :**

- FR-I01, FR-I02, FR-I03

**Estimation stories :** 3–5

**Priorité :** Should Have

**Valeur métier :** Réduction des pertes de matériel, traçabilité des emprunts, visibilité sur l'état du parc.

---

### EPIC-B : Gestion Budgétaire

**Description :**
Module financier interne (admin/bureau) : saisie des mouvements, tableau de bord, export comptable.

**Exigences fonctionnelles :**

- FR-B01, FR-B02, FR-B03

**Estimation stories :** 3–5

**Priorité :** Should Have

**Valeur métier :** Suivi financier en temps réel, préparation des AG, conformité avec les obligations comptables associatives.

---

### EPIC-P : Paiement HelloAsso

**Description :**
Intégration HelloAsso pour le paiement de la cotisation annuelle, avec webhook de confirmation et mise à jour du statut membre.

**Exigences fonctionnelles :**

- FR-P01, FR-P02

**Estimation stories :** 2–3

**Priorité :** Must Have / Should Have

**Valeur métier :** Simplification de la collecte des cotisations, réduction des paiements en espèces, auto-alimentation du budget.

---

### EPIC-D : Infrastructure Production

**Description :**
Mise en production sur Vercel (Next.js) et O2switch (Laravel), configuration des environnements, domaines et CI/CD.

**Exigences fonctionnelles :**

- FR-D01, FR-D02

**Estimation stories :** 2–3

**Priorité :** Must Have

**Valeur métier :** Site accessible au public avec une infrastructure stable et économique.

---

## Stories de haut niveau

### EPIC-R

- En tant que visiteur, je veux voir le logo officiel dans la navbar pour reconnaître visuellement l'association.
- En tant qu'utilisateur sur la page de connexion, je veux pouvoir cliquer sur le logo pour retourner à l'accueil.
- En tant que visiteur, je veux voir la mascotte et la photo du bureau pour me sentir proche de l'association.

### EPIC-N

- En tant que membre, je veux activer la newsletter depuis mon profil pour recevoir les actualités.
- En tant qu'admin, je veux voir la liste des abonnés et envoyer une newsletter depuis le dashboard.
- En tant qu'abonné, je veux me désabonner en un clic depuis le lien dans l'email.

### EPIC-I

- En tant qu'admin, je veux ajouter et modifier les équipements de l'association pour en garder une trace.
- En tant que bureau, je veux enregistrer qu'un membre a emprunté un équipement pour suivre les attributions.

### EPIC-B

- En tant que trésorier (bureau), je veux saisir les dépenses et recettes pour tenir les comptes à jour.
- En tant qu'admin, je veux voir un tableau de bord financier pour préparer l'assemblée générale.

### EPIC-P

- En tant que nouveau membre, je veux payer ma cotisation en ligne via HelloAsso sans avoir à passer par un trésorier.
- En tant qu'admin, je veux que le paiement HelloAsso mette automatiquement à jour le statut de cotisation du membre.

### EPIC-D

- En tant que développeur, je veux déployer le frontend sur Vercel avec un domaine personnalisé et les preview deployments.
- En tant que développeur, je veux configurer le backend Laravel sur O2switch avec les bons CORS et variables de production.

---

## Personas utilisateurs

| Persona                | Rôle      | Besoins principaux                                           |
| ---------------------- | --------- | ------------------------------------------------------------ |
| **Marie** — Présidente | `founder` | Vue d'ensemble, gestion des membres, budget, newsletter      |
| **Paul** — Trésorier   | `bureau`  | Saisie budget, export comptable, suivi cotisations HelloAsso |
| **Sophie** — Coureuse  | `member`  | Inscription aux événements, paiement cotisation, blog        |
| **Luc** — Entraîneur   | `coach`   | Création de séances, suivi des participants                  |
| **Julien** — Visiteur  | —         | Découvrir l'association, voir les événements, adhérer        |

---

## Flux utilisateurs clés

### Flux 1 — Nouveau membre qui adhère

1. Visiteur arrive sur la page d'accueil
2. Clique sur "Adhérer" → page `/adhesion`
3. Lit les informations sur l'association et la cotisation
4. Clique "Payer ma cotisation" → redirection HelloAsso
5. Paiement HelloAsso validé → webhook → `membership_paid_at` mis à jour
6. Membre crée son compte sur le site (si pas déjà fait)
7. Active la newsletter dans ses préférences

### Flux 2 — Admin envoie une newsletter

1. Admin va sur `/tableau-de-bord/admin/newsletter`
2. Consulte la liste des abonnés (N membres)
3. Clique "Nouvelle newsletter" → formulaire (sujet + éditeur Tiptap)
4. Prévisualise le rendu email
5. Confirme l'envoi → Resend envoie à tous les abonnés actifs
6. Chaque email contient un lien de désabonnement unique

### Flux 3 — Bureau saisit une dépense

1. Bureau va sur `/tableau-de-bord/budget`
2. Voit le solde actuel et le graphique mensuel
3. Clique "Ajouter une dépense"
4. Saisit : montant, date, catégorie, description
5. La liste est mise à jour et le solde recalculé

---

## Dépendances

### Dépendances internes

| Dépendance      | Description                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------- |
| PRD v1          | Les FRs v1 (auth, events, blog, sessions, leaderboard) restent valides et ne sont pas modifiés |
| Architecture v1 | La stack technique (Next.js + Laravel + Sanctum + Pusher + Resend) est conservée               |
| Sprint status   | Les stories v1 en cours ne sont pas impactées par ce PRD v2                                    |

### Dépendances externes

| Service            | Usage                      | Contrainte                                       |
| ------------------ | -------------------------- | ------------------------------------------------ |
| **Vercel**         | Hébergement Next.js        | Plan gratuit ou Pro selon trafic                 |
| **O2switch**       | Hébergement Laravel/PHP    | PHP 8.2+, MySQL 8, pas de WebSockets             |
| **HelloAsso**      | Paiement cotisation        | Compte asso HelloAsso créé, formulaire configuré |
| **Resend**         | Envoi newsletter et emails | API key configurée, domaine vérifié              |
| **Pusher**         | Chat temps réel (existant) | API HTTP compatible O2switch                     |
| **GitHub Actions** | CI/CD                      | Déjà configuré, à adapter pour Vercel + O2switch |

---

## Hypothèses

1. L'association possède déjà un compte HelloAsso ou peut en créer un (gratuit).
2. Le domaine (ex. `laneuvilletafsafoulee.fr`) sera acheté avant la mise en production.
3. O2switch supporte PHP 8.2+ et MySQL 8 (vérifié sur leur offre standard).
4. Vercel plan Hobby est suffisant pour le trafic initial (< 100 000 req/mois).
5. Les queues Laravel (pour l'envoi de newsletter en masse) peuvent être déclenchées via un cron O2switch.
6. Le logo `logo-removebg-preview.png` est la version haute résolution finale approuvée.

---

## Hors périmètre

- Application mobile native (iOS/Android) — v3+
- Intégration Strava automatique (déjà partiellement implémentée en v1, reste optionnelle)
- Système de billetterie pour les événements (HelloAsso uniquement pour la cotisation annuelle)
- Commentaires de blog par des visiteurs non-inscrits
- Multi-association (une seule instance pour La Neuville TAF sa Foulée)
- Emprunts d'équipements par les membres eux-mêmes (gestion interne uniquement)
- Accès des membres au budget (lecture réservée à admin/bureau)

---

## Questions ouvertes

| #   | Question                                                                                                            | Impact         | Responsable |
| --- | ------------------------------------------------------------------------------------------------------------------- | -------------- | ----------- |
| Q1  | Quel domaine final pour le site ? (`safoulee.fr`, `laneuvilletaf.fr`, autre ?)                                      | FR-D01, FR-D02 | Jules       |
| Q2  | Montant de la cotisation annuelle à afficher sur la page `/adhesion` ?                                              | FR-P01         | Bureau      |
| Q3  | L'envoi newsletter doit-il supporter le HTML personnalisé ou un template fixe suffit ?                              | FR-N03         | Jules       |
| Q4  | Les queues Laravel pour la newsletter doivent-elles être asynchrones (cron) ou synchrones (max ~50 destinataires) ? | FR-N03, NFR-03 | Jules       |
| Q5  | Y a-t-il un exercice comptable en cours à importer dans FR-B01 au lancement ?                                       | FR-B01         | Trésorier   |

---

## Approbation

### Parties prenantes

| Rôle             | Nom          | Statut      |
| ---------------- | ------------ | ----------- |
| Product Owner    | Jules Bourin | ✅ Approuvé |
| Engineering Lead | Jules Bourin | ✅ Approuvé |

### Statut d'approbation

- [x] Product Owner
- [x] Engineering Lead
- [ ] Design Lead _(solo project)_
- [ ] QA Lead _(solo project)_

---

## Historique des révisions

| Version | Date       | Auteur       | Modifications                                                                                          |
| ------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| 1.0     | 2026-03-07 | Jules Bourin | PRD initial (auth, events, blog, sessions, leaderboard)                                                |
| 2.0     | 2026-03-29 | Jules Bourin | Refonte graphique, correctifs UX, newsletter, inventaire, budget, HelloAsso, infrastructure production |

---

## Prochaines étapes

### Architecture v2

Mettre à jour `docs/architecture-saFoulee-2026-03-07.md` pour couvrir :

- Schéma BDD des nouvelles tables (newsletter, inventory, budget_entries, webhooks)
- Configuration CORS Vercel ↔ O2switch
- Architecture d'envoi newsletter (queue + Resend)
- Intégration webhook HelloAsso

### Sprint Planning v2

Exécuter `/sprint-planning` pour décomposer les 6 epics en stories et planifier les sprints.

**Estimation totale :** 19–29 stories supplémentaires (~50–70 points)

---

**Ce document a été créé avec BMAD Method v6 — Phase 2 (Planning) — v2**

---

## Annexe A : Matrice de traçabilité

| Epic ID   | Epic Name                    | Exigences fonctionnelles                 | Estimation stories |
| --------- | ---------------------------- | ---------------------------------------- | ------------------ |
| EPIC-R    | Refonte Graphique & Identité | FR-R01, FR-R02, FR-R03, FR-UX01, FR-UX02 | 4–6                |
| EPIC-N    | Newsletter Membres           | FR-N01, FR-N02, FR-N03, FR-N04           | 5–7                |
| EPIC-I    | Inventaire Équipements       | FR-I01, FR-I02, FR-I03                   | 3–5                |
| EPIC-B    | Gestion Budgétaire           | FR-B01, FR-B02, FR-B03                   | 3–5                |
| EPIC-P    | Paiement HelloAsso           | FR-P01, FR-P02                           | 2–3                |
| EPIC-D    | Infrastructure Production    | FR-D01, FR-D02                           | 2–3                |
| **Total** |                              | **17 FRs + 5 NFRs**                      | **19–29 stories**  |

---

## Annexe B : Prioritisation

| Priorité    | FRs                                                                       | NFRs           |
| ----------- | ------------------------------------------------------------------------- | -------------- |
| Must Have   | FR-R01, R02, R03, UX01, UX02, N01, N02, N04, I01, B01, B02, P01, D01, D02 | NFR-01, 02, 03 |
| Should Have | FR-N03, I02, B03, P02                                                     | NFR-04, 05     |
| Could Have  | FR-I03                                                                    | —              |

**Total Must Have :** 14 FRs — cœur du MVP v2
**Total Should Have :** 5 FRs — important mais non bloquant
**Total Could Have :** 1 FR — bonus si temps disponible
