# CAHIER DES CHARGES MVP

# SPEED SERVICE - PLATEFORME DE LIVRAISON DE COLIS

Version : 1.1 — alignée sur le dépôt

Date : Juin 2026

**État au 22 juin 2026 :** Sprints 0 à 6 terminés ; Sprint 7 Administration en cours ; application rider autonome prévue au Sprint 8 ; stabilisation et déploiement prévus au Sprint 9.

---

# 1. Présentation du projet

## 1.1 Contexte

Speed Service est une plateforme numérique de mise en relation entre des clients souhaitant expédier un colis et des livreurs chargés d'effectuer la livraison.

Cette première version (MVP - Minimum Viable Product) se concentre exclusivement sur le service de livraison de colis afin de valider le modèle économique et les processus opérationnels avant l'ajout d'autres services.

---

## 1.2 Objectifs

### Objectif principal

Permettre à un utilisateur de commander une livraison de colis en ligne, suivre son statut et effectuer son paiement.

### Objectifs secondaires

* Simplifier la prise de commande.
* Réduire le temps de traitement des demandes.
* Faciliter la gestion des livraisons.
* Offrir une visibilité en temps réel sur les commandes.
* Préparer la plateforme à l'ajout futur de nouveaux services.

---

# 2. Périmètre du MVP

## Inclus dans cette version

* Site web responsive
* Création de compte utilisateur
* Commande de livraison
* Calcul du tarif
* Paiement en ligne
* Paiement physique
* Gestion des livreurs
* Tableau de bord administrateur
* Suivi des commandes
* Notifications automatiques
* Choix global d'un thème clair ou sombre, conservé entre les pages

## Exclus du MVP

* Livraison de repas
* Livraison de courses
* Programme de fidélité
* Application mobile native
* Géolocalisation temps réel du livreur
* Portefeuille électronique
* Marketplace commerçants
* Système de notation/avis des livreurs (étoiles, note moyenne)
* Tableau de bord "Revenus" détaillé pour le livreur (historique de gains hebdomadaires)

> Note : ces deux derniers points sont reportés en Version 2 (cf. §11 Évolutions prévues).

> L'application `rider.speedservice.bj` et son tunnel de candidature sont inclus dans la feuille de route MVP mais ne sont pas encore présents dans le dépôt. L'espace `/driver/*` actuel est provisoire.

---

# 3. Types d'utilisateurs

## Client

Utilisateur souhaitant envoyer un colis.

## Livreur

Utilisateur chargé d'effectuer les livraisons.

## Administrateur

Utilisateur responsable de la gestion de la plateforme.

---

# 4. Fonctionnalités détaillées

## 4.1 Site public

### Page d'accueil

Contenu :

* Présentation du service
* Comment ça marche
* Tarifs indicatifs
* Bouton commander
* Contact

### Page services

Présentation des offres de livraison.

### Page tarifs

Présentation des tarifs de base.

### Page contact

Formulaire de contact.

> **État actuel :** seule la page d'accueil publique est matérialisée comme route dédiée. Les pages Services, Tarifs et Contact restent des exigences à implémenter ou à intégrer à cette page.

---

# 4.2 Authentification

## Création de compte

Informations requises :

