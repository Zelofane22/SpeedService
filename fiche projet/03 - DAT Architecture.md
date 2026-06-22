# DAT — ARCHITECTURE APPLICATIVE
# Speed Service

**Version :** 1.0 — MVP (10 sprints)
**Date :** Juin 2026
**Complément :** [04 - DAT Infrastructure.md](04%20-%20DAT%20Infrastructure.md)

---

# 1. Objet du document

Ce document décrit l'**architecture logicielle** de la plateforme Speed Service : structure des applications, choix technologiques, modules métier, schéma de base de données, authentification et intégrations externes.

Pour la configuration des serveurs, du réseau, du déploiement et de la CI/CD, voir [04 - DAT Infrastructure.md](04%20-%20DAT%20Infrastructure.md).

---

# 2. Vue d'ensemble applicative

Speed Service est composé de **trois applications** partageant un seul backend :

```
┌──────────────────────────────────────────────────────────────┐
│                        Internet                              │
└───────────┬──────────────────┬───────────────────────────────┘
            │                  │
            ▼                  ▼
┌───────────────────┐ ┌───────────────────┐
│  speedservice.bj  │ │rider.speedservice.bj│
│  App Client       │ │  App Rider (PWA)   │
│  Next.js          │ │  Next.js           │
│  Desktop-first    │ │  Mobile-first      │
└─────────┬─────────┘ └────────┬───────────┘
          │                    │
          └──────────┬─────────┘
                     │ HTTPS / JSON
                     ▼
        ┌────────────────────────┐
        │  api.speedservice.bj   │
        │  Laravel 12 — API REST │
        └───────────┬────────────┘
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
  PostgreSQL      Redis     Services externes
```

| Application | URL | Cible | Design |
|---|---|---|---|
| Plateforme client | `speedservice.bj` | Clients expéditeurs | Desktop-first, responsive |
| Espace rider | `rider.speedservice.bj` | Livreurs | Mobile-first, PWA |
| API | `api.speedservice.bj` | — | Laravel REST (partagé) |

---

# 3. Style architectural

**Monolithe modulaire**

Justification :
- Développement rapide adapté au MVP
- Coût réduit (une seule équipe backend)
- Maintenance simplifiée (un seul déploiement backend)
- Évolutivité vers microservices en V3 si nécessaire

---

# 4. Modules métier (Backend)

## 4.1 Authentification

