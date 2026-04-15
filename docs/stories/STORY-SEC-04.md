# STORY-SEC-04 : Account Lockout — blocage après tentatives échouées

**Epic :** EPIC-SEC-03 — Validation backend & protection compte
**Priorité :** Must Have
**Story Points :** 3
**Statut :** À faire
**Assigné à :** Non assigné
**Créé le :** 2026-04-14
**Sprint :** SEC Sprint 1

---

## User Story

En tant que **titulaire d'un compte**,
je veux **que mon compte soit temporairement bloqué après 5 tentatives de connexion échouées**,
afin de **protéger mon compte contre les attaques par force brute ou dictionnaire**.

---

## Description

### Contexte

L'`AuthController::login()` actuel n'a aucun mécanisme de protection contre les tentatives
répétées. Un attaquant peut envoyer des milliers de requêtes de connexion sans être ralenti.
Laravel dispose d'un `RateLimiter` natif (cache-based) qui permet d'implémenter ce blocage
sans dépendance externe.

### Périmètre

**Dans le périmètre :**
- Modifier `AuthController::login()` pour ajouter `RateLimiter`
- Retourner HTTP 429 avec le délai restant (`retry_after` en secondes)
- Réinitialiser le compteur après une connexion réussie

**Hors périmètre :**
- Gestion du 429 côté frontend (STORY-SEC-06 — LoginForm)
- Rate limiting sur `/register` et `/forgot-password` (hors périmètre du PRD)
- Lockout permanent (uniquement temporaire : 15 min)

### Logique de blocage

- Clé : `'login.' . Str::lower($request->email)` (par email, pas par IP)
- Seuil : 5 tentatives échouées
- Durée de blocage : 900 secondes (15 minutes)
- Réinitialisation : sur succès de connexion

---

## Critères d'acceptation

- [ ] 5 tentatives de connexion échouées (mauvais mdp) → la 6e retourne HTTP 429
- [ ] La réponse 429 est JSON : `{ "message": "Trop de tentatives… dans X minute(s).", "retry_after": <secondes> }`
- [ ] Une connexion réussie après < 5 échecs remet le compteur à zéro
- [ ] Après le délai de 15 min, une nouvelle tentative est à nouveau possible
- [ ] Les tentatives bloquées ne génèrent PAS de requête vers la table `users` (RateLimiter vérifié avant `User::where()`)
- [ ] Le header `Retry-After` est inclus dans la réponse 429

---

## Notes techniques

### `AuthController.php` — après modification

```php
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

public function login(LoginRequest $request): JsonResponse
{
    // ---- Account Lockout ----
    $throttleKey = 'login.' . Str::lower($request->email);

    if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
        $seconds = RateLimiter::availableIn($throttleKey);
        $minutes = (int) ceil($seconds / 60);

        return response()->json([
            'message'     => "Trop de tentatives de connexion. Veuillez réessayer dans {$minutes} minute(s).",
            'retry_after' => $seconds,
        ], 429)->withHeaders([
            'Retry-After' => $seconds,
        ]);
    }

    // ---- Vérification credentials ----
    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        RateLimiter::hit($throttleKey, 900); // 15 minutes
        throw ValidationException::withMessages([
            'email' => ["L'adresse e-mail ou le mot de passe est incorrect."],
        ]);
    }

    // ---- Succès ----
    RateLimiter::clear($throttleKey);

    $token = $user->createToken('api')->plainTextToken;

    return response()->json([
        'user'  => $this->formatUser($user),
        'token' => $token,
    ]);
}
```

### Driver de cache utilisé

Le `RateLimiter` utilise le driver de cache défini dans `CACHE_STORE` (`.env`).
Actuellement : `CACHE_STORE=file` — fonctionnel en développement et sur O2switch.
Aucune configuration supplémentaire n'est requise.

### Choix de la clé par email

La clé `'login.' . email` (et non `'login.' . ip`) protège un compte spécifique contre les
attaques distribuées depuis plusieurs IPs. Contrepartie documentée dans l'architecture :
un attaquant connaissant l'email peut volontairement déclencher le lockout (DoS ciblé),
mais le délai de 15 min est court et l'utilisateur peut reset son mdp entre-temps.

### Test manuel (curl)

```bash
# Exécuter 6 fois avec un mauvais mdp
for i in {1..6}; do
  curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Mauvais1@Mdp"}' | jq .
done
# La 6e réponse doit être HTTP 429 avec message + retry_after
```

---

## Dépendances

**Prérequis :**
- STORY-SEC-03 (LoginRequest avec PasswordPolicy — la séquence de validation doit être connue)

**Bloque :**
- STORY-SEC-06 (LoginForm doit gérer le 429 — nécessite de savoir le format de la réponse)

---

## Définition de Done

- [ ] `AuthController::login()` modifié avec `RateLimiter`
- [ ] `use Illuminate\Support\Facades\RateLimiter` + `use Illuminate\Support\Str` importés
- [ ] Test : 6e tentative → HTTP 429 avec `retry_after`
- [ ] Test : connexion réussie après < 5 échecs → compteur remis à zéro (vérifiable en relançant)
- [ ] Test : tentative bloquée → pas de requête SQL générée (vérifiable via `DB::listen()` en tinker)

---

## Décomposition des points

- Modification `AuthController::login()` : 1 pt
- Logique lockout + test manuel (6 tentatives) : 1 pt
- Vérification pas de requête SQL sur blocage : 1 pt
- **Total : 3 points**

---

*Créé via BMAD Method — Phase 4 (Implementation Planning)*
