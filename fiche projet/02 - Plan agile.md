# PLAN AGILE COMPLET – SPEED SERVICE

## Plateforme de Livraison de Colis au Bénin

Version : 1.0
Produit : Speed Service
Méthodologie : Scrum Agile
Durée MVP estimée : 4 à 5 mois

---

# 1. Vision Produit

## Contexte

Au Bénin, les particuliers et les entreprises rencontrent souvent des difficultés pour organiser des livraisons rapides, fiables et traçables.

Speed Service vise à digitaliser entièrement le processus de livraison de colis grâce à une plateforme web permettant :

* La commande en ligne.
* Le suivi des livraisons.
* La gestion des livreurs.
* Le paiement numérique ou physique.
* L'administration centralisée des opérations.

---

# 2. Objectifs du MVP

Le MVP doit permettre :

### Côté Client

* Créer un compte.
* Commander une livraison.
* Connaître le prix estimé.
* Payer.
* Suivre la livraison.
* Consulter l'historique.

### Côté Livreur

* Recevoir des missions.
* Accepter ou refuser une mission.
* Mettre à jour les statuts.

### Côté Administrateur

* Superviser l'activité.
* Affecter des livreurs.
* Gérer les paiements.
* Consulter les statistiques.

---

# 3. Architecture Produit

## Acteurs

### Client

Expéditeur du colis.

### Destinataire

Récepteur du colis.

### Livreur

Agent de livraison.

### Administrateur

Gestionnaire de la plateforme.

---

# 4. Product Backlog

## EPIC 1 — Gestion des Comptes

### Feature : Authentification

#### US-001

En tant que visiteur,
je souhaite créer un compte,
afin d'utiliser la plateforme.

Priorité : Must Have
Story Points : 5

Critères d'acceptation :

* Email obligatoire.
* Téléphone obligatoire.
* Mot de passe sécurisé.
* Validation des données.

---

#### US-002

Connexion utilisateur

Priorité : Must Have
SP : 3

---

#### US-003

Réinitialisation du mot de passe

Priorité : Must Have
SP : 3

---

#### US-004

Modification du profil

Priorité : Should Have
SP : 2

---

## EPIC 2 — Création de Livraison

### Feature : Commande

#### US-005

Créer une demande de livraison.

Données :

* Nom expéditeur
* Téléphone expéditeur
* Adresse départ
* Nom destinataire
* Téléphone destinataire
* Adresse destination
* Description colis

Priorité : Must Have
SP : 8

---

#### US-006

Choisir le type de colis.

Exemples :

* Document
* Petit colis
* Moyen colis
* Gros colis

Priorité : Must Have
SP : 3

Critères d'acceptation :

* Champ obligatoire, distinct de la catégorie de contenu (US-006bis).
* Sert de base au calcul automatique du prix (US-007).

---

#### US-006bis

En tant que client,
je souhaite indiquer la catégorie de contenu de mon colis,
afín que le livreur et la plateforme connaissent la nature de l'objet transporté.

Catégories disponibles :

* Documents & Papiers
* Vêtements & Textile
* Électronique
* Alimentaire
* Autres

Priorité : Must Have
SP : 2

Critères d'acceptation :

* Champ obligatoire, distinct du type de colis (US-006).
* N'intervient pas dans le calcul du prix.
* Affiché séparément du type de colis dans le récapitulatif de commande (US-008) et dans le détail de mission livreur.

---

#### US-007

Calcul automatique du prix.

Priorité : Must Have
SP : 8

Critères d'acceptation :

* Le prix est calculé à partir du type de colis (US-006), du poids, de la distance et du service de livraison choisi (US-013bis).
* Le choix du service de livraison intervient à l'étape paiement (cf. US-013bis), donc le prix définitif n'est affiché qu'à cette étape.

---

#### US-008

Validation de commande.

Priorité : Must Have
SP : 3

---

## EPIC 3 — Cartographie & Géolocalisation

### Feature : Localisation

#### US-009

Sélectionner le point d'enlèvement sur carte.

SP : 5

---

#### US-010

Sélectionner le point de livraison sur carte.

SP : 5

---

#### US-011

Afficher le trajet estimé.

SP : 8

---

#### US-012

Calculer automatiquement la distance.

SP : 5

---

## EPIC 4 — Paiement

### Feature : Choix du service et paiement

#### US-013bis

En tant que client,
je souhaite choisir mon service de livraison (standard ou express) au moment du paiement,
afín de voir le tarif exact de chaque option avant de payer.

Priorité : Must Have
SP : 3

Critères d'acceptation :

* Affiché en premier sur l'étape "Paiement", avant le choix du mode de paiement.
* Les deux options (Standard, Express) affichent chacune leur tarif calculé à partir du type de colis et du poids (US-006, US-007).
* Le total de la commande se met à jour automatiquement selon le service sélectionné.

