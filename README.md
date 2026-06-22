# Speed Service

Plateforme de livraison de colis au Bénin — application web full-stack (Next.js 16 + Laravel 12).

---

## Avancement du projet

**Sprint en cours : Sprint 7 — Administration (back-office)**
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

### Sprint 5 — Gestion livreurs & statuts ✅

| Tâche | Statut |
|---|---|
| US-017 à US-022 — Cycle de vie des statuts (Confirmed → Assigned → PickingUp → InDelivery → Delivered \| Cancelled) | ✅ Terminé |
| US-023 — Connexion livreur avec redirect automatique vers portail `/driver/` | ✅ Terminé |
| US-024 — Liste des missions disponibles (statut Confirmed, sans driver) | ✅ Terminé |
| US-025 — Acceptation d'une mission (Confirmed → Assigned, affectation driver_id) | ✅ Terminé |
| US-026 — Refus d'une mission (masquage local, pas de changement de statut) | ✅ Terminé |
| US-027 — Mise à jour du statut de livraison par le livreur (boutons d'avancement) | ✅ Terminé |
| US-028 — Historique des missions du livreur | ✅ Terminé |
| Backend : `DriverController` (5 endpoints : missions dispo, mes missions, accepter, refuser, statut) | ✅ Terminé |
| Backend : validation des transitions de statut (ordre strict) | ✅ Terminé |
| Frontend : portail livreur `/driver/` avec layout dédié (Missions, En cours, Historique) | ✅ Terminé |
| Frontend : `apiPatch` ajouté à la lib API | ✅ Terminé |
| Frontend : textes secondaires passés de rose à gris-noir (text-gray-700) sur toute l'app | ✅ Terminé |

### Sprint 6 — Suivi client & notifications ✅

| Tâche | Statut |
|---|---|
| US-029 — Suivi d’une commande par statut avec chronologie complète | ✅ Terminé |
| US-031 — Historique client avec recherche, filtre par statut et accès au détail | ✅ Terminé |
| US-032 — Notification de validation de commande | ✅ Terminé |
| US-033 — Notification d’affectation d’un livreur | ✅ Terminé |
| US-034 — Notification de récupération du colis | ✅ Terminé |
| US-035 — Notification de livraison terminée | ✅ Terminé |
| Backend : journal de notifications idempotent (in-app, email et SMS) | ✅ Terminé |
| Backend : emails et SMS asynchrones via les files Laravel | ✅ Terminé |
| Backend : API notifications (liste, compteur, lecture unitaire/globale) | ✅ Terminé |
| Frontend : page `/deliveries/[id]` avec statut, timeline, trajet, colis, paiement et livreur | ✅ Terminé |
| Frontend : actualisation automatique du suivi toutes les 30 secondes | ✅ Terminé |
| Frontend : centre de notifications accessible depuis la cloche | ✅ Terminé |
| Tests : 67 tests PHPUnit, 241 assertions, lint et build Next.js au vert | ✅ Terminé |

**Sprint 6 terminé. Prochain sprint : Sprint 7 — Administration (back-office)**

---

## Structure du dépôt

- `frontend/`: application Next.js 16 en TypeScript
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
| Sprint 5 | Gestion livreurs & statuts | ✅ Terminé (2026-06-22) |
| Sprint 6 | Suivi client & notifications | ✅ Terminé (2026-06-22) |
| Sprint 7 | Administration (back-office) | ⏳ À venir |
| Sprint 8 | Rider App — Tunnel inscription + rider.speedservice.bj | ⏳ À venir |
| Sprint 9 | Stabilisation & déploiement | ⏳ À venir |
