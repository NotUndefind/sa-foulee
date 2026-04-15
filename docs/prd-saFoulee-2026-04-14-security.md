# Product Requirements Document : saFoulee — Sécurité Mot de Passe

**Date :** 2026-04-14
**Auteur :** Jules Bourin
**Version :** 1.0
**Projet :** saFoulee — Politique de sécurité des mots de passe
**Statut :** Approuvé

---

## Documents liés

- PRD v3 : `docs/prd-saFoulee-2026-03-30.md`
- Architecture v2 : `docs/architecture-saFoulee-2026-03-29.md`

---

## Résumé exécutif

L'application saFoulee ne dispose actuellement d'aucune validation de complexité sur les mots de passe.
Lors du login, la seule règle est `required, string` — tout caractère est accepté et la requête part
directement vers MySQL. Lors de l'inscription, seul un minimum de 8 caractères est exigé, sans vérification
de complexité. Il n'existe pas de mécanisme de protection contre les attaques par force brute.

Ce PRD définit les exigences pour :

1. Une **politique de mot de passe** conforme ANSSI/CNIL, pilotée par variables d'environnement
   (non exposée dans le dépôt git)
2. Une **validation frontend** qui bloque toute requête invalide avant l'appel API, évitant ainsi
   des requêtes inutiles vers MySQL
3. Un **renforcement backend** en défense en profondeur
4. Un **mécanisme de blocage de compte** contre les tentatives répétées
5. Une **stratégie de migration** pour les utilisateurs disposant d'anciens mots de passe faibles

---

## Périmètre

### Dans le périmètre

- Validation côté client (Zod) sur login, inscription, réinitialisation de mot de passe
- Validation côté serveur (Laravel) sur les mêmes flux
- Configuration de la politique via variables d'environnement gitignorées
- Account lockout après N tentatives de connexion échouées
- Gestion de la réponse HTTP 429 côté frontend

### Hors périmètre

- Authentification à deux facteurs (2FA)
- Détection d'IP suspecte ou géolocalisation
- Historique des mots de passe (interdire de réutiliser les N derniers)
- Expiration automatique des mots de passe
- SSO / OAuth (Strava est déjà implémenté séparément)

---

## Personas concernés

- **Adhérent** — Crée un compte, se connecte, réinitialise son mot de passe
- **Admin / Fondateur** — Mêmes flux, accès à des données sensibles supplémentaires
- **Développeur** — Configure la politique via `.env`, maintient la cohérence frontend/backend

---

## Exigences Fonctionnelles

---

### FR-SEC-001 : Schéma de validation mdp centralisé (frontend)

**Priorité :** Must Have

**Description :**
Créer un module `frontend/src/lib/password-policy.ts` qui exporte un schéma Zod basé sur des
constantes lues depuis les variables d'environnement `NEXT_PUBLIC_*`. Ce schéma est la source unique
de vérité pour toute validation de mot de passe côté client.

**Critères d'acceptation :**
- [ ] Le fichier `frontend/src/lib/password-policy.ts` existe et exporte un schéma Zod valide
- [ ] Le schéma lit `NEXT_PUBLIC_PASSWORD_MIN_LENGTH` (défaut : 10)
- [ ] Le schéma lit `NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE` (défaut : true)
- [ ] Le schéma lit `NEXT_PUBLIC_PASSWORD_REQUIRE_LOWERCASE` (défaut : true)
- [ ] Le schéma lit `NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT` (défaut : true)
- [ ] Le schéma lit `NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL` (défaut : true)
- [ ] Modifier `NEXT_PUBLIC_PASSWORD_MIN_LENGTH=12` dans `.env.local` entraîne l'échec de la validation pour un mdp de 10 chars sans redéployer du code
- [ ] Le message d'erreur généré est explicite et ne révèle pas le mot de passe saisi
- [ ] Aucun mot de passe n'est jamais loggué dans la console (pas de `console.log(values)`)

**Dépendances :** Aucune

---

### FR-SEC-002 : Validation frontend avant login

**Priorité :** Must Have

**Description :**
Mettre à jour `LoginForm.tsx` pour utiliser le schéma centralisé de FR-SEC-001. Si le mot de passe
saisi ne respecte pas la politique, aucune requête réseau n'est émise vers `POST /api/v1/auth/login`.
Un lien "Mot de passe oublié ?" est affiché dans le message d'erreur pour guider les utilisateurs
dont le mot de passe existant ne respecte pas la nouvelle norme.

