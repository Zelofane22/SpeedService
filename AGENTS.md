# AGENTS.md

Ce fichier fournit à Codex le contexte permanent et les consignes de travail du dépôt SpeedService. Il est chargé automatiquement pour les tâches exécutées dans cette arborescence.

## Règles de travail

- Lire `AIorchestration.md` avant toute tâche significative et respecter les fichiers marqués `🔒 En cours` par Claude Code.
- Pour une tâche significative, déclarer les fichiers concernés dans la section **GPT Codex** de `AIorchestration.md`, puis remplacer le verrou par un court compte rendu une fois le travail terminé.
- Ne modifier que la section **GPT Codex** de ce fichier d'orchestration.
- Le dépôt peut contenir des changements non commités appartenant à l'utilisateur ou à une autre IA : les conserver et ne jamais les annuler sans demande explicite.
- Examiner les conventions du sous-projet concerné avant de modifier du code. Privilégier une correction ciblée, puis lancer les vérifications proportionnées au changement.
- Pour l'interface, utiliser **Livreur/Livreurs**. Dans le code, utiliser exclusivement `Driver`; ne pas introduire `Rider` ou `Courier`.
- Ne jamais commiter de secrets ni de fichiers `.env` locaux.

## Projet

SpeedService est une plateforme de livraison pour le Bénin. Les trois applications Next.js sont découplées du backend et consomment la même API REST Laravel.

```text
frontend/            Next.js 16, React 19, TypeScript — espace client
admin/               Next.js — back-office administrateur
driver/              Next.js, PWA — espace livreur
backend/             Laravel 12, PHP 8.4 — API partagée
packages/ui/         composants et utilitaires UI partagés
packages/api-client/ client HTTP partagé
```

Domaines de production : `speedservice.bj`, `admin.speedservice.bj`, `driver.speedservice.bj` et `api.speedservice.bj`.

Le projet est actuellement au **Sprint 9 — stabilisation et déploiement**. Consulter `README.md`, `DEPLOY.md` et surtout `AIorchestration.md` pour l'état le plus récent plutôt que de supposer que cette indication est encore à jour.

## Commandes usuelles

Le frontend est un monorepo pnpm. Installer les dépendances depuis la racine :

```bash
pnpm install
pnpm dev:frontend
pnpm dev:admin
pnpm dev:driver
pnpm lint:all
pnpm build:all
```

Pour cibler une application :

```bash
pnpm --filter speedservice-frontend lint
pnpm --filter speedservice-admin build
pnpm --filter speedservice-driver exec tsc --noEmit
```

Backend :

```bash
cd backend
composer install
php artisan migrate
php artisan db:seed
php artisan serve
composer test
php artisan test --filter=TestName
```

Stack complète :

```bash
docker compose up -d
docker compose down
docker compose logs backend
```

## Architecture frontend

- Les applications utilisent l'App Router. Les pages sont dans `app/`, les composants partagés localement dans `components/` et les helpers dans `lib/`.
- Réutiliser en priorité `@speedservice/ui` et `@speedservice/api-client`; maintenir les shims locaux existants seulement pour la rétrocompatibilité.
- Les appels API passent par `NEXT_PUBLIC_API_URL`.
- Le système visuel utilise Inter et les couleurs principales suivantes : primaire `#861D6D`, secondaire `#B24799`, fond `#FAF7FB`, texte `#1D1D1F`.
- `SpeedService UI_UX Mockup/`, lorsqu'il existe localement, est la référence visuelle Figma exportée. Ce dossier est ignoré par Git.

## Architecture backend

- Authentification par Laravel Sanctum. Placer les routes protégées sous le middleware `auth:sanctum` dans `backend/routes/api.php`.
- Tous les modèles utilisent `HasUuids`; ne pas supposer des identifiants auto-incrémentés.
- Les enums métier sont des enums PHP string dans `backend/app/Enums/`. Toujours caster les colonnes enum dans `casts()` et éviter les chaînes brutes.
- Rôles : `UserRole::Client`, `UserRole::Driver`, `UserRole::Admin` sur la table `users`.
- Cycle de livraison : `Draft → AwaitingPayment → AwaitingValidation → Confirmed → Assigned → PickingUp → InDelivery → Delivered | Cancelled`.
- Paiements : `MtnMomo`, `MoovMoney`, `Card`, `CashOnDelivery`, `Agency`. `CashOnDelivery` et `Agency` nécessitent une validation administrateur et restent initialement en `AwaitingValidation`.
- `PackageType` détermine le prix de base; `ContentCategory` est uniquement une métadonnée.

Relations principales :

```text
User (client) --< Delivery >-- User (driver)
Delivery --1 Payment
Delivery --< DeliveryStatusHistory
User --< Address
```

Les endpoints `/driver/*` sont servis par le backend partagé. Le CORS doit rester compatible avec les trois applications web.

## Vérification et livraison

- Lancer au minimum les tests, le lint, le contrôle TypeScript ou le build directement concernés par le changement.
- Pour une modification backend, privilégier le test PHPUnit ciblé avant la suite complète.
- Pour une modification d'un package partagé, vérifier ses consommateurs pertinents.
- Dans le compte rendu final, indiquer les fichiers modifiés, les validations exécutées et toute validation non exécutée.