* Nom complet
* Numéro de téléphone
* Email (obligatoire dans l'implémentation actuelle)
* Mot de passe

## Connexion

* Email
* Mot de passe

## Mot de passe oublié

Réinitialisation par email. La réinitialisation par SMS n'est pas implémentée.

---

# 4.3 Commande de livraison

Le client doit pouvoir créer une commande.

### Informations expéditeur

* Nom
* Téléphone
* Adresse
* Position sur carte

### Informations destinataire

* Nom
* Téléphone
* Adresse
* Position sur carte

### Informations colis

* Description
* Type de colis
* Catégorie de contenu
* Poids estimatif

Types de colis disponibles (déterminent le tarif) :

* Document
* Petit colis
* Colis moyen
* Colis volumineux

Catégories de contenu disponibles (information descriptive, n'influence pas le tarif) :

* Documents & Papiers
* Vêtements & Textile
* Électronique
* Alimentaire
* Autres

> Le "Type de colis" et la "Catégorie de contenu" sont deux champs distincts et obligatoires du formulaire de commande. Le premier sert au calcul du tarif (poids/volume), le second qualifie la nature du contenu transporté (utile pour l'assurance et les éventuelles restrictions de transport).

### Service

Le choix du service de livraison (standard ou express) s'effectue à l'étape du paiement (cf. §4.4), une fois le type de colis et le poids connus, afin que le tarif affiché pour chaque option soit déjà calculé.

* Livraison standard
* Livraison express

### Résultat (étape récapitulatif, avant choix du service)

Le système affiche :

* Distance estimée
* Délai estimé indicatif (selon service standard par défaut)

Le prix définitif est affiché à l'étape de paiement, une fois le service choisi (cf. §4.4).

---

# 4.4 Paiement

## Choix du service de livraison

Avant de sélectionner le mode de paiement, le client choisit son service de livraison :

* Livraison standard (24-48h)
* Livraison express (2-4h)

Le tarif affiché pour chaque option est actuellement calculé à partir du type de colis : le service Express applique un coefficient ×2 au tarif Standard. Le poids et la distance sont enregistrés, mais ne modifient pas encore le prix. Le total se met à jour selon le service sélectionné.

## Paiement en ligne

Modes prévus :

* MTN Mobile Money
* Moov Money
* Carte bancaire

> Les trois parcours sont simulés dans le MVP actuel : aucun appel réel à FedaPay, MTN MoMo ou Moov Money n'est encore intégré.

## Paiement physique

Le client peut sélectionner :

* Paiement à la livraison
* Paiement en agence

Dans ce cas, la commande reste en attente de validation (statut "En attente de validation", cf. §4.5) jusqu'à confirmation manuelle par un administrateur.

---

# 4.5 Gestion des commandes

## Statuts

Une commande possède l'un des statuts suivants :

* Brouillon
* En attente de paiement
* En attente de validation
* Confirmée
* Assignée
* En cours de récupération
* En livraison
* Livrée
* Annulée

---

# 4.6 Suivi de commande

Le client doit pouvoir consulter :

* Numéro de commande
* Statut actuel
* Historique des changements

---

# 4.7 Notifications

Le système doit envoyer des notifications lors des événements suivants :

* Validation de commande
* Affectation d'un livreur
* Récupération du colis
* Livraison terminée

Canaux :

* SMS
* Email (si disponible)
* Centre de notifications dans l'application

Les notifications email et SMS sont mises en file ; en développement, l'email et le SMS peuvent être journalisés selon la configuration. Le journal applicatif rend les quatre événements idempotents.

---

# 5. Interface Livreur — cible `rider.speedservice.bj` (Sprint 8)

> **Situation actuelle :** les missions, l'acceptation/refus, l'avancement et l'historique sont disponibles dans `frontend/app/driver` sous `/driver/*`. L'application web distincte, la PWA, le sous-domaine et le tunnel d'inscription décrits ci-dessous constituent la cible du Sprint 8. Voir [05 - Espace Rider.md](05%20-%20Espace%20Rider.md).

## 5.1 Architecture — Sous-domaine séparé

| Élément | Valeur |
|---|---|
| URL cible | `rider.speedservice.bj` |
| Technologie cible | Next.js (PWA, mobile-first) |
| Backend | Même API Laravel — endpoints `/driver/*` |
| État actuel | Routes `/driver/*` intégrées au frontend client |
| Installation PWA | Planifiée, non implémentée |

## 5.2 Accès et inscription

À terme, l'accès livreur ne passera **pas** par la création de compte client. Le processus cible est le suivant :

1. Le candidat accède à `rider.speedservice.bj/rejoindre`.
2. Il complète le tunnel de candidature en 7 étapes (voir §5.3).
3. Son dossier est soumis pour examen par un administrateur.
4. Après validation, il reçoit un email d'activation et peut se connecter sur `rider.speedservice.bj`.

La page de connexion client (`speedservice.bj/login`) affiche un bouton "Espace Livreur" qui redirige vers `rider.speedservice.bj`.

## 5.3 Tunnel d'inscription livreur (7 étapes)

Inspiré du modèle Deliveroo Rider, adapté au contexte béninois.

### Étape 1 — Informations personnelles

* Prénom, Nom de famille
* Email (unique)
* Téléphone principal (unique, MTN ou Moov)
* Date de naissance (candidat ≥ 18 ans)
* Ville d'intervention (Cotonou, Abomey-Calavi, Porto-Novo, Parakou)
* Quartier(s) couverts
* Mot de passe

### Étape 2 — Pièce d'identité

* Type : CNI / Passeport / Carte de séjour
* Numéro et date d'expiration
* Photo recto + verso (JPG/PNG, max 5 Mo chacune)

### Étape 3 — Véhicule

* Type : Vélo / Moto / Tricycle (Keke) / Voiture
* Marque, modèle, année, couleur (si motorisé)
* Plaque d'immatriculation (si motorisé)
* Photo du véhicule

### Étape 4 — Documents du véhicule *(sauf vélo)*

* Permis de conduire (numéro, catégorie, photo)
* Carte grise (numéro, photo)
* Attestation d'assurance (compagnie, numéro, expiration, photo)

### Étape 5 — Informations de paiement

* Mode préféré : MTN MoMo / Moov Money / Compte bancaire
* Numéro de compte et nom du titulaire

### Étape 6 — Photo de profil

* Selfie récent, fond neutre, visage dégagé

### Étape 7 — Acceptation des conditions

* Contrat de prestataire indépendant Speed Service
* Charte du livreur
* Politique de confidentialité

## 5.4 États du dossier de candidature

```
Soumis → En cours d'examen → Validé   → Compte actif
                           → Rejeté   (motif envoyé par email)
                           → Complément demandé (livreur peut soumettre les docs manquants)
```

## 5.5 Tableau de bord opérationnel (après validation)

Le livreur connecté peut :

* Consulter la liste des missions disponibles (statut Confirmée, sans livreur affecté)
* Accepter ou refuser une mission
* Suivre sa mission en cours avec boutons d'avancement de statut
* Consulter l'historique de ses missions terminées

## 5.6 Actions de statut

| Action | Transition |
|---|---|
| J'arrive au point d'enlèvement | Assigned → PickingUp |
| Colis récupéré — Départ livraison | PickingUp → InDelivery |
| Colis livré | InDelivery → Delivered |

---

# 6. Interface Administrateur

## Tableau de bord

Affichage :

* Nombre de commandes
* Nombre de clients
* Nombre de livreurs
* Chiffre d'affaires

**Implémenté en Sprint 7 :** statistiques utilisateurs/livraisons, revenus issus des paiements réussis et paiements physiques en attente de validation.

## Gestion des utilisateurs

* Lister, rechercher et filtrer
* Consulter un utilisateur
* Modifier son rôle

## Gestion des livreurs

* Lister les livreurs et compter leurs livraisons terminées
* Suspendre/réactiver un livreur *(reste bloqué tant que la colonne persistante `is_active` n'est pas ajoutée)*
* Examiner les candidatures rider *(Sprint 8, non disponible actuellement)*

## Gestion des commandes

* Consulter
* Rechercher et filtrer
* Forcer un statut avec historique
* Assigner manuellement un livreur *(reste à implémenter)*

## Gestion des paiements

* Vérifier les paiements
* Valider les paiements physiques : un bouton "Valider le paiement" est disponible sur chaque paiement au statut "En attente" dont la méthode est "Paiement à la livraison" ou "Paiement en agence". Sa validation fait passer le paiement au statut "Réussi" et la commande associée au statut "Confirmée".

## Rapports

* Revenus et livraisons des six derniers mois
* Meilleurs clients
* Taux de livraison terminée

> Le Sprint 7 reste **en cours** tant que les contrats de données frontend/backend, les contrôles de rôle à la connexion et les validations lint/build/tests ne sont pas entièrement stabilisés.

---

# 7. Règles métier

## Commandes

* Une commande ne peut être assignée qu'à un seul livreur.
* Un livreur peut gérer plusieurs commandes simultanément.
* Une commande livrée ne peut plus être modifiée.

## Paiement

* Les commandes payées en ligne sont automatiquement validées.
* Les commandes avec paiement physique nécessitent une validation manuelle.

## Livraison

* Une livraison doit être associée à un destinataire.
* Le livreur doit confirmer la livraison avant clôture.

---

# 8. Exigences techniques

## Architecture multi-application

La cible Speed Service se compose de **deux applications frontend distinctes** partageant un seul backend. Le dépôt courant ne contient encore qu'un frontend :

| Application | URL | Cible | Notes |
|---|---|---|---|
| Plateforme client | `speedservice.bj` | Clients, admin et espace rider provisoire | Présente dans `frontend/` |
| Espace rider | `rider.speedservice.bj` | Livreurs | Cible Sprint 8 ; dossier `rider/` absent |

Un seul backend Laravel servira les deux applications. La configuration CORS de production pour les deux origines reste à publier et valider avant le déploiement.

## Frontend

* Next.js (App Router) + TypeScript + Tailwind CSS
* Application client : desktop-first, responsive
* Application rider cible : mobile-first, PWA (service worker, manifest)
* Déploiement séparé sur deux sous-domaines à mettre en place au Sprint 8/9
* Thème clair/sombre global par classe CSS, préférence navigateur/localStorage et bouton « Thème »

## Backend

* Laravel 12 / PHP 8.4
* API REST (JSON)
* Laravel Sanctum (authentification SPA)
* CORS configuré pour `speedservice.bj` et `rider.speedservice.bj`

## Base de données

* PostgreSQL 16+

## Cache & Queues

* Redis

## Cartographie

* OpenStreetMap + Leaflet

## Paiement

* MVP courant : simulation locale des cartes, MTN MoMo et Moov Money
* Production cible : intégration à une passerelle à choisir/valider (FedaPay et/ou API opérateurs)


# 9. Livrables attendus

Le prestataire devra fournir :

* Code source complet
* Base de données
* Documentation technique
* Documentation utilisateur
* Déploiement sur serveur de production
* Formation administrateur

---

# 10. Critères de validation

Le MVP sera considéré comme validé lorsque :

* Un utilisateur peut créer un compte.
* Une commande peut être créée.
* Le prix est calculé automatiquement.
* Un paiement peut être effectué.
* Un administrateur peut assigner un livreur.
* Le livreur peut mettre à jour les statuts.
* Le client peut suivre sa commande.

À la date de mise à jour, ces flux sont présents pour les Sprints 1 à 6. La validation globale du MVP reste conditionnée par la fin du back-office, l'extraction rider, la stabilisation, les tests d'intégration et le déploiement.

---

# 11. Évolutions prévues

Les versions futures pourront inclure :

* Application mobile Android
* Application mobile iOS
* Livraison de repas
* Livraison de courses
* Transport de personne
* Réservation de billet en ligne et au gichet.
* Géolocalisation temps réel
* Portefeuille électronique
* API commerçant
* Programme de fidélité
* Système de notation et d'avis des livreurs (note moyenne, étoiles)
* Tableau de bord "Mes revenus" pour le livreur (paiements hebdomadaires, statistiques de gains)

---

# Fin du document
