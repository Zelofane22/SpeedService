# Speed Service

Ce dépôt contient la base du projet Speed Service.

## Structure du dépôt

- `frontend/`: application Next.js 15 en TypeScript
- `backend/`: API Laravel 12
- `docker-compose.yml`: configuration de services Docker (PostgreSQL, Redis, frontend, backend)
- `.github/workflows/ci.yml`: pipeline CI/CD automatisée

## Git

Branches recommandées :

- `main` : version stable / production-ready
- `develop` : version d'intégration continue
- `feature/*` : nouvelles fonctionnalités
- `release/*` : préparation des versions
- `hotfix/*` : corrections urgentes

Conventions de commits :

- `feat(scope): description` — nouvelle fonctionnalité
- `fix(scope): description` — correction de bug
- `chore(scope): description` — tâche d'infrastructure
- `docs(scope): description` — documentation
- `refactor(scope): description` — refactorisation
- `test(scope): description` — ajout ou mise à jour de tests
- `style(scope): description` — modifications sans impact fonctionnel

Exemples :

- `feat(order): add content category field`
- `fix(payment): ensure physical payment requires approval`
- `chore(ci): add GitHub Actions pipeline`

## CI/CD

La pipeline CI automatise :

- lint et build frontend
- validation composer / tests backend
- validation Docker Compose

## Premier commit

Le premier commit contient :

- structure de base `frontend/`
- structure de base `backend/`
- configuration CI/CD
- configuration Docker Compose
