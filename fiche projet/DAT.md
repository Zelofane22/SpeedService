# DOSSIER D'ARCHITECTURE TECHNIQUE (DAT)

# Projet Speed Service

**Version :** 1.0
**Date :** Juin 2026
**Auteur :** À compléter

---

# 1. Présentation

## 1.1 Objet du document

Ce document décrit l'architecture technique du MVP de la plateforme **Speed Service**.

Il sert de référence pour :

* Les développeurs
* Les administrateurs systèmes
* Les DevOps
* Les futurs mainteneurs

---

# 2. Présentation de la solution

## 2.1 Objectif

Permettre aux utilisateurs de :

* Créer une commande de livraison
* Payer en ligne ou physiquement
* Suivre leur commande
* Interagir avec les livreurs

---

## 2.2 Types d'utilisateurs

### Client

Création et suivi des commandes.

### Livreur

Gestion des missions de livraison.

### Administrateur

Gestion de l'ensemble de la plateforme.

---

# 3. Architecture globale

## 3.1 Vue d'ensemble

```text
┌─────────────────────────┐
│      Client Web         │
│        Next.js          │
└────────────┬────────────┘
             │ HTTPS
             ▼
┌─────────────────────────┐
│      API Laravel 12     │
│        Backend          │
└────────────┬────────────┘
             │
 ┌───────────┼───────────┐
 │           │           │
 ▼           ▼           ▼

PostgreSQL   Redis    Services externes

                      - FedaPay
                      - MTN MoMo
                      - Moov Money
                      - OpenStreetMap
                      - SMS
                      - Email
```

---

# 4. Architecture applicative

## 4.1 Style architectural

Architecture :

**Monolithe modulaire**

Justification :

* Développement rapide
* Coût réduit
* Maintenance simplifiée
* Évolutivité vers microservices

---

## 4.2 Modules métier

### Authentification

Responsabilités :

* Inscription
* Connexion
* Gestion des rôles
* Gestion des permissions

---

### Clients

Responsabilités :

* Profil utilisateur
* Adresses
* Historique

---

### Livraisons

Responsabilités :

* Création commande
* Calcul tarif (basé sur `package_type`, `package_weight`, `distance` et `delivery_type`)
* Affectation livreur
* Gestion statuts (9 statuts du cycle de vie, cf. §8 table `deliveries`)

---

### Livreurs

Responsabilités :

* Gestion missions
* Disponibilité
* Historique

---

### Paiements

Responsabilités :

* Paiement Mobile Money
* Paiement carte
* Paiement physique

---

### Notifications

Responsabilités :

* SMS
* Emails
* Notifications futures

---

### Administration

Responsabilités :

* Gestion utilisateurs
* Gestion commandes
* Reporting

---

# 5. Architecture Frontend

## Technologies

* Next.js 15
* React 19
* TypeScript
* TailwindCSS
* Shadcn UI
* TanStack Query (React Query)
* React Hook Form + Zod
* Leaflet + OpenStreetMap
* Axios (client HTTP)

---

## Structure

```text
src/
├── app/
│   ├── (public)/          (pages publiques : accueil, tarifs, contact)
│   ├── (auth)/            (connexion, inscription)
│   ├── (client)/          (espace client)
│   ├── (driver)/          (espace livreur)
│   └── (admin)/           (back-office)
├── components/
│   ├── ui/                (composants Shadcn)
│   ├── forms/
│   ├── maps/
│   └── shared/
├── services/              (appels API)
├── hooks/                 (hooks personnalisés)
├── lib/                   (axios, utils)
├── types/                 (types TypeScript partagés)
├── stores/                (Zustand si nécessaire)
└── constants/
```

---

# 6. Architecture Backend

## Technologies

* Laravel 12
* PHP 8.4
* Laravel Sanctum (authentification SPA)
* Eloquent ORM
* Laravel Queues (Redis)
* Laravel Notifications (SMS, Email)
* Laravel Events / Listeners
* Laravel Pulse (monitoring)

---

## Structure

```text
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   ├── Client/
│   │   ├── Driver/
│   │   └── Admin/
│   ├── Middleware/
│   └── Requests/
├── Models/
├── Services/
│   ├── DeliveryService.php
│   ├── PricingService.php
│   ├── PaymentService.php
│   └── NotificationService.php
├── Repositories/
├── Policies/
├── Notifications/
│   ├── OrderCreated.php
│   ├── DriverAssigned.php
│   ├── DeliveryStarted.php
│   └── DeliveryCompleted.php
├── Jobs/
├── Events/
└── Listeners/

routes/
├── api.php       (routes API REST)
└── web.php       (webhook FedaPay uniquement)

database/
├── migrations/
└── seeders/
```

---

# 7. Authentification

## Solution retenue

Laravel Sanctum

---

## Flux

```text
Utilisateur

    │

Connexion

    │

Laravel Sanctum

    │

Token API

    │

Accès aux ressources
```

---

## Rôles