### Feature : Paiement Mobile Money

#### US-013

Paiement Mobile Money.

SP : 8

---

#### US-014

Paiement par carte bancaire.

SP : 8

---

#### US-015

Paiement physique en agence.

SP : 3

Critères d'acceptation :

* Inclut "Paiement à la livraison" et "Paiement en agence".
* Les deux modes placent la commande au statut "En attente de validation" jusqu'à validation manuelle par un administrateur (cf. US-039).

---

#### US-016

Génération de reçu.

SP : 3

---

## EPIC 5 — Gestion des Livraisons

### Feature : Cycle de vie

#### US-017

Création du statut :

* En attente

SP : 1

---

#### US-018

Statut :

* Affectée

SP : 1

---

#### US-019

Statut :

* En cours de récupération

SP : 1

---

#### US-020

Statut :

* En transit

SP : 1

---

#### US-021

Statut :

* Livrée

SP : 1

---

#### US-022

Statut :

* Annulée

SP : 1

---

## EPIC 6 — Gestion des Livreurs

> **Note architecturale** : L'espace livreur est une application web distincte déployée sur le sous-domaine `rider.speedservice.bj`. Elle utilise le même backend Laravel (endpoints `/driver/*`). Le tunnel d'inscription fait l'objet du Sprint 8 (MVP). Voir [Espace Rider.md](Espace%20Rider.md) pour la spécification complète.

### Feature : Opérations livreur (MVP — `rider.speedservice.bj`)

#### US-023

Connexion livreur via page dédiée (`/driver-login`).

SP : 3

Critères d'acceptation :

* Page séparée de la connexion client.
* Validation du rôle : un compte client ne peut pas accéder à l'espace livreur.
* Redirect automatique vers la liste des missions si déjà authentifié.

---

#### US-024

Liste des missions disponibles.

SP : 5

Critères d'acceptation :

* Affiche uniquement les livraisons au statut `Confirmed` sans livreur affecté.
* Informations visibles : référence, adresses de collecte et livraison, type de colis, prix, distance estimée.
* Actualisation manuelle (bouton) ou automatique toutes les 30 secondes.

---

#### US-025

Acceptation d'une mission.

SP : 3

Critères d'acceptation :

* La mission passe au statut `Assigned` et le `driver_id` est enregistré.
* La mission disparaît de la liste des missions disponibles pour les autres livreurs.
* Le livreur est redirigé vers la vue "Mission en cours".

---

#### US-026

Refus d'une mission.

SP : 2

Critères d'acceptation :

* La mission reste disponible pour les autres livreurs (aucun changement de statut).
* La mission masquée localement pour la session en cours (sans persistance en MVP).

---

#### US-027

Mise à jour du statut de livraison.

SP : 5

