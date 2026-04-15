# saFoulée — Conventions Claude Code

Instructions projet pour Claude Code. Ces règles s'appliquent à **tout le codebase** (frontend Next.js et backend Laravel).

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14, TypeScript, App Router |
| Styles | Tailwind CSS v4 + styles inline (règles ci-dessous) |
| Backend | Laravel 11, PHP 8.2+ |
| BDD | MySQL 8.0 |

---

## Convention : Inline styles vs Tailwind CSS

### Principe général

| Cas | Approche |
|-----|----------|
| Valeur **statique** | Classe Tailwind (arbitraire `[...]` si hors échelle) |
| Valeur **dynamique** (prop, variable, donnée API) | `style={{}}` |
| Propriété CSS **non couverte** par Tailwind | `style={{}}` |

### Règle critique — jamais de `display` / visibilité en inline

Les propriétés `display`, `visibility`, `opacity` ne doivent **jamais** être définies en style inline si l'élément utilise aussi un utilitaire Tailwind de visibilité ou de layout.

**Pourquoi :** les styles inline ont une spécificité CSS maximale et écrasent systématiquement les classes Tailwind, y compris dans les media queries. Un `display: 'flex'` inline rend `md:hidden` inopérant.

```tsx
// ❌ display inline écrase md:hidden — le bouton s'affiche toujours
<Link className="md:hidden" style={{ display: 'flex', alignItems: 'center' }}>

// ✅ display géré par Tailwind — la visibilité responsive fonctionne
<Link className="md:hidden flex items-center">
```

### Règle responsive — cohérence des utilitaires Tailwind

Si un élément utilise `hidden`, `block`, `flex`, `grid`, `md:hidden`, `md:block`, `md:flex`, `lg:flex`, etc., **toutes** ses propriétés de layout/display doivent passer par des classes Tailwind.

```tsx
// ❌ mélange incohérent
<div className="hidden md:flex" style={{ display: 'flex', gap: '1rem' }}>

// ✅ tout en Tailwind
<div className="hidden md:flex gap-4">

// ✅ gap dynamique → inline acceptable si la valeur vient d'une variable
<div className="hidden md:flex" style={{ gap: dynamicGap }}>
```

### Cas d'usage valides pour le style inline

```tsx
// 1. Valeur calculée depuis des props / données API
<div style={{ color: event.color, background: `${accent}14` }}>

// 2. Vendor prefixes non gérés par Tailwind
<header style={{ WebkitBackdropFilter: 'blur(20px)', backdropFilter: 'blur(20px)' }}>

// 3. Propriétés SVG et animations spécifiques
<path style={{ strokeDasharray: 900 }} />
<div style={{ animationDelay: `${index * 0.1}s` }}>

// 4. Valeurs interpolées dynamiques
<div style={{ width: `${progress}%`, transform: `translateX(${offset}px)` }}>

// 5. clamp() et calc() complexes avec variables runtime
<h1 style={{ fontSize: `clamp(${minSize}, ${fluidSize}, ${maxSize})` }}>
```

### Valeurs arbitraires Tailwind v4

Pour les valeurs statiques non standards, préférer la syntaxe arbitraire plutôt que le style inline :

```tsx
// ❌ inline pour valeur statique
<button style={{ borderRadius: '100px', background: '#FB3936', minHeight: '44px' }}>

// ✅ Tailwind arbitraire
<button className="rounded-[100px] bg-[#FB3936] min-h-[44px]">
```

---

## Conventions TypeScript / React

- Composants en **PascalCase** : `EventCard.tsx`
- Fonctions et variables en **camelCase**
- Types dans `frontend/src/types/index.ts`
- Pas de `any` TypeScript
- Préférer les Server Components (pas de `'use client'` sauf si interaction utilisateur nécessaire)

## Conventions CSS / Design

- Palette définie dans `frontend/src/app/globals.css` — utiliser les variables CSS `--color-primary`, `--color-sf-*`
- Classes utilitaires partagées dans `globals.css` : `.sF-btn`, `.sF-card`, `.sF-reveal`, `.sF-label`, etc.
- Police principale : **Baloo 2** (Google Fonts) — chargée via `next/font/google`
- Couleur primaire : `#FB3936` — toujours utiliser la variable CSS ou la classe Tailwind `bg-[#FB3936]`
- Pas d'emojis dans le code ou l'UI — SVG icons uniquement

## Conventions Backend (Laravel)

- Controllers minces → logique dans les Services
- Toujours utiliser les Form Requests pour la validation
- Toujours utiliser les Policies pour les autorisations
- Eloquent uniquement (pas de SQL brut sauf cas exceptionnel documenté)

## Erreurs connues à ignorer

- `.next/types/validator.ts` — erreur TypeScript pré-existante, ne pas modifier
- `AdminUsersPage.tsx` — avertissements TypeScript pré-existants, ne pas modifier
