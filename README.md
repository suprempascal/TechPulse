# ⚡ TechPulse

Blog tech communautaire : les utilisateurs partagent des avis sur les produits, les notent via des **likes** et le discutent en **commentaires**. Chaque article est classé en temps réel selon un score simple : **`score = likes + commentaires`**.

## ✨ Fonctionnalités

| Fonctionnalité | Détail |
|---|---|
| 👤 Comptes | Inscription, connexion, déconnexion, page de profil |
| 📰 Articles | Liste triable, page détail, publication réservée aux admins |
| ❤️ Likes | Like/Unlike révocable, bascule en AJAX sans rechargement |
| 💬 Commentaires | Publication par un utilisateur connecté, suppression par l'auteur ou un admin |
| 🏆 Classement | Tri Top / Récents / Plus commentés / Plus likés, badge 🔥 sur le top 3, filtre par catégorie |
| 🛡️ Sécurité | Mots de passe hachés (scrypt), sessions signées, CSRF, rate-limit, échappement EJS |

## 🧱 Stack

- **Node.js ≥ 22.5** (testé sur Node 24) — *aucun driver natif à compiler*
- **Express** — serveur HTTP
- **EJS** — rendu côté serveur
- **SQLite** via le module natif `node:sqlite`
- **CSS custom** — dark par défaut, thème clair automatique, responsive, zéro framework

## 📁 Structure (MVC)

```
techpulse/
├── server.js                  # Bootstrap : DB → seed → Express → listen
├── src/
│   ├── config.js              # Port, secret, durées, pondération du score
│   ├── models/                # Couche données — SEUL endroit qui écrit du SQL
│   │   ├── db.js              # Connexion SQLite + helpers (all/get/run)
│   │   ├── User.js            # Comptes, hash scrypt, vérification
│   │   ├── Session.js         # Sessions en base + cookie signé HMAC
│   │   ├── Article.js         # Articles, slugs, classement/score
│   │   ├── Comment.js         # Commentaires
│   │   └── Like.js            # Toggle like
│   ├── controllers/           # Logic : reçoit req/res, appelle les models
│   ├── routes/                # Mapping URL → controller
│   ├── middlewares/           # session, csrf, authGuard, rateLimit, locals
│   └── db/                    # schema.sql + seed des données de démo
├── views/                     # Templates EJS (+ partials)
├── public/
│   ├── css/style.css
│   └── js/ (like.js, main.js)
└── data/blog.db               # Base SQLite (générée, gitignorée)
```

## 🚀 Démarrage rapide

```bash
npm install
npm start          # http://localhost:3000
# ou en développement (rechargement auto) :
npm run dev
```

Au premier lancement, la base est créée et **seedée automatiquement** :

- **8 articles tech** (smartphone, laptop, audio, clavier, GPU, wearable, écran, drone)
- **4 comptes de démonstration**

| Rôle | Compte | Mot de passe |
|---|---|---|
| Admin (peut publier) | `admin` | `admin123` |
| Utilisateur | `demo` | `demo123` |
| Utilisateur | `lea` | `lea12345` |
| Utilisateur | `sam` | `sam12345` |

Pour repartir d'une base vierge : supprimez `data/blog.db` puis relancez le serveur.

## 🧪 Tests manuels

```bash
npm run check      # vérifie la syntaxe de tous les fichiers .js
```

Flux principal à vérifier : s'inscrire → liker un article → commenter → constater que le score monte dans le classement.

## 🔌 Routes principales

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/` | public | Classement (tri + catégories via `?sort=` & `?categorie=`) |
| GET/POST | `/login` · `/register` | public* | Connexion / inscription |
| POST | `/logout` | connecté | Déconnexion |
| GET | `/articles/:slug` | public | Détail d'un article |
| GET/POST | `/articles/new` | admin | Publier un article |
| POST | `/articles/:slug/comments` | connecté | Ajouter un commentaire |
| POST | `/articles/:slug/comments/:id/delete` | auteur ou admin | Supprimer un commentaire |
| POST | `/api/articles/:id/like` | connecté | Bascule le like (réponse JSON) |
| GET | `/profile` | connecté | Profil, stats, articles, commentaires | 

\* le rate-limit (5 tentatives / 15 min par IP) s'applique sur `/login`.

## 🛡️ Sécurité implémentée

- **Mots de passe** hachés avec `crypto.scrypt` (sel aléatoire + `timingSafeEqual`)
- **Sessions** stockées en SQLite, cookie `sid` signé HMAC-SHA256 (httpOnly, SameSite=Lax)
- **CSRF** : token par session, vérifié sur tous les POST (formulaire **ou** header `X-CSRF` pour l'API)
- **Rate-limit** mémoire sur les routes d'authentification
- **Échappement systématique** des sorties dans les templates EJS
- Headers `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `X-Powered-By` désactivé

## ⚙️ Configuration

Variables d'environnement exposées via `src/config.js` :

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3000` | Port HTTP |
| `DB_FILE` | `data/blog.db` | Chemin de la base SQLite |
| `SESSION_SECRET` | dérivé de la machine | Secret des cookies de session — **à redéfinir en production** |
| `NODE_ENV` | — | `production` active les cookies `Secure` |

Le score est pondéré dans `config.scoring` (`likes: 1`, `comments: 1`) — ajustez ces valeurs pour modifier le classement.

## 📝 Licence

MIT — projet d'apprentissage (Express · EJS · SQLite), NeiCours / web.