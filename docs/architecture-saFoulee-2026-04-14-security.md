# Architecture : saFoulee — Module Sécurité Mot de Passe

**Date :** 2026-04-14
**Architecte :** Jules Bourin
**Version :** 1.0
**Statut :** Approuvé

---

## Documents liés

- PRD Sécurité : `docs/prd-saFoulee-2026-04-14-security.md`
- Architecture v2 : `docs/architecture-saFoulee-2026-03-29.md`

---

## Résumé exécutif

Ce document décrit l'architecture du module de sécurité des mots de passe ajouté à l'application existante.
Il ne remplace pas l'architecture v2 — il la complète par une couche de validation additionnelle.

**Principe directeur :** aucune requête MySQL ne doit partir si le mot de passe est manifestement invalide.
La validation est effectuée en cascade : Zod (navigateur) → PasswordPolicy Rule (Laravel) → `Hash::check()`
(bcrypt) → base de données.

**Trois composants ajoutés :**

1. `PasswordPolicyModule` — schéma Zod centralisé côté frontend, piloté par variables d'environnement
2. `PasswordPolicyRule` — règle Laravel centralisée côté backend, piloté par variables d'environnement
3. `AccountLockoutGuard` — mécanisme de blocage de compte via `RateLimiter` dans `AuthController`

---

## Drivers architecturaux

| NFR | Exigence | Impact architectural |
|-----|----------|----------------------|
| NFR-SEC-002 | Zéro requête MySQL inutile | Validation Zod bloquante avant `onSubmit` |
| NFR-SEC-001 | Aucun mot de passe en clair | Champs `hidden` sur User, pas de log du mdp |
| NFR-SEC-004 | Conformité ANSSI/CNIL | Min 10 chars + 4 critères de complexité |
| NFR-SEC-003 | Cohérence frontend / backend | Mêmes valeurs dans les deux `.env`, documentées |
| FR-SEC-007 | Account lockout après 5 tentatives | `RateLimiter` Laravel, clé par email |

---

## Vue d'ensemble — Flux de validation

```
Utilisateur saisit email + mot de passe
         │
         ▼
┌────────────────────────────────────────────────────────┐
│  FRONTEND — Zod (PasswordPolicyModule)                 │
│  buildPasswordSchema() lit NEXT_PUBLIC_PASSWORD_*      │
│  react-hook-form : validation avant onSubmit()         │
│                                                        │
│  ✗ invalide → erreur affichée, AUCUN appel réseau      │
│  ✓ valide  → fetch() vers POST /api/v1/auth/login      │
└────────────────────────────────────────────────────────┘
         │  (HTTPS — mot de passe jamais en clair)
         ▼
┌────────────────────────────────────────────────────────┐
│  BACKEND — AccountLockoutGuard (AuthController)        │
│  RateLimiter::tooManyAttempts('login.email', 5)        │
│                                                        │
│  ✗ bloqué → HTTP 429 + retry_after (secondes)         │
│  ✓ libre  → suite du traitement                        │
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│  BACKEND — PasswordPolicyRule (Laravel Form Request)   │
│  PasswordPolicy::validate() lit PASSWORD_*             │
│                                                        │
│  ✗ invalide → HTTP 422 + messages de validation        │
│  ✓ valide  → User::where('email')->first()             │
└────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│  BACKEND — Hash::check() (bcrypt)                      │
│                                                        │
│  ✗ mdp incorrect → RateLimiter::hit() + HTTP 422       │
│  ✓ correct      → RateLimiter::clear() + token         │
└────────────────────────────────────────────────────────┘
         │
         ▼
     Réponse JSON : { user, token }
```

---

## Composant 1 — PasswordPolicyModule (Frontend)

**Fichier :** `frontend/src/lib/password-policy.ts`

**Responsabilités :**
- Lire la politique depuis les variables `NEXT_PUBLIC_PASSWORD_*`
- Exposer un schéma Zod réutilisable par tous les formulaires auth
- Être la source unique de vérité côté client

