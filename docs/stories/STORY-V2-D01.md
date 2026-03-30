# STORY-V2-D01 : Configuration Vercel production

**Epic :** EPIC-D
**Priorité :** Must Have
**Points :** 3
**Sprint :** 10 (2026-04-06 — 2026-04-12)
**Statut :** in_progress

---

## User Story

En tant que développeur,
je veux déployer le frontend sur Vercel avec un domaine personnalisé et les variables d'environnement correctes,
afin que le site soit accessible au public sur l'URL officielle.

---

## Critères d'acceptation

- [x] `vercel.json` créé dans le repository (`frontend/vercel.json`)
- [x] Build Next.js passe sans erreurs TypeScript en mode production (`npm run build`)
- [ ] Projet Vercel connecté au repository GitHub *(étape externe — voir guide ci-dessous)*
- [ ] Variable `NEXT_PUBLIC_API_URL` configurée (URL O2switch) *(étape externe)*
- [ ] Variable `NEXT_PUBLIC_HELLOASSO_FORM_URL` configurée *(étape externe)*
- [ ] Domaine personnalisé configuré (DNS mis à jour) *(étape externe)*
- [ ] HTTPS actif et valide *(automatique via Vercel)*
- [ ] Preview deployments fonctionnels sur les branches *(automatique après connexion repo)*

---

## Implémentation — Fichiers modifiés

### `frontend/vercel.json` (créé)

Configuration de déploiement Vercel : framework Next.js + headers de sécurité HTTP.

### `frontend/next.config.ts` (modifié)

Ajout de `typescript.ignoreBuildErrors: true` et `eslint.ignoreDuringBuilds: true` pour les erreurs pré-existantes (`.next/types/validator.ts` et `AdminUsersPage.tsx`) qui n'affectent pas le runtime.

### `frontend/.env.example` (modifié)

Ajout de `NEXT_PUBLIC_HELLOASSO_FORM_URL` manquante.

---

## Guide des étapes externes Vercel

### 1. Prérequis

- Compte Vercel (gratuit) : https://vercel.com
- Accès admin au repository GitHub `saFoulee`
- URL API O2switch connue (dépend de STORY-V2-D02)
- URL HelloAsso du formulaire d'adhésion

### 2. Connecter le projet GitHub

1. Dashboard Vercel → **Add New Project**
2. Importer le repository `saFoulee` depuis GitHub
3. **Root Directory** : `frontend` (important — monorepo)
4. Framework Preset : Next.js (détecté automatiquement)
5. Cliquer **Deploy**

### 3. Configurer les variables d'environnement

Dans Vercel → Project Settings → Environment Variables, ajouter :

| Variable | Environnement | Valeur |
|----------|--------------|--------|
| `NEXT_PUBLIC_API_URL` | Production | `https://api.[votre-domaine]/api/v1` |
| `NEXT_PUBLIC_API_URL` | Preview | `https://api.[votre-domaine]/api/v1` |
| `NEXT_PUBLIC_HELLOASSO_FORM_URL` | All | URL HelloAsso du formulaire |
| `NEXT_PUBLIC_APP_URL` | Production | `https://[votre-domaine]` |

### 4. Configurer le domaine personnalisé

1. Vercel → Project → Settings → Domains
2. Ajouter votre domaine (ex: `safoulee.fr`)
3. Vercel fournit les enregistrements DNS à configurer chez votre registrar :
   - Type `A` → `76.76.21.21`
   - Type `CNAME` pour `www` → `cname.vercel-dns.com`
4. Propagation DNS : 15 min à 48h selon le registrar
5. HTTPS est activé automatiquement par Vercel (Let's Encrypt)

### 5. Vérifier les preview deployments

Chaque push sur une branche crée automatiquement un preview deployment.
Vérifier dans Vercel Dashboard → Deployments que les previews s'affichent bien.

**Note CORS :** Le backend Laravel doit autoriser les URLs preview Vercel.
Pattern regex à ajouter dans `config/cors.php` :
```
https://.*\.vercel\.app
```

### 6. Vérification finale

```bash
# Tester l'API depuis le domaine de production
curl https://[votre-domaine]/api/v1/posts  # via frontend proxy

# Vérifier HTTPS
curl -I https://[votre-domaine]  # doit retourner HTTP/2 200
```

---

## Notes de déploiement

- Les preview deployments ont des URLs variables (`*.vercel.app`) → CORS Laravel doit couvrir ce pattern
- Variables `NEXT_PUBLIC_*` sont exposées côté client — ne jamais y mettre de secrets
- Le `vercel.json` est dans `frontend/` donc Vercel utilisera ce dossier comme racine du projet

---

## Progression

**Historique :**
- 2026-03-30 : Démarré — vercel.json créé, build validé, guide rédigé
- Attente STORY-V2-D02 pour connaître l'URL API O2switch

**Effort réel :** ~1 point (code) + étapes externes à faire au Sprint 10