**Critères d'acceptation :**
- [ ] Saisir un mdp de moins de 10 chars → erreur Zod affichée, aucun appel réseau (vérifiable dans DevTools)
- [ ] Saisir un mdp sans majuscule → erreur Zod affichée, aucun appel réseau
- [ ] Saisir un mdp sans chiffre → erreur Zod affichée, aucun appel réseau
- [ ] Saisir un mdp sans caractère spécial → erreur Zod affichée, aucun appel réseau
- [ ] Le message d'erreur inclut un lien cliquable vers `/mot-de-passe-oublie`
- [ ] Un mdp conforme → la requête est envoyée normalement

**Dépendances :** FR-SEC-001

---

### FR-SEC-003 : Validation frontend avant inscription

**Priorité :** Must Have

**Description :**
Mettre à jour `RegisterForm.tsx` pour remplacer la règle actuelle `z.string().min(8)` par le schéma
centralisé. La vérification de confirmation (`password_confirmation === password`) est conservée.

**Critères d'acceptation :**
- [ ] Les mêmes règles de complexité que FR-SEC-002 s'appliquent sur le champ `password`
- [ ] La vérification de correspondance avec `password_confirmation` est maintenue
- [ ] Un mdp conforme → la requête d'inscription est envoyée
- [ ] Aucun appel réseau si le mdp ne respecte pas la politique

**Dépendances :** FR-SEC-001

---

### FR-SEC-004 : Validation frontend avant réinitialisation de mot de passe

**Priorité :** Must Have

**Description :**
Mettre à jour `ResetPasswordForm.tsx` pour utiliser le schéma centralisé. La vérification de
confirmation est conservée.

**Critères d'acceptation :**
- [ ] Mêmes règles de complexité que FR-SEC-002 et FR-SEC-003
- [ ] Vérification de confirmation maintenue
- [ ] Aucun appel réseau si le mdp ne respecte pas la politique

**Dépendances :** FR-SEC-001

---

### FR-SEC-005 : Règle de validation Laravel centralisée

**Priorité :** Must Have

**Description :**
Créer une règle Illuminate personnalisée `backend/app/Rules/PasswordPolicy.php` basée sur les
variables d'environnement `PASSWORD_*`. Cette règle est utilisée dans les Form Requests Laravel
pour enforcer la politique côté serveur (défense en profondeur).

**Critères d'acceptation :**
- [ ] `backend/app/Rules/PasswordPolicy.php` existe et implémente `ValidationRule`
- [ ] La règle lit `PASSWORD_MIN_LENGTH` (défaut : 10)
- [ ] La règle lit `PASSWORD_REQUIRE_UPPERCASE` (défaut : true)
- [ ] La règle lit `PASSWORD_REQUIRE_LOWERCASE` (défaut : true)
- [ ] La règle lit `PASSWORD_REQUIRE_DIGIT` (défaut : true)
- [ ] La règle lit `PASSWORD_REQUIRE_SPECIAL` (défaut : true)
- [ ] `RegisterRequest.php` utilise `new PasswordPolicy()` au lieu de `'min:8'`
- [ ] `ResetPasswordRequest.php` utilise `new PasswordPolicy()`
- [ ] `LoginRequest.php` utilise `new PasswordPolicy()` (défense en profondeur)
- [ ] `POST /api/v1/auth/register` avec un mdp faible retourne HTTP 422 avec un message explicite

**Dépendances :** Aucune

---

### FR-SEC-006 : Configuration de la politique via variables d'environnement

**Priorité :** Must Have

**Description :**
La politique de mot de passe est configurée exclusivement via des variables d'environnement
dans des fichiers `.env` gitignorés. Les fichiers `.env.example` (backend) et `frontend/.env.example`
documentent les variables disponibles avec leurs valeurs par défaut, sans les exposer dans le dépôt.

**Critères d'acceptation :**
- [ ] `backend/.env.example` contient les variables `PASSWORD_*` commentées avec leur valeur par défaut
- [ ] `frontend/.env.example` contient les variables `NEXT_PUBLIC_PASSWORD_*` commentées avec leur valeur par défaut
- [ ] `backend/.env` et `frontend/.env.local` sont bien dans `.gitignore` (vérifier, ne pas créer si absent)
- [ ] Aucune valeur de politique n'est hardcodée dans le code source (tout passe par `env()` ou `process.env`)
- [ ] La documentation dans `.env.example` précise : "Ces valeurs ne doivent PAS être committées dans le dépôt"

**Variables à définir :**

Backend (`.env`) :
```
PASSWORD_MIN_LENGTH=10
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_DIGIT=true
PASSWORD_REQUIRE_SPECIAL=true
```

Frontend (`frontend/.env.local`) :
```
NEXT_PUBLIC_PASSWORD_MIN_LENGTH=10
NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE=true
NEXT_PUBLIC_PASSWORD_REQUIRE_LOWERCASE=true
NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT=true
NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL=true
```

**Dépendances :** FR-SEC-001, FR-SEC-005

---

### FR-SEC-007 : Blocage de compte (Account Lockout)

