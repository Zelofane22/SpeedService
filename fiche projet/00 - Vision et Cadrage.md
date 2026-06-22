# FICHE PROJET

## 1. Informations Générales

### Nom du projet

**Speed Service**

### Secteur d'activité

Logistique, Livraison et Services numériques

### Zone géographique

République du Bénin (avec possibilité d'expansion en Afrique de l'Ouest)

### Porteur du projet

À compléter

---

# 2. Présentation du Projet

## Contexte

Le développement du commerce en ligne, des réseaux sociaux et des services numériques au Bénin entraîne une demande croissante en solutions de livraison fiables, rapides et accessibles.

Le projet **Speed Service** vise à mettre en place une plateforme numérique permettant aux particuliers, commerçants et entreprises de commander des services de livraison directement depuis un site web puis, à terme, via des applications mobiles.

L'objectif est de devenir une référence nationale dans le domaine de la logistique urbaine et interurbaine.

---

# 3. Vision

Construire la plateforme de livraison et de services la plus fiable et accessible du Bénin en facilitant les échanges entre particuliers, commerçants et consommateurs.

---

# 4. Mission

Permettre aux utilisateurs de commander, suivre et payer leurs livraisons simplement grâce à une solution numérique moderne adaptée aux réalités du marché béninois.

---

# 5. Objectifs

## Objectif principal

Développer une plateforme centralisée permettant la gestion complète des livraisons de colis et des services associés.

## Objectifs spécifiques

* Digitaliser le processus de commande de livraison.
* Réduire les délais de livraison.
* Offrir un suivi fiable par statut et historique ; la position GPS en temps réel est reportée après le MVP.
* Faciliter les paiements électroniques et physiques.
* Accompagner les commerçants dans leur développement logistique.
* Créer des opportunités d'emploi pour les livreurs.

---

# 6. Services Proposés

## Phase 1 : Livraison de colis

* Livraison de documents
* Livraison de colis
* Livraison express
* Livraison programmée
* Livraison interquartiers
* Livraison inter-villes

## Phase 2 : Livraison de repas

* Livraison depuis les restaurants partenaires
* Commande en ligne
* Suivi des commandes

## Phase 3 : Livraison de courses

* Courses de supermarchés
* Achat et livraison de produits
* Livraison à domicile

## Phase 4 : Services aux commerçants

* Gestion des livraisons e-commerce
* Tableau de bord commerçant
* Historique des commandes
* Gestion des paiements

---

# 7. Fonctionnalités de la Plateforme

## Espace Client

### Gestion du compte

* Création de compte
* Connexion sécurisée
* Modification du profil

### Commande de livraison

* Choix du point de départ
* Choix du point de destination
* Description du colis
* Sélection du type de livraison
* Estimation automatique du prix

### Paiement

* Mobile Money
* Carte bancaire
* Paiement à la livraison
* Paiement en boutique partenaire

### Suivi

* Numéro de suivi
* Historique des commandes
* Notifications automatiques

---

## Espace Livreur

* Connexion sécurisée
* Réception des missions
* Validation des étapes de livraison
* Historique des missions

> **État au 22 juin 2026 :** ces fonctions sont disponibles dans un espace provisoire intégré au frontend client (`/driver/*`). L'application PWA autonome `rider.speedservice.bj`, l'inscription documentaire, le profil enrichi et les revenus sont des travaux futurs (Sprint 8 ou version ultérieure).

---

## Espace Administrateur

* Gestion des utilisateurs
* Gestion des commandes
* Gestion des livreurs
* Gestion des paiements
* Tableau de bord statistique

> **État au 22 juin 2026 :** le Sprint 7 est en cours. Le dépôt contient le socle `/admin` et des API protégées pour les statistiques, utilisateurs, livraisons, validations de paiement, livreurs et rapports. L'affectation manuelle d'un livreur, la suspension persistante et le traitement des candidatures rider ne sont pas encore opérationnels.

---

