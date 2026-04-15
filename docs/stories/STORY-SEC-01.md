# STORY-SEC-01 : Configuration de la politique de mot de passe (backend)

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
je veux **configurer la politique de mot de passe via des variables d'environnement gitignorées**,
afin de **pouvoir modifier les critères de sécurité sans toucher au code source ni exposer la politique dans le dépôt**.

---

## Description

### Contexte

Actuellement, la seule règle sur le mot de passe dans Laravel est `'min:8'` hardcodée dans
`RegisterRequest.php`. Cette valeur est visible dans le dépôt git et ne peut pas être modifiée
sans un commit. L'objectif est de déplacer toute la configuration de la politique vers des variables
d'environnement, lues via un fichier de configuration Laravel versionnés (qui ne contient que des
appels `env()`, pas les valeurs réelles).

### Périmètre

**Dans le périmètre :**
- Créer `backend/config/password-policy.php` (versionné — contient uniquement des `env()`)
- Ajouter les variables `PASSWORD_*` dans `backend/.env` (non committé)
- Documenter les variables dans `backend/.env.example` (versionné)

**Hors périmètre :**
- Utilisation de la config dans les Form Requests (STORY-SEC-02, STORY-SEC-03)
- Account lockout (STORY-SEC-04)
- Frontend (STORY-SEC-05 à SEC-07)

---

## Critères d'acceptation

- [x] Le fichier `backend/config/password-policy.php` existe et est versionné
- [x] Il expose les clés : `min_length`, `require_uppercase`, `require_lowercase`, `require_digit`, `require_special`
- [x] Chaque clé lit sa valeur depuis `env()` avec une valeur par défaut conforme ANSSI (min=10, tout à true)
- [x] `backend/.env` contient les 5 variables `PASSWORD_*` avec les valeurs effectives
- [x] `backend/.env.example` documente les 5 variables avec un commentaire indiquant qu'elles ne doivent pas être committées
- [x] `php artisan config:cache` fonctionne sans erreur après ajout du fichier
- [x] `.env` vérifié comme gitignored (`git check-ignore` ligne 9 du .gitignore racine)

---

## Notes techniques

### Fichier à créer : `backend/config/password-policy.php`

```php
<?php

return [
    'min_length'        => (int)  env('PASSWORD_MIN_LENGTH',        10),
    'require_uppercase' => (bool) (env('PASSWORD_REQUIRE_UPPERCASE', 'true') !== 'false'),
    'require_lowercase' => (bool) (env('PASSWORD_REQUIRE_LOWERCASE', 'true') !== 'false'),
    'require_digit'     => (bool) (env('PASSWORD_REQUIRE_DIGIT',     'true') !== 'false'),
    'require_special'   => (bool) (env('PASSWORD_REQUIRE_SPECIAL',   'true') !== 'false'),
];
```

> ⚠️ Ne pas utiliser `filter_var($value, FILTER_VALIDATE_BOOLEAN)` — le cast `!== 'false'` est
> suffisant et évite les dépendances de comportement PHP.

### Ajout dans `backend/.env` (non committé)

```dotenv
# Politique de mot de passe — ANSSI/CNIL
PASSWORD_MIN_LENGTH=10
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_DIGIT=true
PASSWORD_REQUIRE_SPECIAL=true
```

### Ajout dans `backend/.env.example` (versionné)

```dotenv
# --- Politique de mot de passe (ANSSI/CNIL) ---
# Configurez ces valeurs dans .env (jamais committé)
# Synchronisez avec NEXT_PUBLIC_PASSWORD_* dans frontend/.env.local
PASSWORD_MIN_LENGTH=10
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_DIGIT=true
PASSWORD_REQUIRE_SPECIAL=true
```

### Commande de vérification

```bash
php artisan config:clear
php artisan tinker --execute="var_dump(config('password-policy'));"
```

Résultat attendu :
```
array(5) {
  ["min_length"] => int(10)
  ["require_uppercase"] => bool(true)
  ["require_lowercase"] => bool(true)
  ["require_digit"] => bool(true)
  ["require_special"] => bool(true)
}
```

---

## Dépendances

**Prérequis :** Aucune

**Bloque :**
- STORY-SEC-02 (PasswordPolicy Rule lit `config('password-policy.*')`)
- STORY-SEC-04 (Account Lockout — aucun blocage direct mais cohérence)

---

## Définition de Done

- [x] `backend/config/password-policy.php` créé et versionné
- [x] Variables ajoutées dans `backend/.env` (non committé)
- [x] `backend/.env.example` mis à jour avec documentation
- [x] `php artisan config:cache` sans erreur
- [x] Fichier PHP valide (syntaxe vérifiée)
- [x] `.gitignore` vérifié — `.env` bien ignoré (git check-ignore confirmé)

---

## Décomposition des points

- Création `config/password-policy.php` : 1 pt
- Mise à jour `.env` + `.env.example` : 1 pt
- **Total : 2 points**

---

*Créé via BMAD Method — Phase 4 (Implementation Planning)*