**Priorité :** Must Have

**Description :**
Après 5 tentatives de connexion échouées pour un même email (peu importe l'IP), l'accès au login
est bloqué pendant 15 minutes. L'implémentation utilise le `RateLimiter` de Laravel dans
`AuthController::login()`. Le frontend gère la réponse HTTP 429 et affiche un message approprié.

**Critères d'acceptation :**
- [ ] 5 tentatives de connexion échouées → la 6e retourne HTTP 429
- [ ] La réponse 429 inclut un header `Retry-After` (secondes avant déblocage)
- [ ] La réponse 429 inclut un message JSON : `"message": "Trop de tentatives de connexion. Veuillez réessayer dans {X} minutes."`
- [ ] Après une connexion réussie, le compteur est réinitialisé
- [ ] `LoginForm.tsx` gère le statut HTTP 429 et affiche le message avec le délai restant
- [ ] La clé de rate limit est basée sur l'email (pas uniquement sur l'IP) pour cibler le compte

**Dépendances :** Aucune (modification dans `AuthController`)

---

### FR-SEC-008 : Stratégie de migration des comptes existants

**Priorité :** Must Have

**Description :**
L'application comporte des utilisateurs existants dont le mot de passe peut ne pas respecter la
nouvelle politique (ancienne règle : min 8 chars, pas de complexité). Puisque la validation est
appliquée sur le login, ces utilisateurs ne pourront plus se connecter directement.

**Critères d'acceptation :**
- [ ] Le message d'erreur Zod sur le login inclut un lien "Mot de passe oublié ?" visible et accessible
- [ ] La page de login affiche une notice informative lors du déploiement (ex. bannière temporaire)
- [ ] Avant le déploiement, un email est envoyé à tous les membres les invitant à mettre à jour leur mot de passe (action manuelle admin)
- [ ] Le flux "Mot de passe oublié" → réinitialisation reste fonctionnel et applique la nouvelle politique (couvert par FR-SEC-004)

**Dépendances :** FR-SEC-002, FR-SEC-004

---

## Exigences Non Fonctionnelles

---

### NFR-SEC-001 : Aucun mot de passe en clair

**Priorité :** Must Have

**Description :**
Les mots de passe ne doivent jamais apparaître en clair dans les logs, les réponses API, les messages
d'erreur, ou la console du navigateur.

**Critères d'acceptation :**
- [ ] Les réponses API ne contiennent jamais le champ `password` (le modèle User a `hidden = ['password']` — vérifier)
- [ ] Aucun `console.log()` sur les valeurs de formulaire incluant le mot de passe
- [ ] Les logs Laravel ne loggent pas les champs `password` (vérifier la config `dontFlash` dans `Handler.php`)
- [ ] Le formulaire utilise `type="password"` par défaut (toggle vers `type="text"` uniquement à la demande explicite de l'utilisateur)

---

### NFR-SEC-002 : Zéro requête MySQL inutile

**Priorité :** Must Have

**Description :**
La validation frontend doit intercepter toute saisie invalide avant l'appel `fetch()`. La base de
données MySQL ne doit jamais recevoir de requête pour un mot de passe qui ne respecte pas la politique.

**Critères d'acceptation :**
- [ ] La validation Zod est déclenchée par `react-hook-form` avant l'exécution de `onSubmit`
- [ ] Un mdp invalide → aucune requête visible dans l'onglet Network de DevTools
- [ ] Le backend dispose également de la validation (FR-SEC-005) pour les appels directs à l'API

---

### NFR-SEC-003 : Cohérence frontend / backend

**Priorité :** Must Have

**Description :**
Les règles de validation frontend (`NEXT_PUBLIC_PASSWORD_*`) et backend (`PASSWORD_*`) doivent être
identiques. Une incohérence créerait une situation où le frontend accepte une saisie que le backend
rejette, ou inversement.

**Critères d'acceptation :**
- [ ] Les deux ensembles de variables utilisent les mêmes valeurs par défaut (min=10, tous les types requis)
- [ ] La documentation dans `.env.example` mentionne explicitement la nécessité de synchroniser les deux
- [ ] Un test d'intégration (ou procédure manuelle documentée) vérifie la cohérence

---

### NFR-SEC-004 : Conformité ANSSI/CNIL

**Priorité :** Must Have

**Description :**
La politique par défaut est conforme aux recommandations ANSSI et CNIL pour les mots de passe.

**Critères d'acceptation :**
- [ ] Longueur minimale : 10 caractères
- [ ] Au moins 1 lettre majuscule
- [ ] Au moins 1 lettre minuscule
- [ ] Au moins 1 chiffre
- [ ] Au moins 1 caractère spécial (ex. `!@#$%^&*()_+-=[]{}|;':\",./<>?`)
- [ ] Hachage : bcrypt via `Hash::make()` (déjà en place — maintenir)

---

## Épics

---

### EPIC-SEC-01 : Politique de mot de passe centralisée

**Description :**
Créer l'infrastructure de configuration (variables d'env, schéma Zod, règle Laravel) permettant
de définir et modifier la politique sans toucher au code.