**Implémentation de référence :**

```typescript
import { z } from 'zod'

// Lecture des env vars au module load (côté client, évalué au build Next.js)
const MIN_LENGTH = Number(process.env.NEXT_PUBLIC_PASSWORD_MIN_LENGTH ?? 10)
const REQUIRE_UPPERCASE = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE !== 'false'
const REQUIRE_LOWERCASE = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_LOWERCASE !== 'false'
const REQUIRE_DIGIT = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT !== 'false'
const REQUIRE_SPECIAL = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL !== 'false'

export const PASSWORD_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;\':",./<>?'

/**
 * Schéma Zod pour un champ mot de passe.
 * Les règles dépendent des variables NEXT_PUBLIC_PASSWORD_*.
 * À utiliser dans LoginForm, RegisterForm, ResetPasswordForm.
 */
export const passwordSchema = z
  .string()
  .min(1, 'Le mot de passe est obligatoire.')
  .min(MIN_LENGTH, `Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`)
  .superRefine((val, ctx) => {
    if (REQUIRE_UPPERCASE && !/[A-Z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le mot de passe doit contenir au moins une lettre majuscule.',
      })
    }
    if (REQUIRE_LOWERCASE && !/[a-z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le mot de passe doit contenir au moins une lettre minuscule.',
      })
    }
    if (REQUIRE_DIGIT && !/[0-9]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le mot de passe doit contenir au moins un chiffre.',
      })
    }
    if (REQUIRE_SPECIAL && !/[!@#$%^&*()\-_=+\[\]{}|;':",./<>?\\]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Le mot de passe doit contenir au moins un caractère spécial (${PASSWORD_SPECIAL_CHARS}).`,
      })
    }
  })
```

**Consommation dans LoginForm.tsx :**

```typescript
// Avant :
const schema = z.object({
  password: z.string().min(1, 'Le mot de passe est obligatoire.'),
})

// Après :
import { passwordSchema } from '@/lib/password-policy'
const schema = z.object({
  email: z.string().min(1, ...).email(...),
  password: passwordSchema,
})
```

**Gestion du 429 dans `onSubmit` :**

```typescript
} catch (err) {
  if (err instanceof ApiError && err.status === 422) {
    setGlobalError("L'adresse e-mail ou le mot de passe est incorrect.")
  } else if (err instanceof ApiError && err.status === 429) {
    setGlobalError(err.message ?? 'Trop de tentatives. Réessayez dans quelques minutes.')
  } else {
    setGlobalError('Une erreur inattendue est survenue. Veuillez réessayer.')
  }
}
```

**Note importante — Next.js et `process.env.NEXT_PUBLIC_*` :**
Les variables `NEXT_PUBLIC_*` sont inlinées au moment du build. Modifier leur valeur nécessite un redéploiement.
Ce comportement est intentionnel : la politique change rarement et le build-time inlining garantit
qu'il n'y a aucune requête réseau supplémentaire pour récupérer la politique.

---

## Composant 2 — PasswordPolicyRule (Backend)

**Fichier :** `backend/app/Rules/PasswordPolicy.php`

**Responsabilités :**
- Réimplémenter côté serveur les mêmes règles que le frontend (défense en profondeur)
- Être utilisée dans `LoginRequest`, `RegisterRequest`, `ResetPasswordRequest`

**Implémentation de référence :**

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PasswordPolicy implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $min     = (int)  config('password-policy.min_length',       10);
        $upper   = (bool) config('password-policy.require_uppercase', true);
        $lower   = (bool) config('password-policy.require_lowercase', true);
        $digit   = (bool) config('password-policy.require_digit',     true);
        $special = (bool) config('password-policy.require_special',   true);

        if (mb_strlen($value) < $min) {
            $fail("Le mot de passe doit contenir au moins {$min} caractères.");
            return;
        }
        if ($upper && ! preg_match('/[A-Z]/', $value)) {
            $fail('Le mot de passe doit contenir au moins une lettre majuscule.');
            return;
        }
        if ($lower && ! preg_match('/[a-z]/', $value)) {
            $fail('Le mot de passe doit contenir au moins une lettre minuscule.');
            return;
        }
        if ($digit && ! preg_match('/[0-9]/', $value)) {
            $fail('Le mot de passe doit contenir au moins un chiffre.');
            return;
        }
        if ($special && ! preg_match('/[!@#$%^&*()\-_=+\[\]{}|;\':",.\\/<>?\\\\]/', $value)) {
            $fail('Le mot de passe doit contenir au moins un caractère spécial.');
        }
    }
}
```