# 8. Moyens de Paiement

## Paiement numérique

* MTN Mobile Money
* Moov Money
* Cartes bancaires
* Passerelles de paiement locales

## Paiement physique

* Paiement en agence
* Paiement auprès de partenaires agréés
* Paiement à la livraison

---

# 9. Public Cible

## Particuliers

Personnes souhaitant envoyer ou recevoir des colis rapidement.

## Commerçants

Boutiques physiques et vendeurs sur les réseaux sociaux.

## Entreprises

PME ayant des besoins réguliers de livraison.

## Restaurants

Établissements proposant la livraison de repas.

---

# 10. Modèle Économique

Les revenus de la plateforme proviendront de :

* Frais de livraison
* Commissions sur les commandes
* Abonnements commerçants
* Services premium
* Publicités et mises en avant de partenaires

---

# 11. Technologies Envisagées

## Frontend

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS 3
* Sélecteur global de thème clair/sombre avec préférence persistée

## Backend

* Laravel 12
* PHP 8.4
* API REST protégée par Laravel Sanctum

## Base de données

* PostgreSQL

## Cartographie

* OpenStreetMap
* Leaflet
* Nominatim et calcul Haversine

## Hébergement

* Développement local : Docker Compose
* Cible de production : VPS, Nginx et HTTPS (déploiement non constaté dans le dépôt)

---

# 12. Planning Prévisionnel

## Étape 1 : Socle fonctionnel — Sprints 0 à 6 terminés

* Infrastructure locale et CI
* Authentification client
* Création, cartographie et tarification des livraisons
* Paiements simulés et workflow de validation physique
* Opérations livreur provisoires
* Suivi client par statut et notifications

## Étape 2 : Administration — Sprint 7 en cours

* Back-office, statistiques et rapports
* Gestion des utilisateurs, livraisons et paiements
* Stabilisation des écrans et validation complète par lint, build et tests

## Étape 3 : Rider — Sprint 8 planifié

* Application PWA indépendante `rider.speedservice.bj`
* Tunnel de candidature et validation documentaire
* Migration de l'espace `/driver/*` provisoire

## Étape 4 : Stabilisation et déploiement — Sprint 9 planifié

* Tests d'intégration, sécurité et performances
* Préproduction, production et formation administrateur

## Étape 5 : Évolutions après MVP

* Application mobile Android
* Application mobile iOS
* Livraison de repas
* Livraison de courses

---

# 13. Facteurs Clés de Succès

* Rapidité de livraison
* Fiabilité du service
* Simplicité d'utilisation
* Tarification compétitive
* Service client réactif
* Réseau solide de livreurs et partenaires

---

# 14. Résultats Attendus

* Digitalisation du secteur de la livraison locale.
* Création d'emplois directs et indirects.
* Augmentation des ventes des commerçants partenaires.
* Amélioration de l'expérience client.
* Développement d'un acteur majeur de la logistique au Bénin.

---

# Conclusion

Speed Service ambitionne de devenir une plateforme de référence dans le domaine de la livraison au Bénin en proposant des services rapides, fiables et accessibles, adaptés aux besoins des particuliers, commerçants et entreprises.

---

## État de référence du dépôt — 22 juin 2026

| Périmètre | État constaté |
|---|---|
| Sprints 0 à 6 | Terminés selon le jalon projet et représentés dans le code |
| Sprint 7 — Administration | En cours : backend et écrans intégrés, stabilisation/validation restantes |
| Sprint 8 — Rider autonome | Planifié ; aucun dossier `rider/` ni modèle de candidature dans le dépôt |
| Sprint 9 — Déploiement | Planifié ; la documentation d'exploitation décrit une cible, pas une production existante |
| Thèmes clair/sombre | Implémentés globalement dans le frontend courant |

Les paiements électroniques sont simulés dans le code actuel. Les intégrations réelles FedaPay, MTN MoMo et Moov Money restent à brancher avant la production.
 
