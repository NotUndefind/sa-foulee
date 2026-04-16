# STORY-SEC-02 : Règle de validation Laravel `PasswordPolicy`

**Epic :** EPIC-SEC-01 — Politique de mot de passe centralisée
**Priorité :** Must Have
**Story Points :** 2
**Statut :** Terminé
**Assigné à :** Claude
**Créé le :** 2026-04-14
**Complété le :** 2026-04-14
**Sprint :** SEC Sprint 1

---

## User Story

En tant que **développeur**,
je veux **une règle Illuminate centralisée qui enforcore la politique de mot de passe côté serveur**,
afin de **garantir la défense en profondeur même si un appel API bypass la validation frontend**.

---

## Description

### Contexte

La validation des mots de passe est actuellement dispersée : `'min:8'` dans `RegisterRequest`,
`'min:8'` dans `ResetPasswordRequest`, et rien dans `LoginRequest`. Il n'existe aucune règle
partagée. L'objectif est de créer une classe `PasswordPolicy` implémentant `ValidationRule`
qui lit la configuration centralisée (STORY-SEC-01) et peut être réutilisée dans n'importe
quel Form Request.

### Périmètre

**Dans le périmètre :**
- Créer `backend/app/Rules/PasswordPolicy.php`
- La règle lit `config('password-policy.*')` (dépend de STORY-SEC-01)

**Hors périmètre :**
- Utilisation dans les Form Requests (STORY-SEC-03)
- Account lockout (STORY-SEC-04)

---

## Critères d'acceptation

- [x] `backend/app/Rules/PasswordPolicy.php` existe dans le namespace `App\Rules`
- [x] La classe implémente `Illuminate\Contracts\Validation\ValidationRule`
- [x] La méthode `validate()` vérifie la longueur minimale via `mb_strlen()` (supporte Unicode)
- [x] La méthode vérifie uppercase si `config('password-policy.require_uppercase')` est `true`
- [x] La méthode vérifie lowercase si `config('password-policy.require_lowercase')` est `true`
- [x] La méthode vérifie digit si `config('password-policy.require_digit')` est `true`
- [x] La méthode vérifie special char si `config('password-policy.require_special')` est `true`
- [x] Chaque validation échouée appelle `$fail()` avec un message en français
- [x] La règle retourne sur le premier échec (chaque `$fail()` suivi d'un `return`)
- [x] Classe auto-loadable via Composer (`class_exists()` confirmé)

---

## Notes techniques

### Fichier à créer : `backend/app/Rules/PasswordPolicy.php`

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PasswordPolicy implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $min     = (int)  config('password-policy.min_length',        10);
        $upper   = (bool) config('password-policy.require_uppercase',  true);
        $lower   = (bool) config('password-policy.require_lowercase',  true);
        $digit   = (bool) config('password-policy.require_digit',      true);
        $special = (bool) config('password-policy.require_special',    true);

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
            $fail('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*…).');
        }
    }
}
```

### Points d'attention

- Utiliser `mb_strlen()` et non `strlen()` pour les mots de passe contenant des caractères accentués
- La regex des caractères spéciaux doit être testée séparément pour éviter les erreurs d'échappement
- Chaque `$fail()` est suivi d'un `return` pour ne retourner qu'un message à la fois (meilleure UX)

### Test rapide en Tinker

```php
// Doit échouer : trop court
$rule = new \App\Rules\PasswordPolicy();
$rule->validate('password', 'abc', function($msg) { dump($msg); });
// → "Le mot de passe doit contenir au moins 10 caractères."

// Doit passer : conforme ANSSI
$rule->validate('password', 'MonMdp1@Safe', function($msg) { dump($msg); });
// → rien (pas d'appel à $fail)
```

---

## Dépendances

**Prérequis :**
- STORY-SEC-01 (config/password-policy.php doit exister pour que `config()` fonctionne)

**Bloque :**
- STORY-SEC-03 (Form Requests utilisent `new PasswordPolicy()`)

---

## Définition de Done

- [ ] `backend/app/Rules/PasswordPolicy.php` créé
- [ ] Règle testée en Tinker avec mdp conforme (→ aucun échec) et non conforme (→ message)
- [ ] Tous les critères de la politique sont vérifiés (5 règles)
- [ ] Messages d'erreur en français, clairs et sans révéler le mdp saisi

---

## Décomposition des points

- Implémentation `PasswordPolicy.php` : 1 pt
- Test / vérification regex + messages : 1 pt
- **Total : 2 points**

---

*Créé via BMAD Method — Phase 4 (Implementation Planning)*
