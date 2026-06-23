# DAT — ARCHITECTURE APPLICATIVE
# Speed Service

**Version :** 1.2 — MVP (état du dépôt au 23 juin 2026)
**Date :** Juin 2026
**Complément :** [04 - DAT Infrastructure.md](04%20-%20DAT%20Infrastructure.md)

---

# 1. Objet du document

Ce document décrit l'**architecture logicielle** de la plateforme Speed Service : structure des applications, choix technologiques, modules métier, schéma de base de données, authentification et intégrations externes.

Pour la configuration des serveurs, du réseau, du déploiement et de la CI/CD, voir [04 - DAT Infrastructure.md](04%20-%20DAT%20Infrastructure.md).

---

# 2. Vue d'ensemble applicative

Le dépôt courant contient **trois applications exécutables** : le frontend client Next.js, le back-office Next.js autonome et l'API Laravel. L'espace rider reste provisoirement intégré au frontend client.

```
frontend/ (Next.js 16)
├── site public et authentification
├── espace client
└── espace rider /driver (provisoire)
admin/ (Next.js 15 — Sprint 7 en cours)
└── back-office destiné à admin.speedservice.bj
              │ HTTP / JSON + Bearer token
              ▼
backend/ (Laravel 12 API)
├── PostgreSQL
├── Redis pour les files de notifications
└── SMTP / passerelle SMS selon configuration
```

| Élément | État courant | Cible |
|---|---|---|
| `frontend/` | Client + rider provisoire | Client sur `speedservice.bj` |
| `admin/` | Back-office autonome, Sprint 7 en cours | `admin.speedservice.bj` |
| `rider/` | Absent | PWA mobile-first sur `rider.speedservice.bj` au Sprint 8 |
| `backend/` | API Laravel REST partagée | `api.speedservice.bj` au déploiement |

L'architecture finale à quatre applications (client, admin, rider et API) reste une cible de déploiement ; aucun déploiement public n'est constaté dans le dépôt.

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
- Paiement carte bancaire
- Paiement physique avec workflow de validation manuelle
- Génération de reçus

Les paiements en ligne sont simulés dans le code actuel ; les passerelles opérateur/FedaPay ne sont pas intégrées.

## 4.6 Notifications

Responsabilités :
- Emails transactionnels (confirmation, décision dossier, reçu)
- SMS (validation commande, livreur assigné, livraison terminée)
- File de traitement via Redis Queues

Le Sprint 6 implémente quatre événements de livraison : commande confirmée, livreur affecté, colis récupéré et colis livré. Les emails et SMS utilisent respectivement le mailer et le driver SMS configurés (journalisation possible en local).

## 4.7 Administration

Responsabilités :
- Gestion des utilisateurs et livreurs
- Validation des dossiers de candidature livreur (Sprint 8)
- Validation manuelle des paiements physiques
- Dashboard d'activité (commandes, livreurs, revenus)

Le socle Sprint 7 inclut aussi des rapports, le changement de rôle et une suspension persistante via `users.is_active`. Les dossiers de candidature rider ne sont pas encore disponibles. Le frontend correspondant a été extrait dans `admin/` et reste un chantier en cours piloté par Claude.

---

# 5. Architecture des frontends

## 5.1 Application client — `speedservice.bj`

### Technologies

| Outil | Version | Rôle |
|---|---|---|
| Next.js | 16 (App Router) | Framework React SSR/SSG |
| React | 19 | UI |
| TypeScript | 6 | Typage statique |
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

Le thème clair/sombre est géré globalement par une classe `dark`, des variables CSS, la préférence système et `localStorage`. Le bouton fixe « Thème » est rendu par le layout racine, donc disponible sur toutes les routes du frontend actuel.

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
│   ├── missions/           → /driver/missions
│   ├── active/             → /driver/active
│   └── history/            → /driver/history
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
├── route-map.tsx       (visualisation trajet entre deux points)
├── notification-bell.tsx
└── theme-toggle.tsx    (sélecteur clair/sombre global)

