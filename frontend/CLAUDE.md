# saFoulée — Frontend : Charte graphique & tokens CSS

Instructions spécifiques au dossier `frontend/`. Complètent le `CLAUDE.md` racine.

---

## Tokens de couleur Tailwind v4 — règle absolue

### Comment ça fonctionne

`globals.css` déclare toutes les couleurs via `@theme inline`. Tailwind v4 génère
**automatiquement** les classes utilitaires `bg-*`, `text-*`, `border-*`, `ring-*`,
`accent-*`, `hover:bg-*`, etc. à partir de ces variables.

```css
/* globals.css — source unique de vérité */
@theme inline {
  --color-primary:      #fb3936;  → bg-primary, text-primary, border-primary…
  --color-primary-dark: #d42f2d;  → bg-primary-dark, hover:bg-primary-dark…
  --color-primary-light:#fd6563;  → bg-primary-light…
  --color-accent:       #d42f2d;  → bg-accent (stepper)
  --color-sidebar:      #c0302e;  → bg-sidebar…
  --color-sf-*          …         → bg-sf-*, text-sf-*…
}
```

### Token canonique : `primary`

La couleur rouge officielle `#FB3936` s'utilise **toujours** via le token `primary` :

```tsx
// ✅ Correct
<button className="bg-primary hover:bg-primary-dark text-white">
<input className="focus:border-primary focus:ring-2 focus:ring-primary/20">
<div className="border-primary bg-primary/5 text-primary">
<div className="bg-primary text-white">  {/* date badge */}

// ❌ Interdit — alias supprimé, ne génère plus de CSS
<button className="bg-brand hover:bg-brand-dark">
<input className="focus:border-brand focus:ring-brand/20">
```

### Tokens existants et leur usage

| Token Tailwind     | Valeur hex | Usage principal                       |
| ------------------ | ---------- | ------------------------------------- |
| `bg-primary`       | `#FB3936`  | CTA, boutons primaires, active states |
| `bg-primary-dark`  | `#D42F2D`  | Hover boutons, états actifs           |
| `bg-primary-light` | `#FD6563`  | Accents légers                        |
| `bg-accent`        | `#D42F2D`  | Stepper étapes complétées             |
| `bg-sidebar`       | `#C0302E`  | Fond sidebar dashboard                |
| `bg-sf-cream`      | `#FAFAFA`  | Fond pages principales                |
| `bg-sf-cream-soft` | `#F8F8F8`  | Fond dashboard                        |
| `bg-sf-parchment`  | `#E5E0E0`  | Bordures, séparateurs                 |
| `bg-sf-terra`      | `#FB3936`  | Alias landing page (préférer primary) |
| `bg-sf-bark-red`   | `#C0302E`  | Sidebar, titres forts                 |
| `text-sf-bark`     | `#1A1A1A`  | Texte très foncé                      |
| `text-sf-text`     | `#2C2C2C`  | Texte principal                       |
| `text-sf-muted`    | `#7F7F7F`  | Texte secondaire                      |

---

## Règle critique : ne jamais créer d'alias de couleur

### Pourquoi l'alias `brand` a cassé les boutons

En avril 2026, un refactoring a supprimé `--color-brand` du `@theme inline`. Pendant
la période d'absence, Tailwind ne pouvait pas générer `bg-brand`. Le cache dev
(`.next`) figé à cette période a servi du CSS sans `bg-brand` → boutons transparents
avec texte blanc = **invisibles**.

**La leçon :** tout alias (`brand`, `secondary`, `cta`…) crée un second token qui
peut diverger ou disparaître. **Un seul token par rôle sémantique.**

### Ce qu'il ne faut jamais faire

```css
/* ❌ NE PAS AJOUTER dans globals.css */
@theme inline {
  --color-brand: #fb3936; /* doublon de primary */
  --color-brand-dark: #d42f2d; /* doublon de primary-dark */
  --color-cta: #fb3936; /* autre alias inutile */
}
```

```tsx
// ❌ NE PAS UTILISER en TSX — ces classes n'existent pas
className = 'bg-brand hover:bg-brand-dark'
className = 'text-brand border-brand'
className = 'focus:border-brand focus:ring-brand/20'
```

---

## Cache Tailwind v4 — diagnostic en cas de bouton invisible

Si un bouton avec `text-white` semble invisible (fond transparent) :

1. **Vérifier** que la variable est dans `@theme inline` de `globals.css`
2. **Vérifier** que la classe est bien générée :
   ```bash
   grep "bg-primary" frontend/.next/dev/static/chunks/src_app_globals_css_*.css
   ```
3. Si absent → **supprimer le cache et redémarrer** :
   ```bash
   rm -rf frontend/.next && cd frontend && npm run dev
   ```

---

## Boutons primaires — pattern standard

```tsx
{
  /* Bouton primaire plein */
}
;<button className="bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
  Action
</button>

{
  /* Bouton avec gradient (landing / header) */
}
;<button
  className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition"
  style={{ background: 'linear-gradient(135deg, #FB3936 0%, #D42F2D 100%)' }}
>
  Action
</button>

{
  /* Bouton ghost */
}
;<button className="sF-btn-ghost">Action</button>

{
  /* Lien texte rouge */
}
;<span className="text-primary hover:underline">Lien</span>
```

## Inputs avec focus rouge — pattern standard

```tsx
const inputCls =
  'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
```

---

## Classes utilitaires globales (globals.css)

Ne pas recréer ces classes, elles existent déjà :

| Classe          | Usage                                    |
| --------------- | ---------------------------------------- |
| `.sF-btn`       | Bouton primaire landing (rouge, rounded) |
| `.sF-btn-ghost` | Bouton ghost (bordure rouge)             |
| `.sF-card`      | Card avec hover rouge subtil             |
| `.sF-reveal`    | Animation scroll reveal                  |
| `.sF-tag`       | Tag/badge hero                           |

---

## Ne pas modifier

- `.next/types/validator.ts` — erreur TypeScript pré-existante
- `AdminUsersPage.tsx` — avertissements TypeScript pré-existants
