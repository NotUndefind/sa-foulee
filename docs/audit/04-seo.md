# 04 — SEO

Audit SEO du frontend Next.js (App Router, 23 pages buildées). Les bases sont saines : `metadata` racine avec template de titre, OpenGraph `fr_FR`, `metadataBase`, et chaque page publique (`/`, `/blog`, `/evenements`, `/activites`) déclare son propre `metadata`. En revanche, le contenu réel (articles, événements) est fetché côté client et il n'existe aucune page de détail d'article : le site est quasi invisible pour les moteurs au-delà de la landing.

| Axe | État |
| --- | --- |
| Metadata par page | ✅ Présent sur les 4 pages publiques |
| Contenu dans le HTML initial | ❌ Client-side fetch sur blog/événements/activités |
| Pages de détail indexables | ❌ Aucune route `/blog/[slug]` |
| sitemap.xml / robots.txt | ❌ Absents |
| Canonical / OG images / robots meta | ❌ Absents |
| Domaine canonique | ⚠️ Incohérent (`safoulee.fr` vs prod) |

### [🔴] Contenu blog/événements/activités invisible des crawlers (rendu 100 % client)
- **Sévérité** : 🔴 Critique
- **Preuve** : `frontend/src/components/features/blog/PublicBlogPage.tsx:1-27` (`'use client'` + `useEffect`/`getPosts`), `events/PublicEventsPage.tsx:1`, `events/ActivitesPage.tsx:1`
- **Constat** : Les pages `/blog`, `/evenements`, `/activites` sont prerendered statiques mais ne contiennent qu'un état `loading` dans le HTML initial ; les données sont fetchées dans `useEffect` après hydratation. Les crawlers (et les partages sociaux) ne voient aucun article ni événement. Seule la home (`(public)/page.tsx:23`, `revalidate = 300`) fetch côté serveur.
- **Recommandation** : Convertir ces pages en Server Components avec fetch serveur + `export const revalidate` (ISR), en gardant la pagination/filtres en client si besoin.
- **Effort** : M

### [🔴] Aucune page de détail d'article — contenu blog non indexable
- **Sévérité** : 🔴 Critique
- **Preuve** : arborescence `frontend/src/app/(public)/` (seuls `blog/page.tsx`, `evenements/page.tsx`, `activites/page.tsx`, `desabonnement/page.tsx` existent) ; les seuls liens de `PublicBlogPage.tsx:92-136` pointent vers `/connexion` et `/inscription`
- **Constat** : Il n'existe pas de route publique `/blog/[slug]`. Chaque article ne dispose d'aucune URL propre : pas d'indexation, pas de partage, pas de longue traîne. C'est la principale perte SEO du site.
- **Recommandation** : Créer `(public)/blog/[slug]/page.tsx` avec `generateMetadata` (title, description, OG) et fetch serveur de l'article ; lier les cartes de la liste vers ces URLs.
- **Effort** : M

### [🟠] Pas de sitemap.xml ni robots.txt
- **Sévérité** : 🟠 Majeur
- **Preuve** : aucun `sitemap.ts`/`robots.ts` dans `frontend/src/app/`, aucun fichier statique dans `frontend/public/` (seuls logos/SVG)
- **Constat** : Aucun sitemap soumis aux moteurs et aucun contrôle de crawl ; les routes privées (`/tableau-de-bord/*`, `/connexion`…) sont crawlables et indexables par défaut.
- **Recommandation** : Ajouter `app/sitemap.ts` (pages publiques + futurs slugs blog via l'API) et `app/robots.ts` (Disallow `/tableau-de-bord`, allow le reste, lien sitemap). Effort très faible, gain immédiat.
- **Effort** : S

### [🟠] Domaine canonique incohérent : `safoulee.fr` vs `laneuvilletafsafoulee.fr`
- **Sévérité** : 🟠 Majeur
- **Preuve** : `frontend/.env.example:15` (`NEXT_PUBLIC_APP_URL=https://safoulee.fr`) utilisé par `metadataBase` (`app/layout.tsx:18`) ; la prod est `https://www.laneuvilletafsafoulee.fr` (`backend/.env.example:43`)
- **Constat** : Si la variable Vercel reprend la valeur d'exemple, toutes les URLs absolues (OG, futurs canonical/sitemap) pointeront vers un domaine qui n'est pas celui de production. Fallback `http://localhost:3000` si la variable manque.
- **Recommandation** : Aligner `NEXT_PUBLIC_APP_URL=https://www.laneuvilletafsafoulee.fr` dans `.env.example` et vérifier la variable d'environnement Vercel de prod.
- **Effort** : S

### [🟡] Aucune image OpenGraph / Twitter card
- **Sévérité** : 🟡 Mineur
- **Preuve** : `app/layout.tsx:19-26` (bloc `openGraph` sans `images`), aucun `opengraph-image.*` dans `frontend/src/app/`, aucun `twitter:` metadata dans le codebase
- **Constat** : Les partages sur réseaux sociaux/messageries s'affichent sans visuel, alors que `frontend/public/logo.png` et `mascotte.png` existent déjà.
- **Recommandation** : Ajouter `openGraph.images` (ou un `opengraph-image.png` à la racine d'`app/`) et un bloc `twitter: { card: 'summary_large_image' }`.
- **Effort** : S

### [🟡] Pas de canonical ni de robots meta sur les pages privées
- **Sévérité** : 🟡 Mineur
- **Preuve** : `grep canonical|robots` sur `frontend/src/app/` → 0 résultat
- **Constat** : Aucune URL canonique déclarée (risque de duplication www/non-www, previews Vercel indexables) et les layouts `(auth)`/`(dashboard)` ne posent pas `robots: { index: false }`.
- **Recommandation** : Ajouter `alternates: { canonical: './' }` au layout racine et `robots: noindex` sur les layouts auth/dashboard.
- **Effort** : S

### [🔵] Pas de données structurées (JSON-LD)
- **Sévérité** : 🔵 Suggestion
- **Preuve** : aucun `application/ld+json` dans `frontend/src/`
- **Constat** : Les événements publics (`/evenements`, `/activites`) se prêtent parfaitement au schema `Event` (rich results Google), et l'association au schema `SportsOrganization`.
- **Recommandation** : Injecter du JSON-LD `Event` une fois le fetch serveur en place (dépend du constat 🔴 n°1).
- **Effort** : M

## Récapitulatif

| Constat | Sévérité | Effort |
| --- | --- | --- |
| Contenu public rendu côté client (invisible crawlers) | 🔴 | M |
| Aucune route `/blog/[slug]` (articles non indexables) | 🔴 | M |
| Pas de sitemap.ts / robots.ts | 🟠 | S |
| Domaine `metadataBase` incohérent avec la prod | 🟠 | S |
| Pas d'image OpenGraph / Twitter | 🟡 | S |
| Pas de canonical ni noindex sur pages privées | 🟡 | S |
| Pas de JSON-LD Event/Organization | 🔵 | M |
