# Déploiement — Vercel + Railway

## 1. Backend Laravel → Railway

### Prérequis
- Compte Railway : https://railway.app
- CLI Railway (optionnel) : `npm i -g @railway/cli`

### Étapes

1. **Créer un nouveau projet Railway**
   - New Project → Deploy from GitHub repo → sélectionner ce repo
   - Choisir le dossier `backend/` comme "Root Directory" (ou laisser `/` si Railway détecte le Dockerfile)

2. **Ajouter PostgreSQL**
   - Dans le projet Railway : + New Service → Database → PostgreSQL
   - Les variables `${{Postgres.PGHOST}}` etc. seront automatiquement disponibles

3. **Ajouter Redis**
   - + New Service → Database → Redis
   - La variable `${{Redis.REDIS_URL}}` sera automatiquement disponible

4. **Configurer les variables d'environnement** (onglet Variables du service Laravel)
   Copier le contenu de `backend/.env.railway.example` et remplir les valeurs manquantes :
   - `APP_KEY` → générer avec : `php artisan key:generate --show`
   - `APP_URL` → l'URL Railway assignée (ex: `https://speedservice-api-production.up.railway.app`)
   - `MAIL_PASSWORD` → mot de passe d'application Gmail (pas le vrai mot de passe)
   - `FRONTEND_URL` et `SANCTUM_STATEFUL_DOMAINS` → les URLs Vercel (à mettre à jour après le déploiement Vercel)

5. **Déployer**
   - Railway build et déploie automatiquement au push sur `main`
   - Les migrations s'exécutent automatiquement au démarrage (`docker-entrypoint.sh`)

6. **Seeder initial**
   - Dans l'onglet Shell du service Railway :
     ```sh
     php artisan db:seed
     ```
   - Crée le compte admin : `admin@speedservice.bj`

---

## 2. Frontends Next.js → Vercel

Créer **3 projets Vercel séparés** pointant sur le même repo GitHub.

> **Important** : Pour chaque projet, laisser "Root Directory" vide (= racine du repo).
> Vercel exécutera `pnpm install` à la racine pour résoudre les workspace packages.

### Projet 1 — Frontend client (speedservice.bj)

| Paramètre | Valeur |
|-----------|--------|
| Root Directory | *(vide — racine du repo)* |
| Framework Preset | Next.js |
| Install Command | `pnpm install` |
| Build Command | `pnpm --filter speedservice-frontend build` |
| Output Directory | `frontend/.next` |

**Variables d'env :**
```
NEXT_PUBLIC_API_URL=https://VOTRE_PROJET.railway.app
```

### Projet 2 — Admin (admin.speedservice.bj)

| Paramètre | Valeur |
|-----------|--------|
| Root Directory | *(vide — racine du repo)* |
| Framework Preset | Next.js |
| Install Command | `pnpm install` |
| Build Command | `pnpm --filter speedservice-admin build` |
| Output Directory | `admin/.next` |

**Variables d'env :**
```
NEXT_PUBLIC_API_URL=https://VOTRE_PROJET.railway.app
```

### Projet 3 — Driver PWA (driver.speedservice.bj)

| Paramètre | Valeur |
|-----------|--------|
| Root Directory | *(vide — racine du repo)* |
| Framework Preset | Next.js |
| Install Command | `pnpm install` |
| Build Command | `pnpm --filter speedservice-driver build` |
| Output Directory | `driver/.next` |

**Variables d'env :**
```
NEXT_PUBLIC_API_URL=https://VOTRE_PROJET.railway.app
```

---

## 3. Après les déploiements — Mettre à jour le CORS

Une fois les URLs Vercel connues, mettre à jour sur Railway :

```
FRONTEND_URL=https://speedservice-frontend.vercel.app
SANCTUM_STATEFUL_DOMAINS=speedservice-frontend.vercel.app,speedservice-admin.vercel.app,speedservice-driver.vercel.app
```

---

## 4. Domaines custom (optionnel)

### Vercel
- Project Settings → Domains → Add Domain
- Ajouter `speedservice.bj`, `admin.speedservice.bj`, `driver.speedservice.bj`
- Vercel fournit les enregistrements DNS (CNAME ou A record) à configurer chez ton registrar

### Railway
- Service Settings → Networking → Custom Domain
- Ajouter `api.speedservice.bj`
- Configurer le CNAME chez ton registrar

Après ajout des domaines custom, mettre à jour `APP_URL`, `FRONTEND_URL` et `SANCTUM_STATEFUL_DOMAINS` sur Railway.

---

## 5. CI/CD

Les deux plateformes déploient automatiquement à chaque push sur `main`.
Pour éviter un redéploiement inutile, configurer des "Ignored Build Steps" sur Vercel :
- Frontend : ignore si aucun fichier dans `frontend/`, `packages/`, `pnpm-lock.yaml` n'a changé
- Admin : idem pour `admin/`
- Driver : idem pour `driver/`
