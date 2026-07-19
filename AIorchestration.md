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
- **Ne garder que les modifications en cours (`🔒 En cours` / `🚧 Bloqué`)

---

## Section Claude Code

**Dernier état :** 2026-07-19

✅ Terminé : actions super-admin sur les utilisateurs (reset mot de passe, suppression, changement de rôle) — back-office. Fichiers libérés.

### Actions super-admin sur les utilisateurs — ✅ Terminé (2026-07-19, branche `develop`, non commité)

- ✅ Modèle superadmin retenu : flag `is_super_admin` (bool) sur `users` (role reste `admin`) + `softDeletes` — migration `2026_07_19_000000`
- ✅ Middleware `superadmin` (`EnsureSuperAdmin`) enregistré ; routes `PATCH /admin/users/{id}/password`, `DELETE /admin/users/{id}` et `PATCH /admin/users/{id}/role` déplacées derrière cette garde
- ✅ `AdminController::resetUserPassword` (force `must_change_password` + révoque les tokens) et `deleteUser` (soft-delete) avec garde-fous : pas d'auto-suppression, pas d'action destructive sur un autre super-admin ; actions loguées (`user.password_reset`, `user.deleted`)
- ✅ Le login renvoie déjà `is_super_admin` (attribut du modèle) → lu côté front via `localStorage`
- ✅ Front admin : `UserActionsMenu` (menu `…` + modales reset password / suppression), câblé sur pages **Livreurs** et **Clients**, visible uniquement si super-admin
- ✅ Tests : 9 nouveaux (`SuperAdminUserActionsTest`) + `AdminControllerTest` adapté (role update via super-admin) — suite Admin au vert (46 tests) via Docker
- ✅ Typecheck build admin au vert (`docker compose build admin`, exit 0 — `next build` inclut le typecheck)
- ⚠️ Reste côté utilisateur : promouvoir un compte en super-admin (`is_super_admin = true`) pour activer les actions ; rebuild image backend nécessaire (migration + code bakés) avant test sur le dev déployé

---

## Section GPT Codex

**Dernier état :** 2026-07-19

✅ Terminé : détails utilisateur au clic sur le nom dans Clients/Livreurs, avec fiche profil, contact, changement de rôle, reset mot de passe, suppression et activation livreur selon droits. Validation : `git diff --check` et `docker compose build admin` au vert.

✅ Terminé : Accès & privilèges ajouté dans la navbar admin avec route dédiée `/access-privileges`; Paramètres conserve un raccourci vers cet espace. Validation : `git diff --check` et `docker compose build admin` au vert.

✅ Terminé : correction bugs Livreurs admin — `toggleDriverActive()` appelle `/admin/drivers/{id}/toggle-active`, `listDrivers()` applique `search` sur nom/email/téléphone et renvoie le vrai `is_active`; tests backend ajoutés pour recherche et état inactif. Validation : `git diff --check`, syntaxe PHP via Docker (`php -l AdminController.php`). PHPUnit non exécuté : l'image backend n'inclut pas `artisan test`; lint/typecheck admin non exécutés car `node` est absent.

✅ Terminé : tests de gestion des Livreurs sur Vercel develop — accès SSO OK avec cookies fournis, page `/drivers` charge (`200`), API develop identifiée (`speedservice-develop.up.railway.app/api`), liste Livreurs OK (2), candidatures OK (3 + détail documents). Bugs constatés : recherche `/admin/drivers?search=...` ignorée, bouton frontend d'activation appelle `/active` alors que le backend expose `/toggle-active`, et la liste force `is_active=true` même après désactivation. Aucun code applicatif modifié. Validation : `git diff --check -- AIorchestration.md`.

✅ Terminé : mot de passe oublié driver raccordé au bon écran livreur — la page driver envoie une URL de reset `/set-password`, le backend accepte une `reset_url` optionnelle uniquement si son origine correspond à `FRONTEND_URL` ou `DRIVER_URL`, les emails utilisent cette URL autorisée sinon retombent sur le reset client, et `DRIVER_URL` est documenté dans `backend/.env.example`. Tests ajoutés pour URL driver autorisée et URL externe ignorée. Validation : `docker compose build backend`, `git diff --check -- AIorchestration.md backend/.env.example backend/app/Http/Controllers/Api/AuthController.php backend/app/Http/Requests/Auth/ForgotPasswordRequest.php backend/app/Notifications/ResetPasswordNotification.php backend/config/app.php backend/tests/Feature/Auth/PasswordResetTest.php driver/app/forgot-password/page.tsx`, `php -l` via image Docker sur les fichiers PHP modifiés. PHPUnit non exécuté : l'image backend production installe Composer avec `--no-dev`, donc `artisan test` n'est pas disponible.

✅ Terminé : améliorations prioritaires UX/validation/accessibilité driver — validation email/téléphone/paiement/documents en amont, erreurs API lisibles et redirigées vers l’étape concernée, brouillon de candidature en `sessionStorage`, documents véhicule conditionnels au type de véhicule, uploads contraints avec aperçus, labels/autocomplete/viewport corrigés, login harmonisé avec affichage mot de passe + réinitialisation, 404 française et titres de pages. Validation : `git diff --check -- AIorchestration.md driver/app` au vert ; recherches ciblées `maximumScale`, uploads `image/*,.pdf` et labels non liés sans résultat ; TypeScript/lint non exécutés car `node`/`pnpm` sont absents de l'environnement.

✅ Terminé : correction TypeScript build admin — `admin/components/card.tsx` accepte désormais les attributs HTML standard (`role`, `aria-*`, etc.) et les transmet au `div`. Validation : `git diff --check -- AIorchestration.md admin/components/card.tsx` au vert ; `pnpm --filter speedservice-admin build` non exécuté car `node`/`pnpm`/`corepack` sont absents de l'environnement.

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
