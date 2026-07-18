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

**Dernier état :** 2026-07-12

🔒 En cours : reprise (demandée par l'utilisateur) de la mise à niveau stable démarrée par Codex — validations frontend (tsc/lint/build des 3 apps via Docker), alignement Dockerfiles Node 24 + pnpm 10.34.3, puis Laravel et services de données. Fichiers touchés : `frontend/Dockerfile`, `admin/Dockerfile`, `driver/Dockerfile`, + validations sur l'arbre laissé par Codex.

### Intégration Cloudinary (images & documents) — ✅ Terminé (2026-07-18, branche `develop`, non commité)

**Backend :** stockage des documents/images livreur migré du disque local vers Cloudinary en mode **privé (authenticated)** + URLs signées à durée limitée.
- ✅ SDK `cloudinary/cloudinary_php ^2.13` ajouté (`composer.json` + `composer.lock` régénéré via conteneur Docker)
- ✅ `App\Services\CloudinaryService` — `uploadPrivate()`, `signedUrl()` (privateDownloadUrl, TTL configurable), `delete()`
- ✅ `config/services.php` bloc `cloudinary` + variables `.env.example` (`CLOUDINARY_*`)
- ✅ Migration `2026_07_18_100000` : colonnes `storage_disk` / `resource_type` / `format` sur `driver_documents` (rétrocompat avec les anciens fichiers `local`)
- ✅ `DriverApplicationController` : `uploadDocuments` + `complement` refactorés (helper `storeDocuments`), photos profil/véhicule reliées sur la candidature ; `downloadDocument` redirige vers l'URL signée pour Cloudinary, fallback disque local conservé
- ⚠️ Reste à faire côté utilisateur : renseigner les creds Cloudinary dans `.env`, puis **rebuild de l'image backend** (le SDK est baké au build). Suite de tests non relancée (les tests existants ne couvrent pas l'upload/download de fichiers).

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

**Dernier état :** 2026-07-18

✅ Terminé : correction textes landing/délais/paiements dans `frontend/app/page.tsx`, `frontend/app/(dashboard)/new-delivery/page.tsx`, `frontend/app/(dashboard)/deliveries/[id]/page.tsx` — délais harmonisés en `2-4 h` / `24-48 h`, paiement public limité au paiement à la livraison en espèces, libellé `MTN MoMo` unifié. Validation : `rg` ciblé + `git diff --check` ; lint non exécuté car `node`/`pnpm` sont absents de l'environnement.

✅ Terminé : corrections espace frontend public — footer sans liens morts, vraie section/page tarifs, pages publiques support/entreprise/légal/contact, validation inscription côté client avec téléphone béninois `+229 01`, affichage/masquage et force mot de passe, métadonnées SEO/OG + favicon. Validation : `rg` liens morts + `git diff --check` ; lint/build non exécutés car `node`/`pnpm`/`npm` sont absents de l'environnement.

✅ Terminé : amélioration responsive admin — filtres de statut Commandes/Paiements en select mobile + boutons wrap desktop, KPI dashboard en une colonne sur mobile étroit et sous-titres de cartes légèrement compactés. Validation : `git diff --check` ; lint non exécuté car `pnpm` est absent de l'environnement.

✅ Terminé : améliorations UX admin ciblées — 404 française habillée, états vides/skeletons harmonisés, graphiques lisibles sans données, filtres Commandes en retour à la ligne, exports CSV Commandes/Clients/Paiements/Rapports, Paramètres enrichie, panier moyen non ambigu et renommage interne `CouriersPage` → `DriversPage`. Validation : `git diff --check` + recherche terminologique ; TypeScript/lint non exécutés car `node`/`pnpm` sont absents de l'environnement.

✅ Terminé : correction du lint React `set-state-in-effect` sur `frontend/app/(dashboard)/dashboard/page.tsx` ; validation Docker `pnpm --filter speedservice-frontend lint` au vert.

✅ Terminé : audit et finition Impeccable du back-office — état d’indisponibilité et reprise du dashboard, formulaires/recherche et navigation mobile accessibles, focus/réduction des mouvements globaux, et cibles tactiles de 44 px. Validation : `git diff --check` ; lint/TypeScript non lancés car Node.js est absent du conteneur.

✅ Terminé : audit internet des versions stables (npm/Node.js, Packagist/PHP, Docker Hub, PostgreSQL, Redis et GitHub Actions). Aucun manifeste applicatif modifié : plusieurs mises à niveau sont des migrations majeures cassantes (Laravel 13, Tailwind 4, PostgreSQL 18, Redis 8, TypeScript 7, ESLint 10) et nécessitent une campagne dédiée avec tests et migration des données. Écarts et ordre recommandé communiqués à l'utilisateur.

✅ Terminé : correction du déploiement Vercel — suppression des commandes d'installation qui forçaient pnpm 6 dans les trois `vercel.json`, et alignement du monorepo sur pnpm 10.34.3 compatible avec Vercel et le lockfile v9 (`package.json`). Validation JSON et `git diff --check` effectuée ; installation/build non exécutés car Node.js/pnpm sont absents de l'environnement Codex.

✅ Terminé : pipeline CI/CD renforcé (`.github/workflows/ci.yml`, `db-backup.yml`, `dependabot.yml`) avec validation des trois apps, tests Laravel sur PostgreSQL 16, audits, Gitleaks, sauvegarde Railway chiffrée et documentation d'exploitation mise à jour (`README.md`, `DEPLOY.md`, `docs/backups.md`).

✅ Terminé : création de `AGENTS.md`, contexte permanent automatiquement chargé par Codex (architecture multi-app, conventions métier, commandes, coordination inter-IA et règles de vérification).

✅ Terminé : CI frontend migrée de npm vers pnpm workspace (`.github/workflows/ci.yml`) ; installation gelée, lint et build validés.

✅ Terminé à la demande explicite de l'utilisateur : thème clair/sombre global ajouté à `admin/` (préférence système, persistance locale, bouton sur toutes les routes et graphiques adaptés). TypeScript et build Next.js au vert.

---
