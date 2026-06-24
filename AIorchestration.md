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

**Dernier état :** 2026-06-24

### Sprint 8 — Driver App — ✅ Terminé (branche `sprint8`, mergé dans `develop`)

- ✅ Backend : `DriverApplicationController` + migrations + enums + tests
- ✅ Admin : page `/drivers` candidatures livreurs
- ✅ Driver app `driver/` : tunnel candidature complet + espace missions connecté

---

### Sprint 9 — Stabilisation & déploiement — 🔄 En cours (branche `sprint9`)

**Tâches terminées :**
- ✅ Monorepo pnpm workspaces configuré (`pnpm-workspace.yaml` + root `package.json`)
- ✅ `packages/ui/` créé — `@speedservice/ui` (cn, ThemeToggle, StatusBadge)
- ✅ `packages/api-client/` créé — `@speedservice/api-client` (apiGet, apiPost, apiPut, apiPatch, apiDelete)
- ✅ `frontend/`, `admin/`, `driver/` mis à jour — consomment les packages workspace
- ✅ Shims de rétrocompatibilité : `lib/utils.ts`, `components/theme-toggle.tsx`, `components/status-badge.tsx`
- ✅ Refactor terminologie : `rider/` → `driver/`, routes `/driver/apply/*`, labels UI « Livreur »
- ✅ TypeScript au vert sur les 3 apps (tsc --noEmit)
- ✅ README + CLAUDE.md mis à jour

**Fichiers touchés — sprint 9 :**
- `packages/` — nouveau répertoire partagé
- `pnpm-workspace.yaml`, root `package.json`, `pnpm-lock.yaml`
- `frontend/lib/utils.ts`, `frontend/lib/api.ts`
- `frontend/components/theme-toggle.tsx`, `frontend/components/status-badge.tsx`
- `admin/lib/utils.ts`, `admin/components/theme-toggle.tsx`, `admin/components/status-badge.tsx`
- `driver/lib/utils.ts`
- `frontend/package.json`, `admin/package.json`, `driver/package.json`

---

## Section GPT Codex

**Dernier état :** 2026-06-24

✅ Terminé : CI frontend migrée de npm vers pnpm workspace (`.github/workflows/ci.yml`) ; installation gelée, lint et build validés.

✅ Terminé à la demande explicite de l'utilisateur : thème clair/sombre global ajouté à `admin/` (préférence système, persistance locale, bouton sur toutes les routes et graphiques adaptés). TypeScript et build Next.js au vert.

---
