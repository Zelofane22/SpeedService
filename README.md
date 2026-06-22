# Speed Service

Plateforme de livraison de colis au Bénin — application web full-stack (Next.js 16 + Laravel 12).

---

## Avancement du projet

**Sprint en cours : Sprint 0 — Infrastructure & Setup**
Dernière mise à jour : 2026-06-22

| Tâche | Statut |
|---|---|
| Structure du dépôt (frontend / backend) | ✅ Terminé |
| Configuration Docker Compose (PostgreSQL, Redis) | ✅ Terminé |
| Pipeline CI/CD (GitHub Actions) | ✅ Terminé |
| Conventions Git et workflow documentés | ✅ Terminé |
| Setup Tailwind CSS + Shadcn UI (frontend) | ✅ Terminé |
| Modélisation base de données + migrations Laravel | ✅ Terminé |
| Configuration Laravel Sanctum | ⏳ À faire |
| Wireframes / Maquettes UI | ⏳ À faire |

**Prochain sprint : Sprint 1 — Authentification**
- US-001 Inscription (email, téléphone, mot de passe)
- US-002 Connexion utilisateur
- US-003 Réinitialisation du mot de passe
- US-004 Modification du profil

---

## Structure du dépôt

- `frontend/`: application Next.js 15 en TypeScript
- `backend/`: API Laravel 12
- `docker-compose.yml`: configuration de services Docker (PostgreSQL, Redis, frontend, backend)
- `.github/workflows/ci.yml`: pipeline CI/CD automatisée

## Git

Branches recommandées :

- `main` : version stable / production-ready
- `develop` : version d'intégration et préparation des versions
- `feature/*` : nouvelles fonctionnalités
- `release/*` : préparation des releases
- `hotfix/*` : corrections urgentes en production

## Workflow Git

1. Créer une branche depuis `develop` : `feature/<description>`.
2. Faire des commits atomiques et lisibles.
3. Ouvrir une Pull Request vers `develop`.
4. Revue + validation CI.
5. Fusionner dans `develop`.
6. Créer une branche `release/<version>` depuis `develop` si nécessaire.
7. Fusionner `release/*` dans `main` puis `develop`.
8. Pour une correction urgente, créer `hotfix/<description>` depuis `main`.

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
La chaîne CI/CD repose sur GitHub Actions, Docker et Docker Compose.
La pipeline CI automatise :

- lint et build frontend
- validation composer / tests backend
- validation Docker Compose

## Roadmap des sprints

| Sprint | Thème | Statut |
|---|---|---|
| Sprint 0 | Infrastructure & Setup | 🔄 En cours |
| Sprint 1 | Authentification | ⏳ À venir |
| Sprint 2 | Création de livraison | ⏳ À venir |
| Sprint 3 | Géolocalisation | ⏳ À venir |
| Sprint 4 | Paiement | ⏳ À venir |
| Sprint 5 | Gestion livreurs & statuts | ⏳ À venir |
| Sprint 6 | Suivi client & notifications | ⏳ À venir |
| Sprint 7 | Administration (back-office) | ⏳ À venir |
| Sprint 8 | Stabilisation & déploiement | ⏳ À venir |
