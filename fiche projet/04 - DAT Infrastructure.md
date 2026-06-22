# DAT — INFRASTRUCTURE & DÉPLOIEMENT
# Speed Service

**Version :** 1.1 — cible d'infrastructure et état du dépôt
**Date :** Juin 2026
**Complément :** [03 - DAT Architecture.md](03%20-%20DAT%20Architecture.md)

---

# 1. Objet du document

Ce document décrit l'**infrastructure** de la plateforme Speed Service : serveurs, réseau, DNS, configuration Nginx, SSL, Docker, CI/CD, monitoring, sauvegardes et sécurité opérationnelle.

Pour l'architecture logicielle (code, BDD, modules métier), voir [03 - DAT Architecture.md](03%20-%20DAT%20Architecture.md).

---

# 2. Architecture multi-application cible

La cible de production prévoit **trois sous-domaines** desservis par un VPS. Aucun élément du dépôt ne permet d'affirmer que ce déploiement ou ces DNS existent déjà.

| Sous-domaine | Application | Port interne | Notes |
|---|---|---|---|
| `speedservice.bj` | Next.js client | 3000 | Desktop-first |
| `rider.speedservice.bj` | Next.js rider | 3001 | Mobile-first, PWA — Sprint 8 |
| `api.speedservice.bj` | Laravel API | 8000 | Partagé entre les deux apps |

Nginx joue le rôle de **reverse proxy** : il reçoit toutes les requêtes HTTPS entrantes et les distribue au bon processus selon le `server_name`.

```

**État courant vérifié :** le développement local repose sur `frontend/`, `backend/`, PostgreSQL et Redis via Docker Compose. Le dossier `rider/` n'existe pas encore. Le back-office du Sprint 7 reste un chantier **en cours piloté par Claude** dans le frontend principal.
Internet
    │ :443 HTTPS
    ▼
  Nginx
    ├── speedservice.bj       → localhost:3000  (Next.js client)
    ├── rider.speedservice.bj → localhost:3001  (Next.js rider)
    └── api.speedservice.bj   → localhost:8000  (Laravel)
```

---

# 3. Configuration DNS

À configurer chez le registrar (OVH, Namecheap, Contabo DNS…) lors des Sprints 8 et 9.

## 3.1 Enregistrements à créer

```dns
; Domaine principal
speedservice.bj         A       <IP_VPS>
www.speedservice.bj     CNAME   speedservice.bj

; Sous-domaine API
api.speedservice.bj     A       <IP_VPS>

; Sous-domaine rider
rider.speedservice.bj   A       <IP_VPS>
```

> Utiliser des enregistrements `A` (IP directe) plutôt que `CNAME` pour le domaine racine — la plupart des registrars n'acceptent pas de CNAME sur l'apex.

## 3.2 TTL recommandé

| Phase | TTL |
|---|---|
| Configuration initiale | 300 s (5 min) — permet de corriger rapidement |
| Production stable | 3600 s (1 h) |

## 3.3 Vérification de la propagation

```bash
dig speedservice.bj A
dig rider.speedservice.bj A
dig api.speedservice.bj A
# Doit retourner <IP_VPS> pour les trois
```

---

# 4. Configuration Nginx cible

Les blocs ci-dessous sont des modèles de déploiement à adapter et tester ; ils ne sont pas versionnés comme configuration active dans le dépôt.

## 4.1 Installation

```bash
sudo apt update && sudo apt install nginx -y
sudo systemctl enable nginx
```

## 4.2 Bloc — Application client (`speedservice.bj`)

`/etc/nginx/sites-available/speedservice`

