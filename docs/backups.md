# Sauvegarde et restauration PostgreSQL

Le workflow GitHub Actions [`.github/workflows/db-backup.yml`](../.github/workflows/db-backup.yml) crée chaque jour à 03:00 UTC une sauvegarde logique de PostgreSQL avec `pg_dump` 16. Le dump est chiffré en AES-256 avant d'être envoyé dans les artifacts GitHub, avec une rétention de 30 jours.

Le workflow peut aussi être lancé manuellement depuis **GitHub → Actions → Database backup → Run workflow**.

## Configuration GitHub

Ajouter les secrets suivants dans **Settings → Secrets and variables → Actions → New repository secret** :

| Secret | Contenu |
|---|---|
| `RAILWAY_DATABASE_URL` | URL de connexion **publique/externe** du service PostgreSQL Railway (souvent exposée par Railway sous `DATABASE_PUBLIC_URL`) |
| `BACKUP_PASSPHRASE` | Phrase secrète longue et unique utilisée pour chiffrer les dumps |

La phrase secrète ne doit pas être stockée dans le dépôt. La conserver également dans le gestionnaire de secrets de l'organisation : sans elle, les sauvegardes sont irrécupérables.

Si l'un des deux secrets est absent, le workflow est ignoré avec une notice et ne produit aucun artifact.

## Vérifier la première sauvegarde

1. Lancer manuellement le workflow `Database backup`.
2. Vérifier que toutes les étapes sont vertes.
3. Télécharger l'artifact `speedservice-db-backup-<run_id>`.
4. Déchiffrer et inspecter son catalogue :

```bash
gpg --output speedservice.dump --decrypt speedservice-db-YYYY-MM-DD-RUN_ID.dump.gpg
pg_restore --list speedservice.dump
```

`gpg` demande la valeur de `BACKUP_PASSPHRASE` de manière interactive.

## Restaurer une sauvegarde

Toujours tester la restauration sur une base PostgreSQL 16 vide et isolée avant toute intervention en production.

```bash
export TARGET_DATABASE_URL='postgresql://user:password@host:port/empty_database?sslmode=require'

pg_restore \
  --dbname="$TARGET_DATABASE_URL" \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  speedservice.dump
```

Après la restauration :

```bash
psql "$TARGET_DATABASE_URL" -c 'select count(*) from users;'
psql "$TARGET_DATABASE_URL" -c 'select count(*) from deliveries;'
```

Valider ensuite la connexion de l'API sur cette base et ses principales routes avant de planifier une restauration de production.

## Exploitation

- Vérifier au moins une fois par semaine que le workflow produit bien un artifact.
- Effectuer un test de restauration complet au moins une fois par trimestre.
- Faire tourner `BACKUP_PASSPHRASE` selon la politique de secrets ; les anciennes sauvegardes restent liées à l'ancienne phrase secrète.
- La rétention GitHub étant de 30 jours, copier les sauvegardes vers un stockage d'archives chiffré si une conservation plus longue est requise.
