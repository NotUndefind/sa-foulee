# STORY-SEC-05 : Module Zod `password-policy.ts` + config env frontend

**Epic :** EPIC-SEC-01 — Politique de mot de passe centralisée
**Priorité :** Must Have
**Story Points :** 2
**Statut :** À faire
**Assigné à :** Non assigné
**Créé le :** 2026-04-14
**Sprint :** SEC Sprint 1

---

## User Story

En tant que **développeur frontend**,
je veux **un schéma Zod centralisé piloté par des variables d'environnement**,
afin de **partager la même politique de mot de passe entre tous les formulaires sans dupliquer les règles**.

---

## Description

### Contexte

Chaque formulaire d'authentification (`LoginForm`, `RegisterForm`, `ResetPasswordForm`) définit
actuellement son propre schéma Zod avec des règles différentes et incohérentes. L'objectif est
de créer un module `password-policy.ts` qui exporte un schéma Zod unique, basé sur des variables
`NEXT_PUBLIC_PASSWORD_*` lues depuis l'environnement Next.js.

### Périmètre

**Dans le périmètre :**
- Créer `frontend/src/lib/password-policy.ts`
- Ajouter les variables `NEXT_PUBLIC_PASSWORD_*` dans `frontend/.env.local`
- Documenter dans `frontend/.env.example`

**Hors périmètre :**
- Modification des formulaires (STORY-SEC-06 et STORY-SEC-07)
- Indicateur visuel de force du mot de passe (hors périmètre PRD)

### Comportement des `NEXT_PUBLIC_*` dans Next.js

Ces variables sont **inlinées au build time** par Next.js (via Webpack/Turbopack). Leur valeur
est figée au moment du `next build`. Modifier ces variables nécessite un redéploiement frontend.
Ce comportement est intentionnel et documenté dans l'architecture.

---

## Critères d'acceptation

- [ ] Le fichier `frontend/src/lib/password-policy.ts` existe et est versionné
- [ ] Il exporte `passwordSchema` (schéma Zod pour un champ mot de passe)
- [ ] Il exporte `PASSWORD_SPECIAL_CHARS` (string listant les caractères spéciaux acceptés)
- [ ] Le schéma lit `NEXT_PUBLIC_PASSWORD_MIN_LENGTH` (défaut : 10)
- [ ] Le schéma vérifie uppercase si `NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE !== 'false'`
- [ ] Le schéma vérifie lowercase si `NEXT_PUBLIC_PASSWORD_REQUIRE_LOWERCASE !== 'false'`
- [ ] Le schéma vérifie digit si `NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT !== 'false'`
- [ ] Le schéma vérifie special si `NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL !== 'false'`
- [ ] `frontend/.env.local` contient les 5 variables `NEXT_PUBLIC_PASSWORD_*`
- [ ] `frontend/.env.example` documente les 5 variables avec commentaire

---

## Notes techniques

### Fichier à créer : `frontend/src/lib/password-policy.ts`

```typescript
import { z } from 'zod'

// Valeurs lues au module-load — inlinées par Next.js au build time
const MIN_LENGTH    = Number(process.env.NEXT_PUBLIC_PASSWORD_MIN_LENGTH    ?? 10)
const REQ_UPPERCASE = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE    !== 'false'
const REQ_LOWERCASE = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_LOWERCASE    !== 'false'
const REQ_DIGIT     = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT        !== 'false'
const REQ_SPECIAL   = process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL      !== 'false'

export const PASSWORD_SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;\':",./<>?'

/**
 * Schéma Zod pour un champ mot de passe soumis à la politique saFoulee.
 * À importer dans LoginForm, RegisterForm, ResetPasswordForm.
 * Les règles dépendent des variables NEXT_PUBLIC_PASSWORD_*.
 */
export const passwordSchema = z
  .string()
  .min(1, 'Le mot de passe est obligatoire.')
  .min(MIN_LENGTH, `Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`)
  .superRefine((val, ctx) => {
    if (REQ_UPPERCASE && !/[A-Z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le mot de passe doit contenir au moins une lettre majuscule.',
      })
    }
    if (REQ_LOWERCASE && !/[a-z]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le mot de passe doit contenir au moins une lettre minuscule.',
      })
    }
    if (REQ_DIGIT && !/[0-9]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le mot de passe doit contenir au moins un chiffre.',
      })
    }
    if (REQ_SPECIAL && !/[!@#$%^&*()\-_=+\[\]{}|;':",.\\/<>?\\\\]/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Le mot de passe doit contenir au moins un caractère spécial (${PASSWORD_SPECIAL_CHARS}).`,
      })
    }
  })
```

### Ajout dans `frontend/.env.local` (non committé)

```dotenv
# Politique de mot de passe — doit correspondre aux valeurs backend (PASSWORD_*)
NEXT_PUBLIC_PASSWORD_MIN_LENGTH=10
NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE=true
NEXT_PUBLIC_PASSWORD_REQUIRE_LOWERCASE=true
NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT=true
NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL=true
```

### Ajout dans `frontend/.env.example` (versionné)

```dotenv
# --- Politique de mot de passe (ANSSI/CNIL) ---
# Synchronisez avec PASSWORD_* dans backend/.env
# Ces valeurs sont inlinées au build time par Next.js — un redéploiement est nécessaire pour les changer
NEXT_PUBLIC_PASSWORD_MIN_LENGTH=10
NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE=true
NEXT_PUBLIC_PASSWORD_REQUIRE_LOWERCASE=true
NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT=true
NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL=true
```

### Test rapide en développement

```typescript
// Dans un composant ou la console Next.js DevTools
import { passwordSchema } from '@/lib/password-policy'

// Doit échouer (trop court)
passwordSchema.safeParse('abc123A!')
// → { success: false, error: { issues: [{ message: 'Le mot de passe doit contenir au moins 10 caractères.' }] } }

// Doit réussir
passwordSchema.safeParse('MonMdp1@Securise')
// → { success: true, data: 'MonMdp1@Securise' }
```

---

## Dépendances

**Prérequis :** Aucune (indépendant du backend)

**Bloque :**
- STORY-SEC-06 (LoginForm importe `passwordSchema`)
- STORY-SEC-07 (RegisterForm + ResetPasswordForm importent `passwordSchema`)

---

## Définition de Done

- [ ] `frontend/src/lib/password-policy.ts` créé et versionné
- [ ] `frontend/.env.local` mis à jour avec les 5 variables (non committé)
- [ ] `frontend/.env.example` mis à jour avec documentation
- [ ] `passwordSchema.safeParse('abc')` retourne une erreur
- [ ] `passwordSchema.safeParse('MonMdp1@Securise')` retourne `success: true`
- [ ] `.gitignore` frontend vérifié (`.env.local` bien ignoré)
- [ ] TypeScript : aucune erreur de type sur les exports

---

## Décomposition des points

- Création `password-policy.ts` avec schéma Zod : 1 pt
- Config env frontend (`.env.local` + `.env.example`) : 1 pt
- **Total : 2 points**

---

*Créé via BMAD Method — Phase 4 (Implementation Planning)*