lib/
├── api.ts              (apiGet, apiPost, apiPut, apiPatch, apiDelete)
├── auth-context.tsx    (AuthContext, useAuthUser)
└── utils.ts            (cn — clsx + tailwind-merge)
```

---

## 5.2 Application administrateur — `admin.speedservice.bj` (Sprint 7)

L'application `admin/`, distincte du client, utilise Next.js 15, React 19, TypeScript et Tailwind CSS 3. Elle écoute sur le port local 3001.

```
admin/app/
├── (auth)/login/       → /login
└── (dashboard)/
    ├── page.tsx        → /
    ├── orders/         → /orders
    ├── clients/        → /clients
    ├── couriers/       → /couriers
    └── payments/       → /payments
```

Elle partage l'API Laravel et les endpoints `/api/admin/*` protégés par `auth:sanctum` et `EnsureAdmin`. Le Sprint 7 reste en cours jusqu'à stabilisation des contrats API et validation de son lint/build.

---

## 5.3 Application rider cible — `rider.speedservice.bj` (Sprint 8)

Cette application n'existe pas encore dans le dépôt. Le tableau suivant décrit la cible après extraction de `/driver/*`.

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
| Laravel Notifications/Jobs | — | Emails et SMS asynchrones |
| Laravel Storage | — | Cible Sprint 8 pour les documents rider |

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
│   │   ├── NotificationController.php
│   │   ├── AdminController.php
│   │   └── ProfileController.php
│   ├── Middleware/
│   │   └── EnsureAdmin.php
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
│   ├── PriceCalculator.php
│   ├── DeliveryNotificationService.php
│   └── SmsService.php
├── Jobs/
│   └── SendDeliverySms.php
└── Notifications/
    ├── ResetPasswordNotification.php
    └── DeliveryUpdateNotification.php

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

GET    /api/notifications
PATCH  /api/notifications/read-all
PATCH  /api/notifications/{id}/read

# Protégées driver (auth:sanctum + rôle driver)
GET    /api/driver/missions/available
GET    /api/driver/missions
POST   /api/driver/missions/{id}/accept
POST   /api/driver/missions/{id}/decline
PATCH  /api/driver/missions/{id}/status

# Protégées admin (auth:sanctum + middleware admin)
GET    /api/admin/stats
GET    /api/admin/users
GET    /api/admin/users/{id}
PATCH  /api/admin/users/{id}/role
GET    /api/admin/deliveries
GET    /api/admin/deliveries/{id}
PATCH  /api/admin/deliveries/{id}/status
POST   /api/admin/deliveries/{id}/validate-payment
GET    /api/admin/drivers
PATCH  /api/admin/drivers/{id}/toggle-active
GET    /api/admin/reports
```

---

# 7. Authentification

## 7.1 Solution

**Laravel Sanctum** — tokens API (SPA tokens).

Le token est stocké dans `localStorage` côté client. L'application admin le conserve dans `localStorage` pour les appels API et dans un cookie pour son middleware de navigation. Les appels métier le transmettent dans l'en-tête `Authorization: Bearer {token}`.

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
  - admin  → admin.speedservice.bj
```

La connexion du frontend client redirige désormais un administrateur vers `NEXT_PUBLIC_ADMIN_URL` (par défaut `http://localhost:3001`). L'application admin expose aussi sa propre page `/login`.

## 7.3 Validation du rôle à l'entrée des espaces protégés

Chaque layout protégé appelle `GET /api/profile` au chargement et vérifie le rôle :

- Layout `(dashboard)` → redirige vers `/login` si non authentifié
- Layout `driver/` → redirige vers `/driver-login` si non authentifié, vers `/dashboard` si rôle client
- Middleware `admin/` → redirige vers `/login` si le cookie de token est absent ; l'autorisation métier reste imposée par `EnsureAdmin` côté API
- Page `/driver-login` → retourne une erreur si l'utilisateur connecté est un client

Le layout client ne vérifie pas encore explicitement le rôle après `GET /api/profile`. Cette protection frontend doit être harmonisée ; les endpoints admin restent protégés côté serveur par `EnsureAdmin`.

## 7.4 Rôles et permissions

| Rôle | Accès |
|---|---|
| `client` | Créer commande, payer, suivre, historique |
| `driver` | Voir missions disponibles, accepter/refuser, avancer les statuts |
| `admin` | Endpoints de back-office du Sprint 7 en cours (statistiques, utilisateurs, livraisons, paiements, livreurs, rapports) |

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
full_address  text
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
distance            decimal(10,2) NULL   (km)
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
> `delivery_type` et `payment_method` sont choisis dans la dernière étape du wizard avant la création ; la page `/deliveries/{id}/payment` exécute ensuite le parcours adapté. Le prix actuel dépend uniquement du type de colis et du service, pas du poids ni de la distance.

### delivery_status_histories

```
id            UUID PK
delivery_id   UUID FK → deliveries
status        enum (même valeurs que deliveries.status)
note          text NULL
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
id            UUID PK
user_id       UUID FK → users
delivery_id   UUID FK → deliveries NULL
event         string NULL
channel       enum (email | sms | in_app)
title         string
message       text
data          json NULL
read_at       timestamp NULL
created_at
updated_at
```

Une contrainte unique `(user_id, delivery_id, event, channel)` garantit l'idempotence. Le schéma ne suit pas encore un état d'envoi `sent/failed` pour les canaux externes.

### driver_applications *(cible Sprint 8 — table absente)*

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

### driver_documents *(cible Sprint 8 — table absente)*

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

> Cible Sprint 8 : les fichiers d'identité seront stockés dans un bucket privé, accessibles via URL signée (TTL 15 min), avec une politique de conservation à valider juridiquement. Rien de ce mécanisme n'est encore présent dans le dépôt.

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
| Cache applicatif | Stockage fichier par défaut dans la configuration actuelle |
| Sessions | Stockage fichier dans la configuration actuelle |
| Queues | Jobs notifications (SMS, email) |
| Rate limiting | À configurer explicitement avant production |

Redis est configuré comme backend de queue. Il n'est pas le backend par défaut du cache ou des sessions dans `.env.example`.

---

# 10. Intégrations externes

## Paiement

| Service | Usage |
|---|---|
| Simulation interne | Parcours carte, MTN MoMo et Moov Money du MVP courant |
| FedaPay / API opérateurs | Cible de production à choisir et intégrer |

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
| Authentification | Laravel Sanctum — Bearer tokens ; politique d'expiration à définir |
| Mots de passe | Hashage bcrypt (Laravel `hashed` cast) |
| Injections SQL | Eloquent ORM — requêtes préparées |
| XSS | Échappement automatique React/Next.js |
| CSRF | API authentifiée par Bearer token ; CORS à finaliser pour la production |
| Rate limiting | À appliquer explicitement aux endpoints sensibles avant production |
| Accès non autorisé | Vérification du rôle dans chaque controller driver/admin |
| Fichiers sensibles | Cible Sprint 8 : bucket privé S3 et URL signées TTL 15 min |
| Secrets | Variables d'environnement uniquement (jamais en dur) |

---

# 12. Évolutions futures

## Sprint 8 — Rider App

- Application rider mobile-first PWA sur `rider.speedservice.bj`
- Tunnel d'inscription livreur complet (7 étapes)
- Module d'administration des dossiers de candidature
- Migration des fonctions de missions depuis `/driver/*`

## Version 2

- Tracking GPS temps réel (WebSocket / Pusher)
- Application Android et iOS (React Native)
- Notifications WhatsApp
- Système de notation livreurs
- Tableau de bord des revenus livreur

## Version 3

- Livraison de repas (restaurants partenaires)
- Livraison de courses (supermarchés)
- Marketplace commerçants
- API partenaires
- Portefeuille électronique
