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

### Sprint 9 — Stabilisation & déploiement — 🔄 En cours (branche `develop`)

**Tâches terminées :**
- ✅ Monorepo pnpm workspaces configuré (`pnpm-workspace.yaml` + root `package.json`)
- ✅ `packages/ui/` créé — `@speedservice/ui` (cn, ThemeToggle, StatusBadge)
- ✅ `packages/api-client/` créé — `@speedservice/api-client` (apiGet, apiPost, apiPut, apiPatch, apiDelete)
- ✅ `frontend/`, `admin/`, `driver/` mis à jour — consomment les packages workspace
- ✅ Shims de rétrocompatibilité : `lib/utils.ts`, `components/theme-toggle.tsx`, `components/status-badge.tsx`
- ✅ Refactor terminologie : `rider/` → `driver/`, routes `/driver/apply/*`, labels UI « Livreur »
- ✅ TypeScript au vert sur les 3 apps (tsc --noEmit)
- ✅ README + CLAUDE.md mis à jour

**Stabilisation pipeline CI — 2026-06-25 :**
- ✅ `frontend/app/page.tsx` — apostrophe `&apos;` (lint)
- ✅ `backend/phpunit.xml.dist` — créé avec `APP_KEY` + SQLite in-memory
- ✅ `backend/tests/` — `TestCase.php`, `Feature/`, `Unit/` créés
- ✅ `.gitignore` — `!backend/.env.example`
- ✅ `.github/workflows/ci.yml` — setup `.env` + `key:generate`
- ✅ `frontend/app/(dashboard)/deliveries/[id]/page.tsx` — `react-hooks/set-state-in-effect` résolu
- ✅ `AdminController` — `select()` avant `withCount()` + `JSON_PRESERVE_ZERO_FRACTION` (4 tests)

---

## Section GPT Codex

**Dernier état :** 2026-06-24

✅ Terminé : CI frontend migrée de npm vers pnpm workspace (`.github/workflows/ci.yml`) ; installation gelée, lint et build validés.

✅ Terminé à la demande explicite de l'utilisateur : thème clair/sombre global ajouté à `admin/` (préférence système, persistance locale, bouton sur toutes les routes et graphiques adaptés). TypeScript et build Next.js au vert.

---
