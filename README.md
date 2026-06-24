# Speed Service

Plateforme de livraison de colis au Bénin — application web full-stack (Next.js 16 + Laravel 12).

---

## Avancement du projet

**Sprint en cours : Sprint 9 — Stabilisation & déploiement**
Dernière mise à jour : 2026-06-24

Les sprints validés sont récapitulés dans la [roadmap](#roadmap-des-sprints).

### Sprint 9 — Stabilisation & déploiement 🔄

| Tâche | Statut |
|---|---|
| Monorepo pnpm workspaces — `packages/ui/` (cn, ThemeToggle, StatusBadge) | ✅ Terminé |
| Monorepo pnpm workspaces — `packages/api-client/` (apiGet, apiPost, apiPatch…) | ✅ Terminé |
| Mise à jour des apps frontend/admin/driver pour consommer les packages partagés | ✅ Terminé |
| Refactor terminologie : `rider/` → `driver/`, routes `/driver/apply/*`, labels UI « Livreur » | ✅ Terminé |
| TypeScript au vert sur les 3 apps (tsc --noEmit) | ✅ Terminé |

---

## Architecture multi-app

| Répertoire | Description | URL | Port |
|---|---|---|---|
| `frontend/` | Next.js — app client | speedservice.bj | 3000 |
| `admin/` | Next.js — back-office admin | admin.speedservice.bj | 3001 |
| `driver/` | Next.js — app livreur PWA | driver.speedservice.bj | 3002 |
| `backend/` | Laravel 12 — API partagée | api.speedservice.bj | 8000 |
| `packages/ui/` | Composants partagés (`@speedservice/ui`) | — | — |
| `packages/api-client/` | Client HTTP partagé (`@speedservice/api-client`) | — | — |

### Démarrage en développement

```bash
# Installer toutes les dépendances (monorepo pnpm)
pnpm install

# Client
pnpm --filter speedservice-frontend dev       # port 3000

# Back-office admin
pnpm --filter speedservice-admin dev          # port 3001

# App livreur
pnpm --filter speedservice-driver dev         # port 3002

# Backend API
cd backend && php artisan serve               # port 8000

# Stack complète via Docker
docker compose up -d
```

## Structure du dépôt

- `frontend/`: application Next.js 16 — espace client (speedservice.bj)
- `admin/`: application Next.js — back-office admin (admin.speedservice.bj)
- `driver/`: application Next.js 16 PWA mobile-first — espace livreur (driver.speedservice.bj)
- `packages/ui/`: composants partagés `@speedservice/ui` (cn, ThemeToggle, StatusBadge)
- `packages/api-client/`: client HTTP partagé `@speedservice/api-client`
- `backend/`: API Laravel 12 partagée
- `docker-compose.yml`: configuration de services Docker (PostgreSQL, Redis, frontend, admin, driver, backend)
- `.github/workflows/ci.yml`: pipeline CI/CD automatisée

## Git

Deux branches principales :

- `develop` : développement courant (commits des sprints)
- `main` : version stable — merge depuis `develop` en fin de sprint, ou `hotfix/*` pour les urgences

Conventions de commits :

- `feat(scope): description` — nouvelle fonctionnalité
- `fix(scope): description` — correction de bug
- `chore(scope): description` — tâche d'infrastructure
- `docs(scope): description` — documentation
- `test(scope): description` — ajout ou mise à jour de tests

## CI/CD
La chaîne CI/CD repose sur GitHub Actions, Docker et Docker Compose.
La pipeline CI automatise :

- lint et build frontend
- validation composer / tests backend
- validation Docker Compose

## orchestration (synchronisation CLAUDE - GPT CODEX)
Le fichier AIorchestration.md permet de se synchroniser entre IA afin d'éviter les conflits.

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
| Sprint 7 | Administration (back-office) — app séparée `admin/` (admin.speedservice.bj) | ✅ Terminé (2026-06-22) |
| Sprint 8 | Driver App — Tunnel inscription + driver.speedservice.bj | ✅ Terminé (2026-06-23) |
| Sprint 9 | Stabilisation & déploiement | 🔄 En cours (démarré 2026-06-24) |