### CLIENT

Permissions :

* Créer commande
* Suivre commande

### DRIVER

Permissions :

* Voir missions
* Mettre à jour statuts

### ADMIN

Permissions :

* Gestion complète

---

# 8. Base de données

## SGBD

PostgreSQL

Version recommandée :

16+

---

## Tables principales

### users

```text
id
name
email
phone
password
role
created_at
updated_at
```

---

### addresses

```text
id
user_id
label
address
latitude
longitude
```

---

### deliveries

```text
id
reference
client_id
driver_id
status                (draft | awaiting_payment | awaiting_validation | confirmed | assigned | picking_up | in_delivery | delivered | cancelled)
price
distance
delivery_type         (standard | express)
package_type          (document | small | medium | large)
content_category      (document | clothing | electronics | food | other)
package_description
package_weight
sender_name
sender_phone
pickup_address
pickup_latitude
pickup_longitude
recipient_name
recipient_phone
delivery_address
delivery_latitude
delivery_longitude
paid_at
created_at
updated_at
```

> `package_type` détermine le tarif (taille/poids). `content_category` est un champ descriptif distinct, sans incidence tarifaire, qui qualifie la nature du contenu (utile pour l'assurance et les éventuelles restrictions de transport — cf. Cahier des charges §4.3).
> `status` couvre désormais explicitement les 9 statuts du cycle de vie défini au Cahier des charges §4.5 (au lieu d'un type libre non énuméré).
> `delivery_type` est renseigné à l'étape de paiement du tunnel de commande (cf. Cahier des charges §4.4), une fois le tarif des deux options calculé à partir de `package_type`, `package_weight` et `distance`.

---

### delivery_status_history

```text
id
delivery_id
status
created_at
```

---

### payments

```text
id
delivery_id
amount
method                 (mtn_momo | moov_money | card | cash_on_delivery | agency)
status                 (pending | succeeded | failed)
transaction_reference
validated_by
validated_at
```

> Ajout de `validated_by` (id de l'administrateur) et `validated_at` (horodatage) pour tracer la validation manuelle des paiements physiques (`cash_on_delivery`, `agency`), conformément à la règle métier du Cahier des charges §7 : "Les commandes avec paiement physique nécessitent une validation manuelle." Ces deux colonnes restent nulles pour les paiements en ligne validés automatiquement par le fournisseur (FedaPay, MTN MoMo, Moov Money).

---

### notifications

```text
id
user_id
channel
message
status
```

---

# 9. Cache et performances

## Redis

Utilisations :

* Cache
* Sessions
* Queues
* Limitation de débit

---

# 10. Intégrations externes

## Paiement

### FedaPay

Utilisation :

* Cartes bancaires
* Mobile Money

---

### MTN Mobile Money

Paiement mobile.

---

### Moov Money

Paiement mobile.

---

# 11. Cartographie

## OpenStreetMap

Fonctions :

* Recherche d'adresses
* Géocodage
* Calcul distance

---

# 12. Notifications

## SMS

Événements :

* Commande créée
* Paiement validé
* Livreur assigné
* Livraison terminée

---

## Email

Même logique que les SMS.

---

# 13. Infrastructure

## Serveur

Ubuntu Server 24.04 LTS

---

## Reverse Proxy

Nginx

---

## Conteneurisation

Docker

Docker Compose

---

# 14. Architecture de déploiement

```text
┌──────────────────────────┐
│        Internet          │
└────────────┬─────────────┘
             │
             ▼

┌──────────────────────────┐
│         Nginx            │
└───────┬───────────┬──────┘
        │           │

        ▼           ▼

┌────────────┐ ┌────────────┐
│  Next.js   │ │ Laravel API│
└──────┬─────┘ └──────┬─────┘
       │              │
       └──────┬───────┘
              ▼

      ┌─────────────┐
      │ PostgreSQL  │
      └─────────────┘

              ▼

      ┌─────────────┐
      │    Redis    │
      └─────────────┘
```

---

# 15. Sécurité

## Transport

* HTTPS obligatoire
* TLS 1.3

---

## Authentification

* Laravel Sanctum
* Hashage bcrypt

---

## Protection

* CSRF
* XSS
* SQL Injection
* Rate Limiting

---

## Sauvegardes

* Sauvegarde quotidienne PostgreSQL
* Conservation 30 jours

---

# 16. Monitoring

## Application

* Laravel Pulse
* Laravel Telescope (hors production)

---

## Infrastructure

* Uptime Kuma
* Grafana
* Prometheus

---

# 17. Journalisation

Logs :

* Authentification
* Paiements
* Livraisons
* Erreurs système

Conservation :

* 90 jours minimum

---

# 18. Évolutions futures

## Version 2

* Application Android
* Application iOS
* Tracking GPS temps réel
* Notifications WhatsApp

---

## Version 3

* Livraison repas
* Livraison courses
* Marketplace commerçants
* API partenaires

---

# FIN DU DOCUMENT