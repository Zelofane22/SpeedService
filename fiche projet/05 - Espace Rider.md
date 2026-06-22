# ESPACE RIDER — SPEED SERVICE

## Application livreur distincte

Version : 1.0
Dernière mise à jour : 2026-06-22

---

## 1. Positionnement architectural

L'espace rider est une **application web indépendante**, séparée de la plateforme client.

| Élément | Client | Rider |
|---|---|---|
| URL | `speedservice.bj` | `rider.speedservice.bj` |
| Application | Next.js — site client | Next.js — app rider (mobile-first) |
| Backend | Laravel API (`api.speedservice.bj`) | **Même backend**, endpoints `/driver/*` |
| Design | Desktop-first | **Mobile-first, PWA** |
| Compte | Client | Livreur (rôle `driver`) |

Le backend Laravel est partagé. Seul le frontend est déployé sur un sous-domaine séparé.

---

## 2. Spécificités de l'application rider

- **Mobile-first** : les livreurs utilisent leur téléphone en déplacement. L'interface est conçue pour un usage sur smartphone, avec de grands boutons d'action et une navigation minimale.
- **PWA (Progressive Web App)** : installable sur Android/iOS depuis le navigateur, fonctionne en mode hors-ligne partiel (affichage des données déjà chargées).
- **Design distinct** : fond sombre, typographie lisible en plein soleil, palette différenciée de la plateforme client.
- **Pas de création de compte public** : les livreurs ne peuvent pas s'inscrire librement. Ils passent par un tunnel de candidature qui requiert une validation manuelle par un administrateur.

---

## 3. Tunnel d'inscription livreur

Inspiré du modèle Deliveroo Rider / Uber Eats Partner, adapté au contexte béninois.

Le candidat accède à `rider.speedservice.bj/rejoindre` et complète 7 étapes avant soumission.

---

### Étape 1 — Informations personnelles

| Champ | Type | Obligatoire |
|---|---|---|
| Prénom | Texte | Oui |
| Nom de famille | Texte | Oui |
| Adresse email | Email | Oui |
| Numéro de téléphone principal | Tél. | Oui |
| Date de naissance | Date | Oui (≥ 18 ans) |
| Ville d'intervention | Sélection | Oui |
| Quartier(s) couverts | Multi-sélection | Oui |
| Mot de passe | Password | Oui |

Villes disponibles au lancement : Cotonou, Abomey-Calavi, Porto-Novo, Parakou.

Validation : l'email et le téléphone doivent être uniques dans la base.

---

### Étape 2 — Pièce d'identité

| Champ | Type | Obligatoire |
|---|---|---|
| Type de pièce | Sélection (CNI / Passeport / Carte de séjour) | Oui |
| Numéro de la pièce | Texte | Oui |
| Date d'expiration | Date | Oui |
| Photo recto | Upload image (JPG/PNG, max 5 Mo) | Oui |
| Photo verso | Upload image (JPG/PNG, max 5 Mo) | Oui (sauf passeport) |

Validation côté admin : les documents sont examinés manuellement avant activation du compte.

---

### Étape 3 — Véhicule

| Champ | Type | Obligatoire |
|---|---|---|
| Type de véhicule | Sélection | Oui |
| Marque | Texte | Si motorisé |
| Modèle | Texte | Si motorisé |
| Année | Nombre | Si motorisé |
| Couleur | Texte | Oui |
| Plaque d'immatriculation | Texte | Si motorisé |
| Photo du véhicule (face avant) | Upload image | Oui |

Types de véhicules acceptés :

| Code | Libellé | Notes |
|---|---|---|
| `bicycle` | Vélo | Pas de permis requis |
| `motorcycle` | Moto / Scooter | Permis A requis |
| `tricycle` | Tricycle (Keke) | Permis A ou B selon puissance |
| `car` | Voiture | Permis B requis |

---

### Étape 4 — Documents du véhicule *(uniquement si véhicule motorisé)*