**Fichier de configuration :** `backend/config/password-policy.php`

```php
<?php

return [
    'min_length'       => (int)  env('PASSWORD_MIN_LENGTH',       10),
    'require_uppercase'=> (bool) (env('PASSWORD_REQUIRE_UPPERCASE', 'true') !== 'false'),
    'require_lowercase'=> (bool) (env('PASSWORD_REQUIRE_LOWERCASE', 'true') !== 'false'),
    'require_digit'    => (bool) (env('PASSWORD_REQUIRE_DIGIT',    'true') !== 'false'),
    'require_special'  => (bool) (env('PASSWORD_REQUIRE_SPECIAL',  'true') !== 'false'),
];
```

> **Pourquoi un fichier de config et non `env()` direct dans la Rule ?**
> Laravel met en cache la configuration avec `php artisan config:cache` en production (O2switch).
> Utiliser `config()` respecte ce mécanisme. Utiliser `env()` directement dans le code n'est pas
> résolu depuis le cache — cela peut causer des comportements incohérents en production.

**Consommation dans RegisterRequest.php :**

```php
use App\Rules\PasswordPolicy;

// Avant :
'password' => ['required', 'string', 'min:8', 'confirmed'],

// Après :
'password' => ['required', 'string', new PasswordPolicy(), 'confirmed'],
```

**Idem pour `ResetPasswordRequest.php` et `LoginRequest.php`.**

---

## Composant 3 — AccountLockoutGuard (Backend)

**Localisation :** `AuthController::login()` (pas de classe séparée — ajout inline)

**Responsabilités :**
- Bloquer l'accès après 5 tentatives échouées par email
- Réinitialiser le compteur après succès
- Retourner HTTP 429 avec le délai restant

**Implémentation de référence :**

```php
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

public function login(LoginRequest $request): JsonResponse
{
    // ---- Account Lockout ----
    $throttleKey = 'login.' . Str::lower($request->email);

    if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
        $seconds = RateLimiter::availableIn($throttleKey);
        $minutes = (int) ceil($seconds / 60);
        return response()->json([
            'message'     => "Trop de tentatives de connexion. Veuillez réessayer dans {$minutes} minute(s).",
            'retry_after' => $seconds,
        ], 429);
    }

    // ---- Vérification credentials ----
    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        RateLimiter::hit($throttleKey, 900); // decay = 15 minutes
        throw ValidationException::withMessages([
            'email' => ["L'adresse e-mail ou le mot de passe est incorrect."],
        ]);
    }

    // ---- Succès : réinitialiser le compteur ----
    RateLimiter::clear($throttleKey);

    $token = $user->createToken('api')->plainTextToken;

    return response()->json([
        'user'  => $this->formatUser($user),
        'token' => $token,
    ]);
}
```

**Mécanisme :** `RateLimiter` utilise le driver de cache configuré (`CACHE_STORE=file` en développement,
à migrer vers `redis` ou `database` si disponible en production O2switch).
Le cache `file` est suffisant pour ce cas d'usage (pas de session distribuée nécessaire).

**Clé de rate limit :** `login.{email_lowercase}` — ciblée par compte, pas par IP.
Cela protège les comptes contre les attaques par dictionnaire même depuis des IPs différentes.

---

## Configuration — Variables d'environnement

### Backend : `backend/.env` (gitignorée)

