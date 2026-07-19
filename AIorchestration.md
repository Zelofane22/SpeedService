# aiorchec.md — Fichier d'orchestration IA

## Description et consignes

Ce fichier sert de tableau de bord partagé entre **Claude Code** et **GPT Codex** pour coordonner le travail sur le projet SpeedService sans créer de conflits.

### Règles d'utilisation
- **Chaque IA écrit uniquement dans sa propre section.** Aucune modification de la section de l'autre.
- Avant de commencer une tâche, écrire une ligne `🔒 En cours : <fichiers touchés>` dans sa section.
- Si une tâche bloque ou nécessite l'intervention de l'autre IA, écrire `🚧 Bloqué : <raison>` + mentionner les fichiers concernés.
- Ne jamais toucher un fichier marqué `🔒 En cours` par l'autre IA.
- Mettre à jour ce fichier à chaque début et fin de tâche significative.
- **Ne garder que les modifications en cours (`🔒 En cours` / `🚧 Bloqué`)

---

## Section Claude Code


---

## Section GPT Codex

**Dernier état :** 2026-07-19

🔒 En cours : confirmation paiement physique livreur après clic "Colis récupéré" — `driver/app/(dashboard)/active/page.tsx`, `backend/app/Http/Controllers/Api/DriverController.php`, tests backend ciblés éventuels.

---
