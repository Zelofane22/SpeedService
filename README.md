# Speed Service

Plateforme de livraison de colis au Bénin — application web full-stack (Next.js + Laravel 12).

---

## Avancement du projet

**Sprint en cours : Sprint 9 — Stabilisation & déploiement**
Dernière mise à jour : 2026-06-25

### Sprint 9 — Stabilisation & déploiement 🔄

| Tâche | Statut |
|---|---|
| Monorepo pnpm workspaces — `packages/ui/` (cn, ThemeToggle, StatusBadge) | ✅ Terminé |
| Monorepo pnpm workspaces — `packages/api-client/` (apiGet, apiPost, apiPatch…) | ✅ Terminé |
| Mise à jour des apps frontend/admin/driver pour consommer les packages partagés | ✅ Terminé |
| Refactor terminologie : `rider/` → `driver/`, routes `/driver/apply/*`, labels UI « Livreur » | ✅ Terminé |
| TypeScript au vert sur les 3 apps (tsc --noEmit) | ✅ Terminé |
| Durcissement production — branche `preprod` | ✅ Terminé |
| Déploiement local preprod en conteneurs Docker | ✅ Validé (2026-06-25) |

---

## Architecture multi-app

| Répertoire | Description | URL prod | Port local |
|---|---|---|---|
| `frontend/` | Next.js — app client | speedservice.bj | 3000 |
| `admin/` | Next.js — back-office admin | admin.speedservice.bj | 3001 |
| `driver/` | Next.js — app livreur PWA | driver.speedservice.bj | 3002 |
| `backend/` | Laravel 12 — API partagée | api.speedservice.bj | 8000 |
| `packages/ui/` | Composants partagés (`@speedservice/ui`) | — | — |
| `packages/api-client/` | Client HTTP partagé (`@speedservice/api-client`) | — | — |

---

## Démarrage

### Développement (sans Docker)

```bash
# Installer toutes les dépendances (monorepo pnpm)
pnpm install

# App client
pnpm --filter speedservice-frontend dev       # http://localhost:3000

# Back-office admin
pnpm --filter speedservice-admin dev          # http://localhost:3001

# App livreur
pnpm --filter speedservice-driver dev         # http://localhost:3002

# Backend API
cd backend && php artisan serve               # http://localhost:8000
```

### Preprod / Production (Docker)

```bash
# 1. Créer le fichier de secrets à partir du template
cp backend/.env.example backend/.env
# → Remplir APP_KEY, DB_PASSWORD, POSTGRES_PASSWORD, MAIL_*, SMS_*

# 2. Générer la clé Laravel
docker compose run --rm backend php artisan key:generate

# 3. Builder les images
docker compose build

# 4. Démarrer la stack
docker compose up -d

# 5. Seeder l'admin (première fois uniquement)
docker compose exec backend php artisan db:seed --force
```

**Services accessibles :**

| URL | Service |
|---|---|
| `http://localhost:8000/api/status` | API (health check) |
| `http://localhost:3000` | App client |
| `http://localhost:3001` | Admin (login: `admin@speedservice.bj` / `AdminPassword123!` — voir ci-dessous) |
| `http://localhost:3002` | App livreur |

**Commandes utiles :**

```bash
docker compose logs -f backend     # logs en temps réel
docker compose ps                  # état des conteneurs
docker compose down -v             # stopper + supprimer les volumes
```

---

## Sécurité & Secrets

### Mot de passe admin (première connexion)

Le seeder crée le compte admin avec un mot de passe temporaire (`AdminPassword123!`).
**Lors de la première connexion**, l'interface oblige l'administrateur à définir un nouveau mot de passe avant d'accéder au back-office.

> Ce comportement est géré par le flag `must_change_password` sur le modèle `User`.
> Si vous ré-initialisez la base de données, le flag est remis à `true` automatiquement par le seeder.

### Mot de passe de la base de données

Le fichier `backend/.env.example` contient des valeurs placeholder. **Ne jamais utiliser ces valeurs en production.**

**À faire avant le premier déploiement :**

```bash
# Générer un mot de passe fort (exemple)
openssl rand -base64 32

# Renseigner dans backend/.env
DB_PASSWORD=<mot_de_passe_généré>

# ou passer par un .env à la racine lu par Docker Compose
```

**Rotation du mot de passe de base de données :**

```bash
# 1. Changer le mot de passe dans PostgreSQL
docker compose exec db psql -U speedservice -c "ALTER USER speedservice PASSWORD 'nouveau_mdp';"

# 2. Mettre à jour DB_PASSWORD dans backend/.env

# 3. Redémarrer le backend pour prendre en compte le nouveau mot de passe
docker compose restart backend
```

Effectuer une rotation dans les cas suivants :
- Avant chaque mise en production initiale
- Si le `.env` de prod a été exposé (git, logs, partage)
- Si un membre de l'équipe avec accès aux secrets quitte le projet
- Périodiquement (tous les 6–12 mois en production)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend (3 apps) | Next.js, React 19, TypeScript, Tailwind CSS 3, pnpm workspaces |
| Backend | Laravel 12, PHP 8.4, PostgreSQL 16, Redis 7 |
| Auth | Laravel Sanctum (token-based) |
| Serveur web | Nginx + PHP-FPM + Supervisord (single container) |
| CI/CD | GitHub Actions |

---

## Structure du dépôt

```
frontend/          → App client (speedservice.bj)
admin/             → Back-office admin (admin.speedservice.bj)
driver/            → App livreur PWA (driver.speedservice.bj)
backend/           → API Laravel 12
packages/ui/       → @speedservice/ui (composants partagés)
packages/api-client/ → @speedservice/api-client (client HTTP)
docker-compose.yml → Stack complète (preprod & prod)
.github/workflows/ → CI/CD GitHub Actions
AIorchestration.md → Coordination Claude Code ↔ GPT Codex
```

---

## Git

| Branche | Rôle |
|---|---|
| `main` | Version stable — merge depuis `develop` ou `hotfix/*` |
| `develop` | Développement courant |
| `preprod` | Branche de validation avant mise en production |

**Conventions de commits :**

```
feat(scope):  nouvelle fonctionnalité
fix(scope):   correction de bug
chore(scope): tâche d'infrastructure
docs(scope):  documentation
test(scope):  tests
```

---

## CI/CD

GitHub Actions automatise à chaque push :
- Lint et build des 3 frontends
- Tests PHPUnit + validation Composer
- Validation Docker Compose

---

## Roadmap des sprints

| Sprint | Thème | Statut |
|---|---|---|
| Sprint 0 | Infrastructure & Setup | ✅ Terminé (2026-06-22) |
| Sprint 1 | Authentification | ✅ Terminé (2026-06-22) |
| Sprint 2 | Création de livraison | ✅ Terminé (2026-06-22) |
| Sprint 3 | Géolocalisation | ✅ Terminé (2026-06-22) |
| Sprint 4 | Paiement | ✅ Terminé (2026-06-22) |
| Sprint 5 | Gestion livreurs & statuts | ✅ Terminé (2026-06-22) |
| Sprint 6 | Suivi client & notifications | ✅ Terminé (2026-06-22) |
| Sprint 7 | Administration — back-office `admin/` | ✅ Terminé (2026-06-22) |
| Sprint 8 | Driver App — tunnel inscription + `driver/` | ✅ Terminé (2026-06-23) |
| Sprint 9 | Stabilisation & déploiement | 🔄 En cours (2026-06-24) |