```dotenv
# Politique de mot de passe — ANSSI/CNIL
# Ces valeurs ne doivent PAS être committées dans le dépôt git
PASSWORD_MIN_LENGTH=10
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_DIGIT=true
PASSWORD_REQUIRE_SPECIAL=true
```

### Frontend : `frontend/.env.local` (gitignorée)

```dotenv
# Politique de mot de passe — doit correspondre aux valeurs backend
# Ces valeurs ne doivent PAS être committées dans le dépôt git
NEXT_PUBLIC_PASSWORD_MIN_LENGTH=10
NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE=true
NEXT_PUBLIC_PASSWORD_REQUIRE_LOWERCASE=true
NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT=true
NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL=true
```

### Documentation : `backend/.env.example` et `frontend/.env.example`

Les `.env.example` doivent documenter les clés (sans valeurs sensibles) avec un commentaire explicatif.
Exemple pour `.env.example` :

```dotenv
# --- Politique de mot de passe (ANSSI/CNIL) ---
# Définissez ces valeurs dans .env (jamais committé)
# Synchronisez avec NEXT_PUBLIC_PASSWORD_* dans frontend/.env.local
PASSWORD_MIN_LENGTH=10
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_DIGIT=true
PASSWORD_REQUIRE_SPECIAL=true
```

> **Contrainte de synchronisation :** les valeurs frontend et backend DOIVENT être identiques.
> Une incohérence (ex. frontend `min=10`, backend `min=12`) crée une situation où le frontend accepte
> un mdp que le backend rejette — frustration utilisateur et appel MySQL inutile.
> Cette synchronisation est manuelle, documentée dans les `.env.example`.

---

## Fichier de configuration Laravel

**Fichier :** `backend/config/password-policy.php` (versionné — contient uniquement la lecture env)

Ce fichier est versionné car il ne contient aucune valeur sensible — seulement des lectures `env()`
avec des valeurs par défaut. Les vraies valeurs restent dans `.env`.

```php
<?php
// config/password-policy.php
return [
    'min_length'        => (int)  env('PASSWORD_MIN_LENGTH',        10),
    'require_uppercase' => (bool) (env('PASSWORD_REQUIRE_UPPERCASE', 'true') !== 'false'),
    'require_lowercase' => (bool) (env('PASSWORD_REQUIRE_LOWERCASE', 'true') !== 'false'),
    'require_digit'     => (bool) (env('PASSWORD_REQUIRE_DIGIT',     'true') !== 'false'),
    'require_special'   => (bool) (env('PASSWORD_REQUIRE_SPECIAL',   'true') !== 'false'),
];
```

---

## Sécurité — Vérifications complémentaires

### Mots de passe jamais en clair

| Point de contrôle | Statut actuel | Action requise |
|-------------------|---------------|----------------|
| `User::$hidden` contient `'password'` | ✓ Déjà en place | Aucune |
| `formatUser()` ne retourne pas le mdp | ✓ Déjà en place | Aucune |
| `Hash::make()` sur `register` et `resetPassword` | ✓ Déjà en place | Aucune |
| `Log::error()` ne log pas `$request->password` | ✓ Log uniquement `$user->id` et message exception | Aucune |
| `console.log(values)` dans les formulaires | ✗ Non vérifié | Vérifier LoginForm, RegisterForm, ResetPasswordForm |
| `type="password"` par défaut sur les inputs | ✓ Toggle uniquement sur action utilisateur | Aucune |

### `dontFlash` Laravel

En Laravel 11 avec `bootstrap/app.php`, la configuration `dontFlash` s'applique uniquement aux
routes web avec sessions. Les routes API (`api/v1/*`) utilisent des réponses JSON pures — les champs
de requête ne sont jamais flashés en session. Aucune action requise.

---

## Traçabilité FR → Composants

