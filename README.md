# Naz — Plateforme de cours de français et de mathématiques

Plateforme e-learning **100 % en français**, destinée à des clients **en France**.
Elle publie des cours de **français** et de **mathématiques** pour enfants et
élèves, organisés par **Matière → Niveau → Cours → Leçon**, avec un
**back-office complet** (CMS, étudiants, médias, statistiques) et un espace
étudiant avec suivi de progression.

Construit avec **Next.js 16**, **React 19**, **Tailwind CSS v4** et **Supabase**
(Postgres + Auth + Storage), paiements premium via **Stripe** (optionnel).

---

## Fonctionnalités

**Site public**
- Page d'accueil, catalogue par matière/niveau, fiche de cours, lecteur de leçon
- 4 types de leçons : **article** (texte riche), **vidéo** (YouTube/Vimeo/MP4),
  **PDF** (à télécharger), **quiz** interactif auto-corrigé
- Cours **gratuits** et **premium** (verrouillage côté serveur)
- Inscription / connexion, espace étudiant, **suivi de progression**

**Back-office (`/admin`, réservé aux administrateurs)**
- Tableau de bord avec statistiques (inscrits, cours, vues, demandes d'accès)
- CMS complet : créer / modifier / supprimer matières, niveaux, cours, leçons,
  avec brouillon/publié
- **Téléversement de médias** (images, vidéos, PDF) vers Supabase Storage
- Gestion des étudiants (rôles) et **file d'attente des accès premium**

**Paiements premium**
- **Stripe Checkout** (EUR €) — accès accordé automatiquement via webhook
- Repli **manuel** : l'étudiant demande l'accès, l'admin l'accorde (virement, etc.)

---

## Prérequis

- **Node.js 20.9+**
- Un compte **Supabase** (gratuit) — https://supabase.com
- (Optionnel) un compte **Stripe** pour les paiements par carte

---

## 1. Installation locale

```bash
npm install
cp .env.example .env.local   # puis remplis les valeurs (voir §3)
npm run dev                  # http://localhost:3000
```

---

## 2. Configuration de Supabase

1. Crée un projet sur https://supabase.com.
2. Dans **SQL Editor**, exécute, dans l'ordre :
   - `supabase/migrations/0001_init.sql` (tables, rôles, RLS, triggers)
   - `supabase/migrations/0002_storage_and_helpers.sql` (buckets + accès premium)
   - `supabase/seed.sql` *(optionnel — un catalogue d'exemple)*
3. Dans **Settings → API**, récupère :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`
4. **Auth → Providers → Email** : garde activé. Pour tester sans e-mails,
   tu peux désactiver « Confirm email » en développement.
5. **Auth → URL Configuration** : ajoute ton URL de site et
   `…/auth/callback` dans les *Redirect URLs*.

### Se nommer administrateur

Crée d'abord un compte normal via `/inscription`, puis dans **SQL Editor** :

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'ton-email@exemple.com');
```

Reconnecte-toi : le lien **Admin** apparaît dans l'en-tête.

---

## 3. Variables d'environnement

Voir `.env.example`. Les clés Supabase sont **obligatoires** ; Stripe est
**optionnel** (sans Stripe, seul le flux « demander l'accès » est proposé).

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur (webhook Stripe) — **jamais côté navigateur** |
| `NEXT_PUBLIC_SITE_URL` | URL publique (redirections auth + retour Stripe) |
| `STRIPE_SECRET_KEY` | *(optionnel)* clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | *(optionnel)* secret de signature du webhook |

---

## 4. Stripe (optionnel)

1. Dans Stripe → **Developers → API keys**, copie la *Secret key* →
   `STRIPE_SECRET_KEY`.
2. Crée un **webhook** vers `https://TON_DOMAINE/api/stripe/webhook`,
   événement `checkout.session.completed`. Copie le *Signing secret* →
   `STRIPE_WEBHOOK_SECRET`.
3. Les cours premium avec un **prix > 0 €** afficheront le bouton
   « Débloquer — X € ». Le webhook accorde l'accès après paiement.

Test local du webhook :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 5. Déploiement (Vercel)

1. Pousse le code sur GitHub.
2. Sur https://vercel.com, **New Project** → importe le dépôt.
3. Ajoute toutes les variables d'environnement (§3) dans
   **Settings → Environment Variables**. Mets `NEXT_PUBLIC_SITE_URL` à ton
   domaine final (ex. `https://naz.fr`).
4. Déploie. Le build utilise Turbopack ; les polices sont **auto-hébergées**,
   aucune dépendance réseau externe au build.
5. Mets à jour les *Redirect URLs* Supabase et l'URL du webhook Stripe avec le
   domaine de production.

### Acheter et brancher le domaine

1. Achète le domaine (OVH, Gandi, Namecheap, Google Domains…).
2. Dans Vercel → **Settings → Domains**, ajoute ton domaine.
3. Chez ton registraire, crée les enregistrements DNS indiqués par Vercel
   (en général un `A` vers `76.76.21.21` et/ou un `CNAME` `www` →
   `cname.vercel-dns.com`). Vercel gère le certificat HTTPS automatiquement.

---

## 6. Structure du projet

```
src/
  app/
    (public)/            Site public (en-tête + pied de page communs)
      page.tsx           Accueil
      cours/…            Catalogue → matière → cours → leçon
      mon-espace/        Espace étudiant (progression)
    (auth)/              Connexion / inscription
    admin/               Back-office (protégé par rôle)
      actions.ts         Server actions CRUD (gardées par isAdmin)
    api/stripe/webhook/  Webhook Stripe (accorde l'accès premium)
    actions/             Server actions (progression, paiement, suivi)
    auth/callback/       Échange du code de confirmation e-mail
  components/            UI (publique + admin)
  lib/
    supabase/            Clients navigateur/serveur/admin + types + proxy
    queries.ts           Lectures catalogue
    auth.ts              Utilisateur courant / contrôle admin
    stripe.ts            Client Stripe (optionnel)
  proxy.ts               Rafraîchissement de session + gardes de routes (Next 16)
supabase/
  migrations/            Schéma SQL + RLS + storage
  seed.sql               Catalogue d'exemple
SESSION_NOTES.md         Journal de construction (décisions, correctifs)
```

---

## 7. Notes techniques

- **Next.js 16** : la convention `middleware` est renommée `proxy` (`src/proxy.ts`),
  exécutée sur le runtime Node.js. Les API de requête (`cookies`, `params`,
  `searchParams`) sont asynchrones.
- **Sécurité** : l'accès est protégé à deux niveaux — le `proxy` bloque `/admin`,
  et chaque *server action* d'admin revérifie le rôle. Les **RLS** Postgres
  protègent les données même en cas de contournement applicatif. Le contenu
  premium n'est jamais envoyé au navigateur tant que l'accès n'est pas accordé.
- **Polices auto-hébergées** (`next/font/local`) : le build ne dépend pas de
  Google Fonts.

---

## Scripts

```bash
npm run dev      # développement
npm run build    # build de production
npm run start    # serveur de production
npm run lint     # ESLint
```
