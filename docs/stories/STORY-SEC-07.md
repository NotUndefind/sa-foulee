# STORY-SEC-07 : Mise à jour `RegisterForm` et `ResetPasswordForm` — schéma centralisé

**Epic :** EPIC-SEC-02 — Validation frontend pré-API
**Priorité :** Must Have
**Story Points :** 2
**Statut :** À faire
**Assigné à :** Non assigné
**Créé le :** 2026-04-14
**Sprint :** SEC Sprint 1

---

## User Story

En tant qu'**utilisateur**,
je veux **que les formulaires d'inscription et de réinitialisation de mot de passe appliquent la politique de sécurité dès la saisie**,
afin de **ne pas envoyer de requête au serveur pour un mot de passe manifestement non conforme**.

---

## Description

### Contexte

- `RegisterForm.tsx` utilise `z.string().min(8, ...)` — hardcodé, pas de complexité
- `ResetPasswordForm.tsx` utilise `z.string().min(8, ...)` — idem

Les deux formulaires doivent remplacer leur règle Zod sur le mot de passe par `passwordSchema`
depuis `@/lib/password-policy` (STORY-SEC-05). La vérification de confirmation
(`password === password_confirmation`) est conservée dans les deux cas.

### Périmètre

**Dans le périmètre :**
- Modifier `RegisterForm.tsx` : remplacer `z.string().min(8, ...)` par `passwordSchema`
- Modifier `ResetPasswordForm.tsx` : même remplacement
- Conserver la vérification `.refine()` de confirmation dans les deux fichiers

**Hors périmètre :**
- Modification du design
- Indicateur de force
- Gestion d'erreurs HTTP supplémentaires

---

## Critères d'acceptation

**RegisterForm :**
- [ ] Saisir un mdp de moins de 10 chars → erreur Zod, **0 requête réseau**
- [ ] Saisir un mdp sans majuscule → erreur Zod, 0 requête réseau
- [ ] Saisir un mdp sans chiffre → erreur Zod, 0 requête réseau
- [ ] Saisir un mdp sans caractère spécial → erreur Zod, 0 requête réseau
- [ ] Confirmation ne correspondant pas → erreur Zod "La confirmation ne correspond pas"
- [ ] Mdp conforme + confirmation correspondante → requête envoyée normalement

**ResetPasswordForm :**
- [ ] Mêmes règles de complexité que RegisterForm (Zod bloquant)
- [ ] Confirmation ne correspondant pas → erreur Zod maintenue
- [ ] Mdp conforme + confirmation correspondante → requête envoyée

**Commun :**
- [ ] Aucun `console.log` du mot de passe dans la console
- [ ] Build TypeScript sans erreur

---

## Notes techniques

### `RegisterForm.tsx` — changement du schéma

```typescript
// Avant :
import { z } from 'zod'

const schema = z.object({
  // ...
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
  password_confirmation: z.string().min(1, 'Veuillez confirmer votre mot de passe.'),
  // ...
}).refine((data) => data.password === data.password_confirmation, {
  path: ['password_confirmation'],
  message: 'La confirmation du mot de passe ne correspond pas.',
})

// Après :
import { z } from 'zod'
import { passwordSchema } from '@/lib/password-policy'

const schema = z.object({
  first_name: z.string().min(1, 'Le prénom est obligatoire.').max(50),
  last_name: z.string().min(1, 'Le nom est obligatoire.').max(50),
  email: z.string().min(1, "L'adresse e-mail est obligatoire.").email("L'adresse e-mail n'est pas valide."),
  password: passwordSchema,
  password_confirmation: z.string().min(1, 'Veuillez confirmer votre mot de passe.'),
  consent: z.boolean().refine((v) => v === true, {
    message: "Vous devez accepter les conditions d'utilisation.",
  }),
}).refine((data) => data.password === data.password_confirmation, {
  path: ['password_confirmation'],
  message: 'La confirmation du mot de passe ne correspond pas.',
})
```

### `ResetPasswordForm.tsx` — changement du schéma

Le fichier `ResetPasswordForm.tsx` a une structure similaire à `RegisterForm` pour la partie
mot de passe. Appliquer le même remplacement :

```typescript
// Avant :
password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),

// Après :
import { passwordSchema } from '@/lib/password-policy'
// ...
password: passwordSchema,
```

Conserver le `.refine()` de confirmation.

### Point d'attention : `password_confirmation` dans RegisterForm

Le champ `password_confirmation` reste `z.string().min(1, ...)` — il ne doit PAS utiliser
`passwordSchema` car il valide uniquement que le champ est rempli, la correspondance étant
vérifiée par le `.refine()` de niveau objet.

### Vérification du placeholder

Mettre à jour le placeholder du champ `password` si nécessaire.

Actuellement : `"8 caractères minimum"` → Après : `"10 caractères minimum"` (ou supprimer si
`passwordSchema` fournit des messages d'erreur clairs sans placeholder).

---

## Dépendances

**Prérequis :**
- STORY-SEC-05 (`@/lib/password-policy` doit exister)

**Bloque :** Aucune

---

## Définition de Done

- [ ] `RegisterForm.tsx` : import `passwordSchema` + remplacement du schéma Zod password
- [ ] `ResetPasswordForm.tsx` : idem
- [ ] `.refine()` de confirmation conservé dans les deux fichiers
- [ ] Placeholder `"8 caractères minimum"` mis à jour si présent
- [ ] Test DevTools Register : 0 requête réseau avec mdp faible
- [ ] Test DevTools Reset : 0 requête réseau avec mdp faible
- [ ] Build TypeScript sans erreur (`next build` ou `tsc --noEmit`)

---

## Décomposition des points

- Modification `RegisterForm.tsx` : 1 pt
- Modification `ResetPasswordForm.tsx` : 1 pt
- **Total : 2 points**

---

*Créé via BMAD Method — Phase 4 (Implementation Planning)*