| FR | Description | Composant(s) |
|----|-------------|-------------|
| FR-SEC-001 | Schéma Zod centralisé | `PasswordPolicyModule` |
| FR-SEC-002 | Validation frontend login | `PasswordPolicyModule` + `LoginForm.tsx` |
| FR-SEC-003 | Validation frontend inscription | `PasswordPolicyModule` + `RegisterForm.tsx` |
| FR-SEC-004 | Validation frontend reset | `PasswordPolicyModule` + `ResetPasswordForm.tsx` |
| FR-SEC-005 | Règle Laravel centralisée | `PasswordPolicyRule` + Form Requests |
| FR-SEC-006 | Config via env vars | `.env` + `config/password-policy.php` + `.env.example` |
| FR-SEC-007 | Account lockout | `AccountLockoutGuard` (AuthController) |
| FR-SEC-008 | Migration comptes existants | Message d'erreur avec lien reset (LoginForm) |

## Traçabilité NFR → Solutions

| NFR | Exigence | Solution | Validation |
|-----|----------|----------|------------|
| NFR-SEC-001 | Aucun mdp en clair | `hidden=['password']`, `formatUser()` sans mdp, logs sans mdp | Revue de code |
| NFR-SEC-002 | Zéro requête MySQL inutile | Zod bloquant avant `onSubmit` | DevTools Network |
| NFR-SEC-003 | Cohérence frontend/backend | Mêmes valeurs par défaut dans les deux `.env.example` | Test croisé |
| NFR-SEC-004 | Conformité ANSSI/CNIL | Min 10, upper, lower, digit, special | Smoke tests |

---

## Décisions architecturales et trade-offs

### Décision 1 : Validation login avec mêmes règles que l'inscription

**Choix :** Appliquer la politique complète sur le login (pas seulement min chars)

**Pour :**
- Pas de requête MySQL si le mdp est clairement invalide
- Cohérence UX entre tous les formulaires

**Contre :**
- ⚠️ Les utilisateurs avec anciens mots de passe (< 10 chars ou sans complexité) ne peuvent plus se connecter
- Ils doivent passer par "Mot de passe oublié" — flux fonctionnel et appliquant la nouvelle politique

**Atténuation :** communication préalable + lien "Mot de passe oublié" visible dans le message d'erreur Zod

---

### Décision 2 : Fichier `config/password-policy.php` versionné

**Choix :** Versionner le fichier de config Laravel (lecture `env()` + défauts) mais PAS les valeurs réelles

**Pour :**
- Compatible avec `php artisan config:cache` en production O2switch
- Les valeurs par défaut sont documentées dans le code
- Aucun secret exposé (le fichier ne contient que `env('KEY', default)`)

**Contre :**
- Les valeurs par défaut sont visibles dans le repo — acceptable car ce sont des standards ANSSI publics

---

### Décision 3 : RateLimiter par email (pas par IP)

**Choix :** Clé `'login.' . email` au lieu de `'login.' . ip`

**Pour :**
- Protège les comptes contre les attaques distribuées depuis plusieurs IPs (botnet)
- Plus précis : bloque uniquement l'accès à un compte spécifique

**Contre :**
- Un attaquant connaissant l'email peut verrouiller le compte d'un utilisateur légitime (DoS ciblé)
- Atténuation : 15 minutes de lockout seulement, l'utilisateur peut demander un reset de mdp

---

### Décision 4 : Variables NEXT_PUBLIC_* inlinées au build

**Choix :** Utiliser `process.env.NEXT_PUBLIC_*` (inliné au build time par Next.js)

**Pour :**
- Aucune requête réseau pour récupérer la politique — validation 100% locale
- Cohérent avec le fonctionnement standard de Next.js

**Contre :**
- Changer la politique nécessite un redéploiement frontend
- Acceptable : la politique de mdp change rarement (une ou deux fois par an max)

---

## Stratégie de migration des comptes existants

Les utilisateurs inscrits avant ce déploiement peuvent avoir des mots de passe ne respectant pas
la nouvelle politique (min 8 chars, pas de complexité).