| Document | Champs | Obligatoire |
|---|---|---|
| Permis de conduire | Numéro, catégorie, date d'expiration, photo recto/verso | Oui |
| Carte grise (certificat d'immatriculation) | Numéro, photo | Oui |
| Attestation d'assurance | Compagnie, numéro police, date d'expiration, photo | Oui |

Les cyclistes sautent directement à l'étape 5.

---

### Étape 5 — Informations de paiement

Les livreurs sont rémunérés par virement sur leur compte de paiement déclaré.

| Champ | Type | Obligatoire |
|---|---|---|
| Mode de paiement préféré | Sélection | Oui |
| Numéro Mobile Money | Tél. | Si MoMo/Moov |
| Nom du titulaire du compte | Texte | Oui |

Modes acceptés :

- MTN MoMo
- Moov Money
- Compte bancaire (RIB + IBAN — versement mensuel)

---

### Étape 6 — Photo de profil

| Champ | Contraintes |
|---|---|
| Selfie récent | Fond uni, visage dégagé, bonne luminosité |
| Format | JPG/PNG, max 5 Mo |

La photo est affichée sur le profil livreur visible par les clients et les administrateurs.

---

### Étape 7 — Acceptation des conditions

Le candidat doit lire et cocher explicitement :

- Contrat de prestataire indépendant Speed Service
- Charte du livreur (comportement, délais, responsabilité du colis)
- Politique de confidentialité et traitement des données personnelles (RGPD-compatible)

Un email de confirmation est envoyé immédiatement après soumission.

---

## 4. États du dossier de candidature

```
Soumis → En cours d'examen → Validé → Actif
                           ↘ Rejeté (avec motif)
                           ↘ Complément demandé
```

| Statut | Compte actif ? | Actions disponibles |
|---|---|---|
| `pending` | Non | —  |
| `under_review` | Non | Admin peut valider, rejeter ou demander un complément |
| `complement_requested` | Non | Livreur peut soumettre les documents manquants |
| `approved` | **Oui** | Accès à rider.speedservice.bj |
| `rejected` | Non | Email de motif, possibilité de re-candidater après 30 jours |

---

## 5. Cycle de vie complet du livreur

```
Candidature soumise
       ↓
Admin vérifie les documents (Sprint 7 — US-037)
       ↓
Compte activé → email + SMS de bienvenue
       ↓
Livreur se connecte sur rider.speedservice.bj
       ↓
Consulte les missions disponibles (US-024)
       ↓
Accepte une mission (US-025)
       ↓
Enlèvement → Transit → Livraison (US-027)
       ↓
Mission archivée dans l'historique (US-028)
       ↓
Paiement calculé et versé en fin de période
```

---

## 6. Nouvelles user stories — Inscription livreur

Ces US s'ajoutent au backlog, rattachées à l'**EPIC 6 — Gestion des Livreurs**.

| ID | Intitulé | Priorité | SP |
|---|---|---|---|
| US-R01 | Accéder au formulaire de candidature livreur | Must Have | 2 |
| US-R02 | Saisir ses informations personnelles (étape 1) | Must Have | 3 |
| US-R03 | Uploader sa pièce d'identité (étape 2) | Must Have | 5 |
| US-R04 | Déclarer son véhicule (étape 3) | Must Have | 5 |
| US-R05 | Uploader les documents du véhicule (étape 4) | Must Have | 5 |
| US-R06 | Renseigner ses informations de paiement (étape 5) | Must Have | 3 |
| US-R07 | Uploader sa photo de profil (étape 6) | Must Have | 2 |
| US-R08 | Accepter les CGU et soumettre sa candidature (étape 7) | Must Have | 2 |
| US-R09 | Recevoir un email de confirmation de candidature | Must Have | 2 |
| US-R10 | Suivre l'état de sa candidature | Should Have | 3 |
| US-R11 | Être notifié de la décision (validé / rejeté / complément) | Must Have | 3 |
| US-R12 | Soumettre des documents complémentaires si demandé | Should Have | 3 |

**Total Sprint Rider :** ~38 SP — prévu en **Sprint 5bis / Sprint séparé Rider App**.

---

## 7. Modèle de données — Nouvelles tables

### Table `driver_applications`

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID | Clé primaire |
| `user_id` | UUID FK | Compte utilisateur lié |
| `status` | enum | pending / under_review / approved / rejected / complement_requested |
| `city` | string | Ville d'intervention |
| `vehicle_type` | enum | bicycle / motorcycle / tricycle / car |
| `vehicle_brand` | string\|null | Marque |
| `vehicle_model` | string\|null | Modèle |
| `vehicle_year` | integer\|null | Année |
| `vehicle_color` | string | Couleur |
| `license_plate` | string\|null | Plaque |
| `payment_method` | enum | mtn_momo / moov_money / bank |
| `payment_account` | string | Numéro de compte |
| `payment_holder` | string | Nom du titulaire |
| `review_notes` | text\|null | Notes de l'admin |
| `reviewed_by` | UUID FK\|null | Admin ayant traité le dossier |
| `reviewed_at` | timestamp\|null | Date de décision |
| `submitted_at` | timestamp | Date de soumission |

### Table `driver_documents`

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID | Clé primaire |
| `application_id` | UUID FK | Dossier lié |
| `type` | enum | identity_front / identity_back / license_front / license_back / vehicle_registration / insurance / profile_photo / vehicle_photo |
| `file_path` | string | Chemin stockage (S3 ou local) |
| `original_name` | string | Nom d'origine du fichier |
| `status` | enum | pending / accepted / rejected |
| `rejection_reason` | string\|null | Motif si rejeté |

---

## 8. Contraintes techniques

- **Upload de fichiers** : Laravel Storage (disque S3 en production, local en dev). Validation : MIME type image/jpeg ou image/png, max 5 Mo par fichier.
- **Email** : Laravel Mailable pour confirmation de candidature, validation admin, notification de décision.
- **Sécurité** : les documents d'identité sont stockés dans un bucket privé, accessibles uniquement par l'admin via URL signée (expiration 15 min).
- **RGPD** : les documents sont supprimés 12 mois après rejet définitif.

---

## 9. Planification

L'inscription livreur est intégrée au MVP en **Sprint 8** :

| Phase | Contenu | Durée estimée |
|---|---|---|
| Sprint 8 — Tunnel d'inscription | US-R01 à R12 + backend upload + admin review | 3 semaines |
| Sprint 8 — Rider App | Application `rider.speedservice.bj` (mobile-first PWA) | 2 semaines |
| Sprint 8 — Déploiement | Mise en production sous-domaine + config DNS/SSL | 1 semaine |