**Exigences Fonctionnelles :** FR-SEC-001, FR-SEC-005, FR-SEC-006

**Stories estimées :** 3–4

**Priorité :** Must Have

**Valeur métier :**
Découple la politique de sécurité du code source. Permet de la renforcer en production sans déploiement.

---

### EPIC-SEC-02 : Validation frontend pré-API

**Description :**
Bloquer toute requête invalide côté client avant l'appel API, sur les trois flux d'authentification.

**Exigences Fonctionnelles :** FR-SEC-002, FR-SEC-003, FR-SEC-004

**Stories estimées :** 3

**Priorité :** Must Have

**Valeur métier :**
Réduit les requêtes inutiles vers MySQL, améliore la réactivité UX, et évite l'exposition de données
invalides à l'API.

---

### EPIC-SEC-03 : Validation backend & protection compte

**Description :**
Renforcer la validation côté serveur et implémenter le blocage de compte après tentatives répétées.

**Exigences Fonctionnelles :** FR-SEC-005, FR-SEC-007

**Stories estimées :** 2–3

**Priorité :** Must Have

**Valeur métier :**
Protège l'application contre les attaques par force brute et garantit la cohérence des règles même
en cas d'appel direct à l'API.

---

### EPIC-SEC-04 : Migration des comptes existants

**Description :**
Assurer une transition sans coupure pour les utilisateurs disposant d'anciens mots de passe faibles.

**Exigences Fonctionnelles :** FR-SEC-008

**Stories estimées :** 1–2

**Priorité :** Must Have

**Valeur métier :**
Évite la dégradation de l'expérience utilisateur lors du déploiement de la nouvelle politique.

---

## Matrice de traçabilité

| Epic | Exigences | Stories estimées | Priorité |
|------|-----------|-----------------|----------|
| EPIC-SEC-01 | FR-SEC-001, FR-SEC-005, FR-SEC-006 | 3–4 | Must Have |
| EPIC-SEC-02 | FR-SEC-002, FR-SEC-003, FR-SEC-004 | 3 | Must Have |
| EPIC-SEC-03 | FR-SEC-005, FR-SEC-007 | 2–3 | Must Have |
| EPIC-SEC-04 | FR-SEC-008 | 1–2 | Must Have |

**Total estimé : 9–12 stories**

---

## Fichiers impactés

| Fichier | Action |
|---------|--------|
| `frontend/src/lib/password-policy.ts` | CRÉER |
| `frontend/src/components/features/auth/LoginForm.tsx` | MODIFIER |
| `frontend/src/components/features/auth/RegisterForm.tsx` | MODIFIER |
| `frontend/src/components/features/auth/ResetPasswordForm.tsx` | MODIFIER |
| `frontend/.env.example` | MODIFIER |
| `frontend/.env.local` | MODIFIER (non committé) |
| `backend/app/Rules/PasswordPolicy.php` | CRÉER |
| `backend/app/Http/Requests/Auth/LoginRequest.php` | MODIFIER |
| `backend/app/Http/Requests/Auth/RegisterRequest.php` | MODIFIER |
| `backend/app/Http/Requests/Auth/ResetPasswordRequest.php` | MODIFIER |
| `backend/app/Http/Controllers/Api/V1/AuthController.php` | MODIFIER |
| `backend/.env.example` | MODIFIER |
| `backend/.env` | MODIFIER (non committé) |

---

## Résumé des priorités

| Catégorie | Must Have | Should Have | Could Have |
|-----------|-----------|-------------|------------|
| Fonctionnel | 8 | 0 | 0 |
| Non-Fonctionnel | 4 | 0 | 0 |
| **Total** | **12** | **0** | **0** |

---

## Hypothèses

- Les fichiers `.env` et `frontend/.env.local` sont déjà dans `.gitignore` (à vérifier)
- Le flux "Mot de passe oublié" est fonctionnel et peut être utilisé pour la migration
- Les utilisateurs existants avec mots de passe faibles seront notifiés avant le déploiement (email manuel par un admin)
- Le cache Laravel (utilisé par `RateLimiter`) est configuré et fonctionnel en production

## Questions ouvertes

- Quel est le caractère spécial autorisé dans les mdp ? Faut-il documenter la liste exacte dans l'UI ?
- La bannière de migration sur la page login est-elle temporaire (à supprimer après N semaines) ou permanente ?
- Doit-on envoyer l'email de migration via la commande Artisan existante ou un mécanisme ad hoc ?
