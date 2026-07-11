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

**Dernier état :** 2026-07-11

### Améliorations admin inspirées d'ANIFOWOCHE — ✅ Terminé (2026-07-11, branche `develop`, non commité)

**Backend :**
- ✅ `AdminActionLog` (modèle + migration `2026_07_11_000000`) — journal d'audit des actions admin
- ✅ `AdminController` : `stats()` enrichi de `trends` (variations vs période précédente), nouveaux endpoints `alerts()` (alertes dérivées des données) et `activityLog()` (paginé, filtrable par action), `reports()` enrichi (`top_drivers`, `deliveries_by_package_type`), logging des actions sensibles (rôle, statut forcé, validation paiement, activation livreur)
- ✅ `DriverApplicationController::adminReview` loggé aussi
- ✅ Routes : `GET /admin/alerts`, `GET /admin/activity-log`
- ✅ 10 nouveaux tests — suite complète au vert (122 tests, 501 assertions, via Docker)

**Admin (Next.js) :**
- ✅ Dashboard : salutation personnalisée + variations ↗/↘ sur les KPI (CA jour/mois, nouveaux clients)
- ✅ Nouvelles pages : `/alerts` (centre d'alertes), `/reports` (rapports), `/activity` (journal)
- ✅ Sidebar : entrées Rapports/Alertes/Journal + badge compteur d'alertes
- ✅ `/orders` et `/payments` lisent `?status=` (liens des alertes) — `next build` au vert

**⚠️ Notes d'environnement local** (voir mémoire Claude) : `backend/.env` recréé depuis `.env.example` (l'ancien était perdu) ; les tests passent par SQLite in-memory avec les env forcées en `-e` (le `env_file` compose écrase phpunit.xml).

### Correctifs stack Docker — ✅ Terminé (2026-07-11)

- ✅ Mot de passe Postgres du volume `db` réaligné sur le `.env` recréé (`ALTER ROLE` via socket local, non destructif) — backend ne crashloop plus
- ✅ `backend/.env` + `.env.example` : bloc `POSTGRES_DB/USER/PASSWORD` ajouté (le service `db` du compose les lit ; ils manquaient) + `APP_KEY` générée dans le `.env` local
- ✅ Admin `Cannot find module 'next'` corrigé : `outputFileTracingRoot` (racine du monorepo) ajouté dans `admin/next.config.ts` + `WORKDIR /app/admin` dans `admin/Dockerfile` (aligné sur frontend/driver)
- ✅ Bugs latents corrigés : `output: 'standalone'` + `outputFileTracingRoot` ajoutés à `frontend/next.config.mjs` et `driver/next.config.ts` (leurs Dockerfiles copient `.next/standalone` qui n'aurait pas existé au prochain rebuild)
- ✅ Vérifié : 6 services up, `GET /api/status` → 200, admin `/login` → 200, migrations OK (dont `admin_action_logs`)

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

**Dernier état :** 2026-07-11

✅ Terminé : pipeline CI/CD renforcé (`.github/workflows/ci.yml`, `db-backup.yml`, `dependabot.yml`) avec validation des trois apps, tests Laravel sur PostgreSQL 16, audits, Gitleaks, sauvegarde Railway chiffrée et documentation d'exploitation mise à jour (`README.md`, `DEPLOY.md`, `docs/backups.md`).

✅ Terminé : création de `AGENTS.md`, contexte permanent automatiquement chargé par Codex (architecture multi-app, conventions métier, commandes, coordination inter-IA et règles de vérification).

✅ Terminé : CI frontend migrée de npm vers pnpm workspace (`.github/workflows/ci.yml`) ; installation gelée, lint et build validés.

✅ Terminé à la demande explicite de l'utilisateur : thème clair/sombre global ajouté à `admin/` (préférence système, persistance locale, bouton sur toutes les routes et graphiques adaptés). TypeScript et build Next.js au vert.

---