Responsabilités :
- Inscription client (self-service)
- Candidature livreur (tunnel d'onboarding — Sprint 8)
- Connexion multi-rôles avec validation du rôle à l'entrée
- Réinitialisation de mot de passe
- Gestion des tokens Sanctum

## 4.2 Clients

Responsabilités :
- Profil utilisateur (nom, email, téléphone)
- Adresses enregistrées
- Historique de commandes

## 4.3 Livraisons

Responsabilités :
- Création de commande (wizard 5 étapes)
- Calcul tarifaire automatique (`package_type` × `delivery_type`)
- Cycle de vie des statuts (9 états — cf. §8)
- Affectation livreur

## 4.4 Livreurs

Responsabilités :
- Gestion des missions disponibles
- Acceptation / refus de mission
- Avancement des statuts en temps réel
- Historique des missions terminées
- Onboarding et validation du dossier (Sprint 8)

## 4.5 Paiements

Responsabilités :
- Paiement Mobile Money (MTN MoMo, Moov Money)
- Paiement carte bancaire (FedaPay)
- Paiement physique avec workflow de validation manuelle
- Génération de reçus

## 4.6 Notifications

Responsabilités :
- Emails transactionnels (confirmation, décision dossier, reçu)
- SMS (validation commande, livreur assigné, livraison terminée)
- File de traitement via Redis Queues

## 4.7 Administration

Responsabilités :
- Gestion des utilisateurs et livreurs
- Validation des dossiers de candidature livreur (Sprint 8)
- Validation manuelle des paiements physiques
- Dashboard d'activité (commandes, livreurs, revenus)

---

# 5. Architecture Frontend

## 5.1 Application client — `speedservice.bj`

### Technologies

| Outil | Version | Rôle |
|---|---|---|
| Next.js | 16 (App Router) | Framework React SSR/SSG |
| React | 19 | UI |
| TypeScript | 5 | Typage statique |
| Tailwind CSS | 3 | Styles utilitaires |
| Leaflet + OpenStreetMap | — | Cartes interactives |

### Tokens de design

```
Primary     : #861D6D
Secondary   : #B24799
Background  : #FAF7FB
Foreground  : #1D1D1F
Font        : Inter
```

### Structure des routes (App Router)

```
app/
├── (auth)/
│   ├── login/              → /login          (connexion client)
│   ├── driver-login/       → /driver-login   (connexion livreur — migre vers rider.speedservice.bj en Sprint 8)
│   ├── register/           → /register
│   ├── forgot-password/    → /forgot-password
│   └── reset-password/     → /reset-password
├── (dashboard)/            (espace client — protégé Sanctum, rôle: client)
│   ├── dashboard/          → /dashboard
│   ├── new-delivery/       → /new-delivery
│   ├── deliveries/[id]/    → /deliveries/:id
│   │   └── payment/        → /deliveries/:id/payment
│   ├── history/            → /history
│   └── profile/            → /profile
└── driver/                 (espace rider provisoire — sera migré vers rider.speedservice.bj en Sprint 8)
    ├── missions/           → /driver/missions
    ├── active/             → /driver/active
    └── history/            → /driver/history
```

> **Note Sprint 5-7 :** L'espace rider est actuellement intégré au projet client à `/driver/*`. En Sprint 8, il sera extrait dans un projet Next.js distinct déployé sur `rider.speedservice.bj`.

### Composants partagés

```
components/
├── button.tsx          (CVA — variantes: default, outline, secondary)
├── card.tsx            (Card.Header, Card.Title, Card.Description)
├── input.tsx           (label, icon, error)
├── logo.tsx
├── status-badge.tsx    (badge par statut de livraison)
├── map-picker.tsx      (sélection d'adresse sur carte Leaflet)
└── route-map.tsx       (visualisation trajet entre deux points)

lib/
├── api.ts              (apiGet, apiPost, apiPut, apiPatch, apiDelete)
├── auth-context.tsx    (AuthContext, useAuthUser)
└── utils.ts            (cn — clsx + tailwind-merge)
```

---

## 5.2 Application rider — `rider.speedservice.bj` (Sprint 8)

### Différences avec l'app client

| Aspect | App client | App rider |
|---|---|---|
| Design | Desktop-first | Mobile-first |
| Mode | SPA | PWA (installable, offline partiel) |
| Couleurs | Palette violet clair | Palette sombre (fond `#1D1D1F`) |
| Navigation | Sidebar desktop | Barre de navigation basse (mobile) |
| Accès | Création de compte libre | Tunnel de candidature + validation admin |

### Tunnel d'inscription (7 étapes)

Voir [05 - Espace Rider.md](05%20-%20Espace%20Rider.md) pour la spécification complète.

Résumé des étapes :

1. Informations personnelles (nom, email, téléphone, ville)
2. Pièce d'identité (CNI / Passeport — upload recto/verso)
3. Véhicule (type, marque, plaque, photo)
4. Documents véhicule (permis, carte grise, assurance) — sauf cyclistes
5. Compte de paiement (MTN MoMo / Moov / banque)
6. Photo de profil (selfie)
7. Acceptation CGU + soumission

---

# 6. Architecture Backend

## 6.1 Technologies

| Outil | Version | Rôle |
|---|---|---|
| Laravel | 12 | Framework PHP |
| PHP | 8.4 | Langage |
| Laravel Sanctum | — | Authentification SPA par tokens |
| Eloquent ORM | — | Accès base de données |
| Laravel Queues | — | Jobs asynchrones (notifications) |
| Laravel Events/Listeners | — | Découplage événementiel |
| Laravel Storage | — | Upload fichiers (documents rider) |

## 6.2 Structure

```
app/
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── DeliveryController.php
│   │   ├── DriverController.php
│   │   ├── GeocodingController.php
│   │   ├── PaymentController.php
│   │   └── ProfileController.php
│   ├── Middleware/
│   └── Requests/
│       └── StoreDeliveryRequest.php
├── Models/
│   ├── User.php
│   ├── Delivery.php
│   ├── DeliveryStatusHistory.php
│   ├── Payment.php
│   ├── Address.php
│   └── NotificationLog.php
├── Enums/
│   ├── UserRole.php          (Client | Driver | Admin)
│   ├── DeliveryStatus.php    (9 statuts)
│   ├── DeliveryType.php      (standard | express)
│   ├── PackageType.php       (document | small | medium | large)
│   ├── ContentCategory.php
│   ├── PaymentMethod.php
│   └── PaymentStatus.php
├── Services/
│   └── PriceCalculator.php
└── Notifications/
    └── ResetPasswordNotification.php

routes/
├── api.php    (toutes les routes REST)
└── web.php

database/
├── migrations/
└── seeders/
```

## 6.3 Routes API principales

```
# Public
GET  /api/status
GET  /api/geo/geocode
POST /api/geo/distance
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password

# Protégées (auth:sanctum)
POST   /api/auth/logout
GET    /api/profile
PUT    /api/profile

GET    /api/deliveries
POST   /api/deliveries
GET    /api/deliveries/{id}
POST   /api/deliveries/{id}/cancel
POST   /api/deliveries/{id}/pay

# Protégées driver (auth:sanctum + rôle driver)
GET    /api/driver/missions/available
GET    /api/driver/missions
POST   /api/driver/missions/{id}/accept
POST   /api/driver/missions/{id}/decline
PATCH  /api/driver/missions/{id}/status
```

---

# 7. Authentification

## 7.1 Solution

**Laravel Sanctum** — tokens API (SPA tokens).

Le token est stocké dans `localStorage` côté frontend et transmis dans l'en-tête `Authorization: Bearer {token}`.

## 7.2 Flux de connexion

```
Utilisateur saisit email + mot de passe
          ↓
POST /api/auth/login
          ↓
Laravel vérifie les credentials
          ↓
Retourne { user: { role, ... }, token }
          ↓
Frontend lit le rôle :
  - client → /dashboard
  - driver → /driver/missions (provisoire) ou rider.speedservice.bj (Sprint 8)
  - admin  → /admin (Sprint 7)
```

## 7.3 Validation du rôle à l'entrée des espaces protégés

Chaque layout protégé appelle `GET /api/profile` au chargement et vérifie le rôle :

- Layout `(dashboard)` → redirige vers `/login` si non authentifié, vers `/driver-login` si rôle driver
- Layout `driver/` → redirige vers `/driver-login` si non authentifié, vers `/dashboard` si rôle client
- Page `/driver-login` → retourne une erreur si l'utilisateur connecté est un client

## 7.4 Rôles et permissions

| Rôle | Accès |
|---|---|
| `client` | Créer commande, payer, suivre, historique |
| `driver` | Voir missions disponibles, accepter/refuser, avancer les statuts |
| `admin` | Gestion complète de la plateforme |

---

# 8. Base de données

## 8.1 SGBD

**PostgreSQL 16+**

Toutes les clés primaires sont des **UUID** (via `HasUuids` Eloquent).

## 8.2 Schéma

### users

```
id            UUID PK
name          string
email         string UNIQUE
phone         string UNIQUE
password      string (bcrypt)
role          enum(client, driver, admin)
created_at
updated_at
```

### addresses

```
id            UUID PK
user_id       UUID FK → users
label         string
address       string
latitude      decimal(10,7)
longitude     decimal(10,7)
created_at
updated_at
```

### deliveries

```
id                  UUID PK
reference           string UNIQUE        ex: SS-2026-ABC123
client_id           UUID FK → users
driver_id           UUID FK → users NULL
status              enum                 draft | awaiting_payment | awaiting_validation
                                         confirmed | assigned | picking_up
                                         in_delivery | delivered | cancelled
package_type        enum                 document | small | medium | large
content_category    enum                 document | clothing | electronics | food | other
package_description text NULL
package_weight      decimal(8,2) NULL
delivery_type       enum                 standard | express
price               decimal(10,2)
distance            decimal(8,2) NULL    (km)
sender_name         string
sender_phone        string
pickup_address      string
pickup_latitude     decimal(10,7) NULL
pickup_longitude    decimal(10,7) NULL
recipient_name      string
recipient_phone     string
delivery_address    string
delivery_latitude   decimal(10,7) NULL
delivery_longitude  decimal(10,7) NULL
paid_at             timestamp NULL
created_at
updated_at
```

> `package_type` détermine le tarif. `content_category` est descriptif (assurance, restrictions).
> `delivery_type` est renseigné à l'étape paiement une fois les deux options tarifées.

### delivery_status_histories

```
id            UUID PK
delivery_id   UUID FK → deliveries
status        enum (même valeurs que deliveries.status)
created_at
```

### payments

```
id                    UUID PK
delivery_id           UUID FK → deliveries
amount                decimal(10,2)
method                enum  mtn_momo | moov_money | card | cash_on_delivery | agency
status                enum  pending | succeeded | failed
transaction_reference string NULL
validated_by          UUID FK → users NULL   (admin ayant validé)
validated_at          timestamp NULL
created_at
updated_at
```

> `validated_by` et `validated_at` tracent la validation manuelle des paiements physiques (cash_on_delivery, agency). Nuls pour les paiements en ligne validés automatiquement.

### notification_logs

```
id          UUID PK
user_id     UUID FK → users
channel     string (email | sms)
event       string
status      enum (sent | failed)
created_at
```

### driver_applications *(Sprint 8)*

```
id                UUID PK
user_id           UUID FK → users
status            enum  pending | under_review | approved | rejected | complement_requested
city              string
vehicle_type      enum  bicycle | motorcycle | tricycle | car
vehicle_brand     string NULL
vehicle_model     string NULL
vehicle_year      integer NULL
vehicle_color     string
license_plate     string NULL
payment_method    enum  mtn_momo | moov_money | bank
payment_account   string
payment_holder    string
review_notes      text NULL
reviewed_by       UUID FK → users NULL
reviewed_at       timestamp NULL
submitted_at      timestamp
created_at
updated_at
```

### driver_documents *(Sprint 8)*

```
id                UUID PK
application_id    UUID FK → driver_applications
type              enum  identity_front | identity_back | license_front | license_back
                        vehicle_registration | insurance | profile_photo | vehicle_photo
file_path         string   (chemin S3 ou local)
original_name     string
status            enum  pending | accepted | rejected
rejection_reason  string NULL
created_at
updated_at
```

> Les fichiers d'identité sont stockés dans un bucket privé. L'accès se fait via URL signée (TTL 15 min). Suppression automatique 12 mois après rejet définitif (RGPD).

## 8.3 Tarification

| Type de colis | Prix standard | Prix express |
|---|---|---|
| Document | 1 500 FCFA | 3 000 FCFA |
| Petit colis | 2 500 FCFA | 5 000 FCFA |
| Colis moyen | 4 000 FCFA | 8 000 FCFA |
| Grand colis | 6 500 FCFA | 13 000 FCFA |

---

# 9. Cache et performances

## Redis

| Usage | Détail |
|---|---|
| Cache applicatif | Résultats de requêtes fréquentes |
| Sessions | Stockage de sessions Laravel |
| Queues | Jobs notifications (SMS, email) |
| Rate limiting | Protection des endpoints API |

---

# 10. Intégrations externes

## Paiement

| Service | Usage |
|---|---|
| FedaPay | Cartes bancaires + agrégateur Mobile Money |
| MTN MoMo | API Mobile Money directe |
| Moov Money | API Mobile Money directe |

## Cartographie

| Service | Usage |
|---|---|
| OpenStreetMap + Nominatim | Géocodage (adresse → coordonnées) et géocodage inverse |
| Leaflet | Rendu carte côté frontend |
| Haversine (interne) | Calcul de distance entre deux points |

## Notifications

| Service | Usage |
|---|---|
| SMTP | Emails transactionnels (confirmation, reçu, dossier rider) |
| SMS Gateway | Alertes SMS (commande validée, livreur assigné, livraison) |

---

# 11. Sécurité applicative

| Menace | Contre-mesure |
|---|---|
| Authentification | Laravel Sanctum — tokens courts durée de vie |
| Mots de passe | Hashage bcrypt (Laravel `hashed` cast) |
| Injections SQL | Eloquent ORM — requêtes préparées |
| XSS | Échappement automatique React/Next.js |
| CSRF | Tokens CSRF Laravel (routes web) |
| Rate limiting | Middleware `throttle` sur tous les endpoints auth |
| Accès non autorisé | Vérification du rôle dans chaque controller driver/admin |
| Fichiers sensibles | Bucket privé S3, URL signées TTL 15 min |
| Secrets | Variables d'environnement uniquement (jamais en dur) |

---

# 12. Évolutions futures

## Version 1.1 — Rider App

- Application rider mobile-first PWA sur `rider.speedservice.bj`
- Tunnel d'inscription livreur complet (7 étapes)
- Module d'administration des dossiers de candidature
- Tableau de bord des revenus livreur

## Version 2

- Tracking GPS temps réel (WebSocket / Pusher)
- Application Android et iOS (React Native)
- Notifications WhatsApp
- Système de notation livreurs

## Version 3

- Livraison de repas (restaurants partenaires)
- Livraison de courses (supermarchés)
- Marketplace commerçants
- API partenaires
- Portefeuille électronique
