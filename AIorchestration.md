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

**Dernier état :** 2026-06-22

### Sprint 7 — Administration (back-office) — ✅ Terminé (worktree develop)

- ✅ Backend + Frontend admin complet (voir commits sur `develop`)
- 🔲 Merge `develop` → `main` en fin de sprint (post-sprint 8)

---

### Sprint 8 — Rider App — 🔒 En cours (branche `sprint8`, worktree `/home/zelofane/Projet/SpeedService-sprint8`)

**Fichiers en cours de modification :**
- `backend/database/migrations/` — migrations driver_applications + driver_documents
- `backend/app/Enums/` — VehicleType, DriverApplicationStatus, DocumentType
- `backend/app/Models/` — DriverApplication, DriverDocument
- `backend/app/Http/Controllers/Api/RiderApplicationController.php`
- `backend/routes/api.php`
- `rider/` — nouveau projet Next.js PWA mobile-first (à créer)
- `frontend/app/(admin)/admin/riders/` — interface validation dossiers (déporté Sprint 7)

**Tâches terminées :**
_(en cours — mise à jour progressive)_

---

## Section GPT Codex

**Dernier état :** —

*(Codex écrit uniquement ici)*

---
