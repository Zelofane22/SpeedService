# aiorchec.md — Fichier d'orchestration IA

## Description et consignes

Ce fichier sert de tableau de bord partagé entre **Claude Code** et **GPT Codex** pour coordonner le travail sur le projet SpeedService sans créer de conflits.

### Règles d'utilisation
- **Chaque IA écrit uniquement dans sa propre section.** Aucune modification de la section de l'autre.
- Avant de commencer une tâche, écrire une ligne `🔒 En cours : <fichiers touchés>` dans sa section.
- Après avoir terminé, remplacer par `✅ Terminé : <résumé court>` et libérer les fichiers.
- Si une tâche bloque ou nécessite l'intervention de l'autre IA, écrire `🚧 Bloqué : <raison>` + mentionner les fichiers concernés.
- Ne jamais toucher un fichier marqué `🔒 En cours` par l'autre IA.
- Mettre à jour ce fichier à chaque début et fin de tâche significative.

---

## Section Claude Code

**Dernier état :** 2026-06-23

### Sprint 7 — Administration (back-office) — ✅ Terminé

- ✅ Backend : `EnsureAdmin` middleware + `AdminController` (11 endpoints) + routes + tests
- ✅ Frontend admin extrait dans `admin/` standalone (admin.speedservice.bj, port 3001)
- ✅ `frontend/app/(admin)/` supprimé — tout est dans `admin/`

---

### Sprint 8 — Rider App — ✅ Terminé (branche `sprint8`, mergé dans `develop`)

**Tâches terminées :**
- ✅ Backend : migrations `driver_applications` + `driver_documents`
- ✅ Backend : enums `VehicleType`, `DriverApplicationStatus`, `DocumentType`
- ✅ Backend : modèles `DriverApplication` + `DriverDocument`
- ✅ Backend : `RiderApplicationController` (4 endpoints publics + 3 admin)
- ✅ Backend : `RiderApplicationStatusMail` + template Blade
- ✅ Backend : `DriverApplicationFactory` + 13 tests PHPUnit (33 assertions ✅)
- ✅ Admin app `admin/` : page `/riders` candidatures livreurs + sidebar mise à jour
- ✅ Rider app `rider/` : scaffolding Next.js 16 PWA mobile-first — build ✅
- ✅ Rider app : tunnel candidature R01–R08 (7 étapes), suivi R10, complément R12, login
- ✅ Rider app : espace livreur connecté (bottom nav, missions, mission active, historique)

**Fichiers libres — sprint 8 complet côté Claude :**
- `backend/` — tous les fichiers sprint 8
- `rider/` — toute l'app
- `admin/app/(dashboard)/riders/` — page candidatures
- `admin/lib/api/admin.ts` — types + fonctions rider ajoutés
- `admin/components/sidebar.tsx`

**Prochaine étape :** merge `develop` → `main` (Sprint 9 — Stabilisation & déploiement)

---

## Section GPT Codex

**Dernier état :** 2026-06-23

🔒 En cours : mise en cohérence de `fiche projet/` avec l'extraction du back-office dans l'application séparée `admin/`, puis validation lint/build du thème clair/sombre de `frontend/`.

---
