# Speed Service

Plateforme de livraison de colis au Bénin — application web full-stack (Next.js 16 + Laravel 12).

---

## Avancement du projet

**Sprint en cours : Sprint 1 — Authentification**
Dernière mise à jour : 2026-06-22

| Tâche | Statut |
|---|---|
| US-001 Inscription (email, téléphone, mot de passe) | ✅ Terminé |
| US-002 Connexion utilisateur | ✅ Terminé |
| US-003 Réinitialisation du mot de passe | ✅ Terminé |
| US-004 Modification du profil | ⏳ À faire |

**Prochain sprint : Sprint 2 — Création de livraison**

---

## Structure du dépôt

- `frontend/`: application Next.js 15 en TypeScript
- `backend/`: API Laravel 12
- `docker-compose.yml`: configuration de services Docker (PostgreSQL, Redis, frontend, backend)
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

## Roadmap des sprints

| Sprint | Thème | Statut |
|---|---|---|
| Sprint 0 | Infrastructure & Setup | ✅ Terminé (2026-06-22) |
| Sprint 1 | Authentification | 🔄 En cours |
| Sprint 2 | Création de livraison | ⏳ À venir |
| Sprint 3 | Géolocalisation | ⏳ À venir |
| Sprint 4 | Paiement | ⏳ À venir |
| Sprint 5 | Gestion livreurs & statuts | ⏳ À venir |
| Sprint 6 | Suivi client & notifications | ⏳ À venir |
| Sprint 7 | Administration (back-office) | ⏳ À venir |
| Sprint 8 | Stabilisation & déploiement | ⏳ À venir |