```nginx
server {
    listen 80;
    server_name speedservice.bj www.speedservice.bj;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name speedservice.bj www.speedservice.bj;

    ssl_certificate     /etc/letsencrypt/live/speedservice.bj/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/speedservice.bj/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 4.3 Bloc — Application rider (`rider.speedservice.bj`)

`/etc/nginx/sites-available/rider`

```nginx
server {
    listen 80;
    server_name rider.speedservice.bj;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rider.speedservice.bj;

    ssl_certificate     /etc/letsencrypt/live/rider.speedservice.bj/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rider.speedservice.bj/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;

    location / {
        proxy_pass         http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 4.4 Bloc — API Laravel (`api.speedservice.bj`)

`/etc/nginx/sites-available/api`

```nginx
server {
    listen 80;
    server_name api.speedservice.bj;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.speedservice.bj;

    ssl_certificate     /etc/letsencrypt/live/api.speedservice.bj/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.speedservice.bj/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;

    root  /var/www/speedservice/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass   unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include        fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## 4.5 Activer les sites et recharger

```bash
sudo ln -s /etc/nginx/sites-available/speedservice /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/rider        /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api          /etc/nginx/sites-enabled/
sudo nginx -t          # vérification syntaxe
sudo systemctl reload nginx
```

---

# 5. Certificats SSL (Let's Encrypt) — cible

## 5.1 Installation de Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## 5.2 Génération des certificats

```bash
# Domaine client
sudo certbot --nginx -d speedservice.bj -d www.speedservice.bj

# API
sudo certbot --nginx -d api.speedservice.bj

# Rider (à déployer en Sprint 8)
sudo certbot --nginx -d rider.speedservice.bj
```

Certbot modifie automatiquement les blocs Nginx pour inclure les chemins de certificat.

## 5.3 Renouvellement automatique

Certbot installe un timer systemd qui renouvelle les certificats avant expiration. Vérification :

```bash
sudo certbot renew --dry-run   # test de renouvellement
sudo systemctl status certbot.timer
```

---

# 6. CORS — Configuration Laravel

Le backend devra autoriser les deux origines frontend en production. À la date de l'audit, aucun fichier `backend/config/cors.php` n'est présent : la politique doit donc être publiée/configurée et testée avant mise en ligne.

`backend/config/cors.php`

```php
return [
    'paths'               => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods'     => ['*'],
    'allowed_origins'     => [
        'https://speedservice.bj',
        'https://www.speedservice.bj',
        'https://rider.speedservice.bj',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers'     => ['*'],
    'exposed_headers'     => [],
    'max_age'             => 0,
    'supports_credentials' => true,
];
```

En développement local, autoriser `http://localhost:3000` et, seulement après création de l'app rider, `http://localhost:3001`. Le backend utilise actuellement des Bearer tokens Sanctum, pas l'authentification SPA par cookie ; `supports_credentials` doit être choisi en cohérence avec le mode final.

---

# 7. Conteneurisation

## 7.1 Stack Docker locale (développement)

`docker-compose.yml` à la racine du projet :

```yaml
services:
  frontend:
    build:
      context: ./frontend
    ports: ["3000:3000"]
    environment:
      NODE_ENV: development

  backend:
    build:
      context: ./backend
    ports: ["8000:8000"]
    depends_on: [db, redis]
    environment:
      DB_CONNECTION: pgsql
      DB_HOST: db

  db:
    image: postgres:16
    volumes: [db_data:/var/lib/postgresql/data]

  redis:
    image: redis:latest
    ports: ["6379:6379"]

volumes:
  db_data:
```

Ce résumé reflète les noms de services actuels. Deux points restent à corriger/valider pour un démarrage intégré : exposer `NEXT_PUBLIC_API_URL` au frontend si la valeur par défaut ne convient pas, et définir `REDIS_HOST=redis` côté backend pour les queues (la valeur par défaut actuelle est `127.0.0.1`). Aucun worker de queue dédié n'est déclaré dans Compose.

## 7.2 Production cible

Le scénario proposé fait tourner les apps Next.js comme processus Node.js managés par **PM2** (ou systemd). Ce choix n'est pas encore matérialisé par des fichiers de déploiement ou un `ecosystem.config.*` dans le dépôt.

```bash
# Installer PM2
npm install -g pm2

# Lancer l'app client (port 3000)
cd /var/www/speedservice/frontend
pm2 start npm --name "speedservice-client" -- start -- -p 3000

# Lancer l'app rider (port 3001) — Sprint 8
cd /var/www/speedservice/rider
pm2 start npm --name "speedservice-rider" -- start -- -p 3001

# Persister au redémarrage
pm2 save
pm2 startup
```

---

# 8. Chaîne CI actuelle et CD cible

## 8.1 Outil

**GitHub Actions**

## 8.2 Branches Git

| Branche | Rôle |
|---|---|
| `main` | Version stable ; cible de production après validation |
| `develop` | Développement courant ; cible de préproduction |
| `feature/*` | Développement de fonctionnalités |
| `hotfix/*` | Correctifs urgents |

## 8.3 Job Frontend (`.github/workflows/ci.yml`)

Déclenchement : PR vers `develop`, push sur `develop` ou `main`.

```
1. Checkout du code
2. npm install
3. Lint (ESLint)
4. Build Next.js
```

## 8.4 Job Backend et validation Docker (`.github/workflows/ci.yml`)

```
1. Checkout du code
2. composer validate --strict
3. composer install
4. Copie de .env.example et génération APP_KEY
5. composer test (PHPUnit)
6. Job séparé : docker compose config
```

La CI se déclenche sur push et pull request vers `main` ou `develop`. Elle ne contient actuellement **aucune étape de déploiement** ; la partie CD (SSH, migrations, redémarrage PM2/queues) reste à concevoir au Sprint 9.

## 8.5 Secrets GitHub Actions cibles pour le déploiement

| Secret | Usage |
|---|---|
| `VPS_HOST` | IP du serveur de production |
| `VPS_USER` | Utilisateur SSH |
| `VPS_SSH_KEY` | Clé privée SSH |
| `APP_KEY` | Laravel application key |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `REDIS_PASSWORD` | Mot de passe Redis |
| `FEDAPAY_SECRET_KEY` | Clé API FedaPay |
| `MTN_MOMO_API_KEY` | Clé API MTN MoMo |
| `MOOV_MONEY_API_KEY` | Clé API Moov Money |
| `SMTP_PASSWORD` | Mot de passe serveur email |

> Ces noms décrivent une cible et ne prouvent pas que les secrets sont configurés. Aucun secret ne doit apparaître dans le dépôt Git (`.env` est dans `.gitignore`). Les clés FedaPay/MTN/Moov ne seront utiles qu'après choix et intégration effective des passerelles.

---

# 9. Environnements

| Environnement | URL | Source | Déploiement |
|---|---|---|---|
| Développement | `localhost:3000` / `localhost:8000` | Branche courante | Manuel (`docker compose up`) |
| Préproduction cible | `staging.speedservice.bj` | `develop` | À mettre en place |
| Production cible | `speedservice.bj` | `main` | À mettre en place après validation |

---

# 10. Serveur de production recommandé

| Composant | Valeur |
|---|---|
| OS | Ubuntu Server 24.04 LTS |
| Fournisseur recommandé | Contabo VPS S ou OVH VPS Value |
| CPU minimum | 2 vCPU |
| RAM minimum | 4 Go |
| Stockage | 50 Go SSD |
| Bande passante | 200 Mbps minimum |

---

# 11. Sauvegardes cibles

## 11.1 Base de données PostgreSQL

```bash
# Dump quotidien automatisé via cron
0 3 * * * pg_dump -U postgres speedservice | gzip > /backups/db/$(date +\%Y\%m\%d).sql.gz

# Nettoyage des sauvegardes > 30 jours
0 4 * * * find /backups/db -name "*.sql.gz" -mtime +30 -delete
```

Conservation cible : **30 jours minimum**. Aucun script ou job de sauvegarde n'est versionné dans le dépôt actuel.

## 11.2 Fichiers uploadés (documents rider — Sprint 8)

Au Sprint 8, les fichiers d'identité et documents livreur devront être stockés sur **S3 (ou compatible S3)** avec accès privé et sauvegarde adaptée. La durée de conservation devra être validée selon le droit applicable ; les tables et uploads rider n'existent pas encore.

---

# 12. Monitoring cible

## 12.1 Application

| Outil | Usage |
|---|---|
| Laravel Pulse | Métriques temps réel (requêtes, jobs, erreurs) |
| Laravel Telescope | Debug en préproduction (désactivé en production) |

## 12.2 Infrastructure

| Outil | Usage |
|---|---|
| Uptime Kuma | Surveillance de disponibilité (`speedservice.bj`, `api.speedservice.bj`, `rider.speedservice.bj`) |
| Grafana + Prometheus | Métriques serveur (CPU, RAM, disque, réseau) |

## 12.3 Alertes

Uptime Kuma notifie par email et SMS en cas d'indisponibilité supérieure à 2 minutes.

Ces outils et alertes sont des recommandations : aucune configuration Pulse, Telescope, Uptime Kuma, Prometheus ou Grafana n'est présente dans le dépôt.

---

# 13. Journalisation cible

| Type | Canal | Rétention |
|---|---|---|
| Logs Laravel (erreurs, auth, paiements) | Fichiers (`storage/logs/`) | 90 jours |
| Logs Nginx (accès, erreurs) | `/var/log/nginx/` | 30 jours |
| Logs système | `journald` | 30 jours |

Rotation des logs via **logrotate** (installé par défaut sur Ubuntu).

Les durées de rétention ci-dessus constituent une politique à mettre en œuvre sur le serveur ; elles ne sont pas garanties par le code du dépôt.

---

# 14. Plan cible de déploiement initial (Sprint 9)

```
1. Provisionner le VPS (Ubuntu 24.04)
2. Configurer le DNS (enregistrements A pour les 3 sous-domaines)
3. Installer : Nginx, PHP 8.4, PHP-FPM, une version Node validée avec Next.js (CI actuelle : Node 24), PM2, PostgreSQL 16, Redis, Certbot
4. Cloner le dépôt Git sur le serveur
5. Configurer les fichiers .env (backend + frontend)
6. php artisan migrate --seed
7. npm run build (frontend client)
8. Démarrer les processus PM2 (client :3000, Laravel via PHP-FPM)
9. Configurer les blocs Nginx (§4)
10. Générer les certificats SSL (§5)
11. Vérifier : curl https://api.speedservice.bj/api/status → { "status": "ok" }
12. Configurer les crons (sauvegardes, Laravel scheduler)
13. Activer le monitoring (Uptime Kuma, Grafana)
```

---

# 15. Ajout du sous-domaine rider (Sprint 8)

Checklist spécifique à la mise en production de `rider.speedservice.bj` :

```
□ Créer l'enregistrement DNS A : rider.speedservice.bj → <IP_VPS>
□ Créer le projet Next.js rider (dossier /rider)
□ npm run build dans /rider
□ Démarrer PM2 sur le port 3001
□ Créer le bloc Nginx /etc/nginx/sites-available/rider (§4.3)
□ Activer le site (ln -s + nginx -t + reload)
□ Générer le certificat SSL : certbot --nginx -d rider.speedservice.bj
□ Ajouter rider.speedservice.bj dans config/cors.php
□ Tester l'accès HTTPS depuis un mobile
□ Tester l'installation PWA (Android Chrome → "Ajouter à l'écran d'accueil")
```

---

## 16. État d'exécution vérifié

| Élément | État au 22 juin 2026 |
|---|---|
| Dockerfiles frontend/backend | Présents, orientés développement |
| Docker Compose local | Présent ; ajustements Redis/API/worker à valider |
| GitHub Actions | CI unique : lint/build frontend, validation/tests backend, validation Compose |
| Déploiement automatique | Absent |
| DNS, Nginx, TLS | Cibles documentées, non vérifiées comme déployées |
| Sauvegardes et monitoring | Recommandations, non versionnés |
| Rider `rider.speedservice.bj` | Sprint 8, application absente |
| Sprint 7 Administration | **En cours — chantier Claude**, ne constitue pas encore une version livrable validée |