Transitions autorisées (dans l'ordre) :

* `Assigned` → `PickingUp` (En route vers l'enlèvement)
* `PickingUp` → `InDelivery` (Colis récupéré, départ livraison)
* `InDelivery` → `Delivered` (Livraison confirmée)

Critères d'acceptation :

* Chaque transition est historisée dans `delivery_status_histories`.
* Un seul bouton d'action contextuel est affiché selon le statut actuel.
* La transition `Delivered` archive la mission dans l'historique.

---

#### US-028

Historique des missions.

SP : 3

Critères d'acceptation :

* Liste toutes les missions terminées (statuts `Delivered` et `Cancelled`) du livreur connecté.
* Affiche : référence, date, trajet, statut final, montant.

---

### Feature : Inscription livreur (Sprint 8 — `rider.speedservice.bj/rejoindre`)

> Tunnel de candidature en 7 étapes, validation manuelle par un administrateur. Voir [Espace Rider.md](Espace%20Rider.md) pour le détail complet de chaque étape.

#### US-R01

Accéder au formulaire de candidature livreur.

SP : 2 — Priorité : Must Have (Sprint 8)

---

#### US-R02

Saisir ses informations personnelles (nom, email, téléphone, date de naissance, ville d'intervention, mot de passe).

SP : 3 — Priorité : Must Have (Sprint 8)

---

#### US-R03

Uploader sa pièce d'identité (CNI / Passeport / Carte de séjour — recto/verso).

SP : 5 — Priorité : Must Have (Sprint 8)

---

#### US-R04

Déclarer son véhicule (type, marque, modèle, plaque, photo).

SP : 5 — Priorité : Must Have (Sprint 8)

---

#### US-R05

Uploader les documents du véhicule (permis, carte grise, assurance). Ignoré pour les cyclistes.

SP : 5 — Priorité : Must Have (Sprint 8)

---

#### US-R06

Renseigner ses informations de paiement (MTN MoMo / Moov Money / banque).

SP : 3 — Priorité : Must Have (Sprint 8)

---

#### US-R07

Uploader sa photo de profil (selfie fond neutre).

SP : 2 — Priorité : Must Have (Sprint 8)

---

#### US-R08

Accepter les CGU, la charte livreur et soumettre sa candidature.

SP : 2 — Priorité : Must Have (Sprint 8)

---

#### US-R09

Recevoir un email de confirmation immédiat après soumission.

SP : 2 — Priorité : Must Have (Sprint 8)

---

#### US-R10

Suivre l'état de sa candidature (pending / under_review / approved / rejected / complement_requested).

SP : 3 — Priorité : Should Have (Sprint 8)

---

#### US-R11

Être notifié par email de la décision de l'administrateur (validé / rejeté avec motif / complément demandé).

SP : 3 — Priorité : Must Have (Sprint 8)

---

#### US-R12

Soumettre des documents complémentaires si l'admin le demande.

SP : 3 — Priorité : Should Have (Sprint 8)

---

## EPIC 7 — Suivi Client

### Feature : Tracking

#### US-029

Suivi en temps réel.

SP : 8

---

#### US-030 *(reportée en Version 2 — hors périmètre MVP)*

Affichage de la position du livreur en temps réel (GPS).

SP : 13

> Aucun élément d'interface du MVP (site web, back-office admin) ne doit faire référence au suivi GPS temps réel. Le suivi client en MVP se limite à l'affichage du statut de la commande (US-029).

---

#### US-031

Historique des commandes.

SP : 3

---

## EPIC 8 — Notifications

### Feature : Alertes

#### US-032

Notification commande validée.

SP : 2

---

#### US-033

Notification livreur affecté.

SP : 2

---

#### US-034

Notification colis récupéré.

SP : 2

---

#### US-035

Notification colis livré.

SP : 2

---

## EPIC 9 — Administration

### Feature : Back-office

#### US-036

Gestion utilisateurs.

SP : 5

---

#### US-037

Gestion livreurs.

SP : 5

---

#### US-038

Gestion commandes.

SP : 8

---

#### US-039

Gestion paiements.

SP : 8

Critères d'acceptation :

* Bouton "Valider le paiement" disponible pour chaque paiement au statut "En attente" lié à un mode "Paiement à la livraison" ou "Paiement en agence".
* La validation fait passer le paiement à "Réussi" et la commande associée au statut "Confirmée".

---

#### US-040

Dashboard d'activité.

SP : 13

---

# 5. Planification des Sprints

## Sprint 0 (2 semaines)

### Objectifs

* Architecture technique
* Modélisation base de données
* Wireframes
* Design UI
* Mise en place Git
* CI/CD

Livrables :

* Environnement prêt
* Maquettes validées

---

## Sprint 1

### Authentification

US :

* 001
* 002
* 003
* 004

Objectif :

Utilisateur opérationnel.

---

## Sprint 2

### Commandes

US :

* 005
* 006
* 007
* 008

Objectif :

Créer une livraison.

---

## Sprint 3

### Géolocalisation

US :

* 009
* 010
* 011
* 012

Objectif :

Calcul automatique du trajet.

---

## Sprint 4

### Paiement

US :

* 013
* 014
* 015
* 016

Objectif :

Commande payable.

---

## Sprint 5

### Gestion livreurs + Cycle de vie des statuts

US :

* 017 — Statut : En attente
* 018 — Statut : Affectée
* 019 — Statut : En cours de récupération
* 020 — Statut : En transit
* 021 — Statut : Livrée
* 022 — Statut : Annulée
* 023 — Connexion livreur
* 024 — Liste des missions disponibles
* 025 — Acceptation d'une mission
* 026 — Refus d'une mission
* 027 — Mise à jour du statut de livraison
* 028 — Historique des missions

Objectif :

Flux opérationnel de livraison complet.

---

## Sprint 6

### Suivi client + Notifications

US :

* 029 — Suivi de commande (numéro + statut + historique)
* 031 — Historique des commandes client
* 032 — Notification commande validée
* 033 — Notification livreur affecté
* 034 — Notification colis récupéré
* 035 — Notification colis livré

Objectif :

Client informé à chaque étape de sa livraison.

Note : US-030 (affichage position GPS du livreur en temps réel) reportée en Version 2 — exclue du périmètre MVP.

---

## Sprint 7

### Administration

US :

* 036 — Gestion utilisateurs
* 037 — Gestion livreurs (liste, suspension, **validation des dossiers de candidature rider**)
* 038 — Gestion commandes
* 039 — Gestion paiements
* 040 — Dashboard d'activité

Objectif :

Back-office fonctionnel, y compris la validation manuelle des dossiers livreur.

Critères d'acceptation spécifiques US-037 (dossiers rider) :

* L'admin peut consulter les dossiers en attente (`pending`, `under_review`).
* L'admin peut visualiser tous les documents uploadés (pièce d'identité, véhicule, permis, assurance) via URL signée.
* L'admin peut **valider** un dossier → statut `approved`, email d'activation envoyé au livreur.
* L'admin peut **rejeter** un dossier avec motif → statut `rejected`, email avec motif envoyé.
* L'admin peut **demander un complément** → statut `complement_requested`, email avec instructions.
* L'admin peut **suspendre** un livreur actif.

---

## Sprint 8

### Rider App — Tunnel d'inscription + Application `rider.speedservice.bj`

Objectif :

Livreur autonome : candidature en ligne, validation par l'admin, accès à l'espace rider sur sous-domaine dédié.

#### 8.1 Backend — Modèles et migrations

* Migration `driver_applications` (statut, véhicule, paiement, dates)
* Migration `driver_documents` (type, fichier, statut de validation)
* Model `DriverApplication` + `DriverDocument`
* Laravel Storage configuré (disque S3 ou local sécurisé pour les documents d'identité)

#### 8.2 Backend — API tunnel d'inscription

* `POST /api/rider/apply` — soumettre une candidature (étapes 1–7)
* `POST /api/rider/apply/documents` — upload des documents
* `GET  /api/rider/apply/status` — consulter l'état de son dossier
* `POST /api/rider/apply/complement` — soumettre des documents complémentaires
* Email automatique à chaque changement de statut (confirmation, décision, complément)

#### 8.3 Frontend — Application `rider.speedservice.bj`

Nouveau projet Next.js distinct, mobile-first, PWA.

US tunnel :

* R01 — Page d'accueil rider + accès au formulaire de candidature
* R02 — Étape 1 : Informations personnelles (nom, email, téléphone, ville, mot de passe)
* R03 — Étape 2 : Pièce d'identité (CNI/Passeport — upload recto/verso)
* R04 — Étape 3 : Déclaration du véhicule (type, marque, plaque, photo)
* R05 — Étape 4 : Documents du véhicule (permis, carte grise, assurance) — ignoré si vélo
* R06 — Étape 5 : Informations de paiement (MTN MoMo / Moov / banque)
* R07 — Étape 6 : Photo de profil (selfie)
* R08 — Étape 7 : Acceptation CGU + soumission
* R09 — Email de confirmation immédiat après soumission
* R10 — Page de suivi de candidature (statut en temps réel)
* R11 — Notification de décision (email validé / rejeté / complément demandé)
* R12 — Page de soumission de documents complémentaires

US opérationnel (migration depuis MVP provisoire) :

* Espace livreur connecté sur `rider.speedservice.bj` (missions, statuts, historique)
* PWA : manifest.json, service worker, icône installable
* Configuration DNS + Nginx + SSL pour `rider.speedservice.bj`

---

## Sprint 9

### Stabilisation

* Correctifs et tests d'intégration end-to-end
* Audit de sécurité
* Optimisation des performances
* Déploiement pré-production
* Formation administrateur

---

# 6. Roadmap Technique

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Shadcn UI
* Leaflet / OpenStreetMap

---

## Backend

* Laravel 12
* PHP 8.4

---

## Base de données

* PostgreSQL

---

## Cache

* Redis

---

## Authentification

* Laravel Sanctum (tokens SPA)

---

## Hébergement

MVP :

* VPS Contabo / OVH

Évolution :

* Azure
* AWS

---

# 7. KPIs Produit

## Activité

* Nombre de commandes
* Nombre de livreurs actifs
* Nombre de clients actifs

## Opérations

* Temps moyen de livraison
* Taux de livraison réussie
* Taux d'annulation

## Financier

* Chiffre d'affaires
* Nombre de paiements
* Panier moyen

---

# 8. Version 2

Après validation du MVP :

* **US-030** — Affichage de la position GPS du livreur en temps réel (WebSocket)
* **US-041** — Système de notation et d'avis des livreurs (note moyenne en étoiles, visible côté client et admin)
* **US-042** — Tableau de bord "Mes revenus" pour le livreur (paiements hebdomadaires, historique de gains, nombre de livraisons, note moyenne)
* Livraison de repas
* Livraison de courses
* Livraison pharmaceutique
* Application Android
* Application iOS
* Programme de fidélité
* Parrainage
* Livraison inter-villes
* API partenaires e-commerce
* Attribution automatique des livreurs par IA
* Optimisation des tournées
* Portefeuille électronique
* Notifications WhatsApp
 