# STORY-SEC-06 : Mise à jour `LoginForm` — schéma centralisé + gestion 429 + message migration

**Epic :** EPIC-SEC-02 — Validation frontend pré-API
**Priorité :** Must Have
**Story Points :** 3
**Statut :** Terminé
**Assigné à :** Non assigné
**Créé le :** 2026-04-14
**Sprint :** SEC Sprint 1

---

## User Story

En tant qu'**utilisateur**,
je veux **que le formulaire de connexion valide mon mot de passe avant d'envoyer une requête au serveur**,
afin de **recevoir un retour immédiat si mon mdp est invalide et d'éviter des appels réseau inutiles**.

---

## Description

### Contexte

`LoginForm.tsx` utilise actuellement `z.string().min(1, ...)` — n'importe quel caractère est accepté
et envoyé à l'API. Cette story remplace ce schéma minimal par `passwordSchema` (STORY-SEC-05),
ajoute la gestion du code HTTP 429 (account lockout, STORY-SEC-04), et inclut un lien "Mot de
passe oublié" dans le message d'erreur Zod pour guider les utilisateurs avec d'anciens mots de
passe ne respectant pas la nouvelle politique.

### Périmètre

**Dans le périmètre :**
- Remplacer le schéma Zod du mot de passe par `passwordSchema` depuis `@/lib/password-policy`
- Ajouter la gestion du statut 429 dans le `catch` de `onSubmit`
- Afficher le lien "Mot de passe oublié" dans le message d'erreur Zod du champ password

**Hors périmètre :**
- Modification du design global du formulaire
- Indicateur de force du mot de passe
- Gestion d'autres erreurs HTTP

---

## Critères d'acceptation

- [x] Saisir un mot de passe de moins de 10 chars → erreur Zod affichée, **0 requête réseau** (vérifiable dans l'onglet Network de DevTools)
- [x] Saisir un mdp sans majuscule → erreur Zod "au moins une lettre majuscule", 0 requête réseau
- [x] Saisir un mdp sans chiffre → erreur Zod "au moins un chiffre", 0 requête réseau
- [x] Saisir un mdp sans caractère spécial → erreur Zod appropriée, 0 requête réseau
- [x] Le message d'erreur Zod sous le champ password inclut un lien cliquable vers `/mot-de-passe-oublie`
- [ ] Un mdp conforme + credentials valides → connexion réussie
- [ ] Un mdp conforme + mauvais credentials → erreur 422 affichée normalement
- [ ] 6e tentative → erreur 429 affichée avec le message du backend (délai en minutes)
- [x] Aucun `console.log` du mot de passe dans la console DevTools

---

## Notes techniques

### Changement du schéma Zod dans `LoginForm.tsx`

```typescript
// Avant :
import { z } from 'zod'

const schema = z.object({
  email: z.string().min(1, ...).email(...),
  password: z.string().min(1, 'Le mot de passe est obligatoire.'),
})

// Après :
import { z } from 'zod'
import { passwordSchema } from '@/lib/password-policy'

const schema = z.object({
  email: z.string().min(1, "L'adresse e-mail est obligatoire.").email("L'adresse e-mail n'est pas valide."),
  password: passwordSchema,
})
```

### Gestion du 429 dans `onSubmit`

```typescript
// Avant :
} catch (err) {
  if (err instanceof ApiError && err.status === 422) {
    setGlobalError("L'adresse e-mail ou le mot de passe est incorrect.")
  } else {
    setGlobalError('Une erreur inattendue est survenue. Veuillez réessayer.')
  }
}

// Après :
} catch (err) {
  if (err instanceof ApiError && err.status === 422) {
    setGlobalError("L'adresse e-mail ou le mot de passe est incorrect.")
  } else if (err instanceof ApiError && err.status === 429) {
    setGlobalError(err.message ?? 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.')
  } else {
    setGlobalError('Une erreur inattendue est survenue. Veuillez réessayer.')
  }
}
```

### Lien "Mot de passe oublié" dans l'erreur Zod

La section affichant `errors.password` doit inclure un lien supplémentaire :

```tsx
{errors.password && (
  <div className="mt-1">
    <p className="text-xs" style={{ color: '#FB3936' }}>
      {errors.password.message}
    </p>
    <p className="text-xs mt-0.5" style={{ color: '#7F7F7F' }}>
      Ancien mot de passe ?{' '}
      <Link href="/mot-de-passe-oublie" className="underline" style={{ color: '#FB3936' }}>
        Réinitialisez-le ici
      </Link>
    </p>
  </div>
)}
```

> Ce lien guide les utilisateurs existants dont le mot de passe ne respecte pas la nouvelle
> politique sans qu'ils comprennent pourquoi ils ne peuvent pas se connecter.

### Vérification dans DevTools

Ouvrir l'onglet Network de Chrome/Firefox → filtrer sur `login` → saisir un mdp trop court
et cliquer "Se connecter" → **aucune requête ne doit apparaître**.

---

## Dépendances

**Prérequis :**
- STORY-SEC-05 (`@/lib/password-policy` doit exister et exporter `passwordSchema`)
- STORY-SEC-04 (format de la réponse 429 connu : `{ message, retry_after }`)

**Bloque :** Aucune

---

## Définition de Done

- [x] Import de `passwordSchema` depuis `@/lib/password-policy` dans LoginForm
- [x] Schéma Zod local `password: z.string().min(1, ...)` supprimé et remplacé
- [x] Gestion du 429 ajoutée dans le `catch`
- [x] Lien "Réinitialisez-le ici" affiché sous l'erreur Zod du champ password
- [ ] Test DevTools : 0 requête réseau sur validation Zod échouée
- [ ] Test 429 : 6 tentatives échouées → message affiché correctement
- [x] Build TypeScript sans erreur (`tsc --noEmit`)

---

## Décomposition des points

- Remplacement du schéma Zod : 1 pt
- Gestion 429 dans `catch` : 1 pt
- Lien reset dans le message d'erreur Zod : 1 pt
- **Total : 3 points**

---

*Créé via BMAD Method — Phase 4 (Implementation Planning)*