**Plan de migration recommandé :**

1. **Avant déploiement (J-7)** — envoyer un email à tous les membres via la commande Artisan existante
   ou un mailing ciblé, les informant de la nécessité de mettre à jour leur mot de passe.

2. **Au déploiement (J0)** — le message d'erreur Zod sur le login inclut explicitement :
   > "Votre mot de passe ne respecte peut-être plus nos exigences de sécurité.
   > [Réinitialisez votre mot de passe →](/mot-de-passe-oublie)"

3. **Flux de reset** — `ResetPasswordForm` applique la nouvelle politique (FR-SEC-004), forçant
   les utilisateurs à choisir un mot de passe conforme lors de la réinitialisation.

4. **Après 30 jours** — supprimer la bannière temporaire si elle a été ajoutée.

---

## Fichiers à créer / modifier

| Fichier | Type | Action | FR/NFR |
|---------|------|--------|--------|
| `frontend/src/lib/password-policy.ts` | Nouveau | CRÉER | FR-SEC-001 |
| `frontend/src/components/features/auth/LoginForm.tsx` | Existant | MODIFIER | FR-SEC-002 |
| `frontend/src/components/features/auth/RegisterForm.tsx` | Existant | MODIFIER | FR-SEC-003 |
| `frontend/src/components/features/auth/ResetPasswordForm.tsx` | Existant | MODIFIER | FR-SEC-004 |
| `frontend/.env.example` | Existant | MODIFIER | FR-SEC-006 |
| `frontend/.env.local` | Existant/nouveau | MODIFIER (non committé) | FR-SEC-006 |
| `backend/config/password-policy.php` | Nouveau | CRÉER (versionné) | FR-SEC-006 |
| `backend/app/Rules/PasswordPolicy.php` | Nouveau | CRÉER | FR-SEC-005 |
| `backend/app/Http/Requests/Auth/LoginRequest.php` | Existant | MODIFIER | FR-SEC-005 |
| `backend/app/Http/Requests/Auth/RegisterRequest.php` | Existant | MODIFIER | FR-SEC-005 |
| `backend/app/Http/Requests/Auth/ResetPasswordRequest.php` | Existant | MODIFIER | FR-SEC-005 |
| `backend/app/Http/Controllers/Api/V1/AuthController.php` | Existant | MODIFIER | FR-SEC-007 |
| `backend/.env.example` | Existant | MODIFIER | FR-SEC-006 |
| `backend/.env` | Existant | MODIFIER (non committé) | FR-SEC-006 |

---

## Plan de vérification (smoke tests)

| Test | Étapes | Résultat attendu |
|------|--------|-----------------|
| 1. Validation login — mdp trop court | Login avec `"abc123A!"` (8 chars) | Erreur Zod, 0 requête réseau dans DevTools |
| 2. Validation login — sans majuscule | Login avec `"abcdef1@ok"` | Erreur Zod "au moins une majuscule" |
| 3. Validation login — sans spécial | Login avec `"Abcdefgh12"` | Erreur Zod "au moins un caractère spécial" |
| 4. Validation login — mdp conforme | Login avec `"MonMdp1@Securise"` | Requête envoyée, réponse 422 ou succès selon les credentials |
| 5. Account lockout | 6 tentatives échouées consécutives | 6e tentative → HTTP 429 + message avec délai |
| 6. Déblocage après succès | Succès après < 5 échecs | Connexion OK, compteur remis à zéro |
| 7. Inscription — mdp faible | Inscription avec `"password"` | Erreur Zod, 0 requête réseau |
| 8. Backend direct — mdp faible | `curl -X POST /api/v1/auth/register` avec mdp faible | HTTP 422 + message `password` |
| 9. Env var override | Changer `NEXT_PUBLIC_PASSWORD_MIN_LENGTH=12`, rebuild | Min 12 chars enforced |
| 10. Reset mdp | Flux complet oubli mdp avec nouveau mdp conforme | Nouveau token émis, anciens révoqués |
