# Speed Service

Plateforme de livraison de colis au Bénin — application web full-stack (Next.js 16 + Laravel 12).

---

## Avancement du projet

**Sprint en cours : Sprint 5 — Gestion livreurs & statuts**
Dernière mise à jour : 2026-06-22

### Sprint 1 — Authentification ✅

| Tâche | Statut |
|---|---|
| US-001 Inscription (email, téléphone, mot de passe) | ✅ Terminé |
| US-002 Connexion utilisateur | ✅ Terminé |
| US-003 Réinitialisation du mot de passe | ✅ Terminé |
| US-004 Modification du profil | ✅ Terminé |

### Sprint 2 — Création de livraison ✅

| Tâche | Statut |
|---|---|
| Backend : `DeliveryController` (index, store, show, cancel) | ✅ Terminé |
| Backend : `PriceCalculator` (Document 1500 / Small 2500 / Medium 4000 / Large 6500 FCFA, ×2 Express) | ✅ Terminé |
| Backend : validation `StoreDeliveryRequest` + création Payment + StatusHistory | ✅ Terminé |
| Backend : routes `/deliveries` protégées par Sanctum | ✅ Terminé |
| Backend : factory `DeliveryFactory` + 17 tests PHPUnit (50 assertions au vert) | ✅ Terminé |
| Frontend : dashboard utilisateur avec KPI cards et données réelles | ✅ Terminé |
| Frontend : wizard création livraison en 5 étapes (expéditeur → destinataire → colis → récap → paiement) | ✅ Terminé |
| Frontend : page Historique avec recherche et `StatusBadge` | ✅ Terminé |
| Frontend : sidebar navigation (layout dashboard refactorisé) | ✅ Terminé |

### Sprint 3 — Géolocalisation ✅

| Tâche | Statut |
|---|---|
| Backend : `GeocodingController` — proxy Nominatim (`GET /geo/geocode`) + Haversine (`POST /geo/distance`) | ✅ Terminé |
| Backend : migration coordonnées nullable + champ `distance` dans `StoreDeliveryRequest` & `DeliveryController` | ✅ Terminé |
| Frontend : `MapPicker` (Leaflet + OSM, clic sur carte + recherche géocodée, centré sur Cotonou) | ✅ Terminé |
| Frontend : `RouteMap` (polyline entre les deux points + distance estimée dans le récap) | ✅ Terminé |
| Frontend : wizard nouvelle livraison — étapes 0 & 1 avec carte interactive, distance dans étapes 3 & 4 | ✅ Terminé |

### Sprint 4 — Paiement ✅

| Tâche | Statut |
|---|---|
| US-013bis Choix du service Standard/Express à l'étape paiement avec tarifs calculés | ✅ Terminé |
| US-013 Paiement Mobile Money (MTN MoMo, Moov Money) — numéro de téléphone + simulation | ✅ Terminé |
| US-014 Paiement par carte bancaire — formulaire sécurisé + simulation | ✅ Terminé |
| US-015 Paiement physique (à la livraison / en agence) — statut `AwaitingValidation` | ✅ Terminé |
| US-016 Génération de reçu — écran de confirmation avec référence de transaction | ✅ Terminé |
| Backend : `PaymentController@pay` — `POST /deliveries/{id}/pay` avec validation par méthode | ✅ Terminé |
| Backend : 12 tests PHPUnit PaymentTest (44 assertions au vert) | ✅ Terminé |
| Frontend : wizard → redirect vers `/deliveries/{id}/payment` après création | ✅ Terminé |
| Frontend : page de paiement `/deliveries/[id]/payment` — formulaire adaptatif par méthode | ✅ Terminé |
| Frontend : écran de reçu inline après paiement (confirmé ou en attente de validation) | ✅ Terminé |

**Sprint 4 terminé. Prochain sprint : Sprint 5 — Gestion livreurs & statuts**

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
| Sprint 1 | Authentification | ✅ Terminé (2026-06-22) |
| Sprint 2 | Création de livraison | ✅ Terminé (2026-06-22) |
| Sprint 3 | Géolocalisation | ✅ Terminé (2026-06-22) |
| Sprint 4 | Paiement | ✅ Terminé (2026-06-22) |
| Sprint 5 | Gestion livreurs & statuts | ⏳ À venir |
| Sprint 6 | Suivi client & notifications | ⏳ À venir |
| Sprint 7 | Administration (back-office) | ⏳ À venir |
| Sprint 8 | Stabilisation & déploiement | ⏳ À venir |
