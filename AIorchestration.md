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

**Dernier état :** 2026-06-22

### Sprint 7 — Administration (back-office) — 🔄 En cours

**Tâches terminées :**
- ✅ Backend : `EnsureAdmin` middleware + `AdminController` (11 endpoints : stats, users, deliveries, drivers, reports) + routes `/admin/*` dans `api.php` + enregistrement dans `bootstrap/app.php`
- ✅ Backend : `tests/Feature/Admin/AdminControllerTest.php`
- ✅ Frontend : `types/admin.ts` — interfaces TypeScript AdminStats, AdminUser, AdminDelivery, AdminDriver, AdminReport
- ✅ Frontend : `lib/api/admin.ts` — client API (9 fonctions fetch)
- ✅ Frontend : `app/(admin)/layout.tsx` — layout admin avec sidebar, auth guard, navigation
- ✅ Frontend : `app/(admin)/admin/page.tsx` — dashboard KPI (stats, breakdown statuts)
- ✅ Frontend : `components/admin/` — StatCard, PageHeader, StatusBadge
- ✅ Frontend : `app/(admin)/admin/users/page.tsx` — table users, search, role filter, changement de rôle
- ✅ Frontend : `app/(admin)/admin/deliveries/page.tsx` — table livraisons, filtres, validation paiement, changement statut
- ✅ Frontend : `app/(admin)/admin/drivers/page.tsx` — table livreurs, toggle actif/inactif
- ✅ Frontend : `app/(admin)/admin/reports/page.tsx` — graphiques CSS, top clients, taux de complétion

**À faire :**
- 🔲 Commit + vérification lint/build `admin/`
- 🔲 Vérification tests backend (`composer test`)
- 🔲 Supprimer `frontend/app/(admin)/` une fois l'app `admin/` complète
- 🔲 Merge `develop` → `main` en fin de sprint

🔒 En cours : `admin/` — nouvelle app Next.js admin.speedservice.bj (port 3001)

**Note architecture :** L'espace admin est extrait en app séparée (`admin/`) au lieu d'être embarqué dans `frontend/app/(admin)/`. Même pattern que `rider/` prévu au Sprint 8. Le `frontend/app/(admin)/` sera supprimé une fois la migration terminée.

**Fichiers libres (sprint 7 complet côté Claude) :**
- `backend/app/Http/Controllers/Api/AdminController.php`
- `backend/app/Http/Middleware/EnsureAdmin.php`
- `backend/routes/api.php`
- `backend/bootstrap/app.php`
- `backend/tests/Feature/Admin/AdminControllerTest.php`
- `admin/` (entire directory — nouvelle app admin séparée)
- `frontend/app/(admin)/**` (à supprimer après migration vers `admin/`)
- `frontend/components/admin/**`
- `frontend/lib/api/admin.ts`
- `frontend/types/admin.ts`

---

## Section GPT Codex

**Dernier état :** —

*(Codex écrit uniquement ici)*

---
