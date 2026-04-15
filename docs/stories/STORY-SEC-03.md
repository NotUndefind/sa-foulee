# STORY-SEC-03 : Mise à jour des Form Requests Laravel avec `PasswordPolicy`

**Epic :** EPIC-SEC-03 — Validation backend renforcée
**Priorité :** Must Have
**Story Points :** 2
**Statut :** Terminé
**Assigné à :** Non assigné
**Créé le :** 2026-04-14
**Sprint :** SEC Sprint 1

---

## User Story

En tant que **système**,
je veux **que les trois Form Requests d'authentification utilisent la règle `PasswordPolicy` centralisée**,
afin de **garantir que tout appel à l'API (y compris hors frontend) respecte la politique de mot de passe**.

---

## Description

### Contexte

Actuellement :
- `LoginRequest` : `'password' => ['required', 'string']` — aucune validation
- `RegisterRequest` : `'password' => ['required', 'string', 'min:8', 'confirmed']` — min 8 hardcodé
- `ResetPasswordRequest` : `'password' => ['required', 'string', 'min:8', 'confirmed']` — min 8 hardcodé

L'objectif est de remplacer `'min:8'` par `new PasswordPolicy()` dans les Form Requests de
registration et reset, et d'ajouter la validation au login (défense en profondeur contre les
appels API directs).

### Périmètre

**Dans le périmètre :**
- Modifier `LoginRequest.php` : ajouter `new PasswordPolicy()`
- Modifier `RegisterRequest.php` : remplacer `'min:8'` par `new PasswordPolicy()`
- Modifier `ResetPasswordRequest.php` : remplacer `'min:8'` par `new PasswordPolicy()`
- Mettre à jour les messages d'erreur (le message `password.min` ne s'appliquera plus)

**Hors périmètre :**
- La règle `PasswordPolicy` elle-même (STORY-SEC-02)
- Account lockout (STORY-SEC-04)

---

## Critères d'acceptation

- [x] `LoginRequest` importe et utilise `new PasswordPolicy()` dans le tableau `rules()`
- [x] `RegisterRequest` remplace `'min:8'` par `new PasswordPolicy()` (garde `'confirmed'`)
- [x] `ResetPasswordRequest` remplace `'min:8'` par `new PasswordPolicy()` (garde `'confirmed'`)
- [ ] `POST /api/v1/auth/register` avec `password: "abc"` → HTTP 422 avec message de la règle PasswordPolicy
- [ ] `POST /api/v1/auth/register` avec `password: "MonMdp1@Safe"` → succès (si email unique)
- [ ] `POST /api/v1/auth/login` avec `password: "a"` → HTTP 422 (la règle bloque avant même la requête DB)
- [x] Le message `password.min` est supprimé de `messages()` dans les trois fichiers (il ne correspond plus)
- [x] `'confirmed'` est maintenu sur register et reset (il vient après `new PasswordPolicy()`)

---

## Notes techniques

### `LoginRequest.php` — après modification

```php
use App\Rules\PasswordPolicy;

public function rules(): array
{
    return [
        'email'    => ['required', 'email'],
        'password' => ['required', 'string', new PasswordPolicy()],
    ];
}

public function messages(): array
{
    return [
        'email.required'    => "L'adresse e-mail est obligatoire.",
        'email.email'       => "L'adresse e-mail n'est pas valide.",
        'password.required' => 'Le mot de passe est obligatoire.',
        // Pas de password.min — le message vient de PasswordPolicy::validate()
    ];
}
```

### `RegisterRequest.php` — après modification

```php
use App\Rules\PasswordPolicy;

// Avant :
'password' => ['required', 'string', 'min:8', 'confirmed'],

// Après :
'password' => ['required', 'string', new PasswordPolicy(), 'confirmed'],
```

Supprimer la ligne `'password.min' => '...'` dans `messages()`.

### `ResetPasswordRequest.php` — après modification

```php
use App\Rules\PasswordPolicy;

// Avant :
'password' => ['required', 'string', 'min:8', 'confirmed'],

// Après :
'password' => ['required', 'string', new PasswordPolicy(), 'confirmed'],
```

Supprimer la ligne `'password.min' => '...'` dans `messages()`.

### Ordre des règles

L'ordre `['required', 'string', new PasswordPolicy(), 'confirmed']` est intentionnel :
- `required` → vérifie que le champ existe
- `string` → vérifie le type
- `new PasswordPolicy()` → vérifie la complexité
- `confirmed` → vérifie la confirmation (uniquement sur register et reset)

---

## Dépendances

**Prérequis :**
- STORY-SEC-01 (config/password-policy.php)
- STORY-SEC-02 (App\Rules\PasswordPolicy)

**Bloque :** Aucune

---

## Définition de Done

- [x] Les 3 Form Requests importent `App\Rules\PasswordPolicy`
- [x] `'min:8'` supprimé de RegisterRequest et ResetPasswordRequest
- [x] `new PasswordPolicy()` ajouté dans les 3 fichiers
- [x] Messages `password.min` supprimés des méthodes `messages()`
- [ ] Test API : `POST /register` avec mdp faible → 422 avec message PasswordPolicy
- [ ] Test API : `POST /login` avec mdp faible → 422 (avant même la requête DB)

---

## Décomposition des points

- Modification des 3 Form Requests : 1 pt
- Tests API (curl ou Postman) : 1 pt
- **Total : 2 points**

---

*Créé via BMAD Method — Phase 4 (Implementation Planning)*
