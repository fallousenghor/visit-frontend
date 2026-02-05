# Déploiement Frontend sur Vercel

Ce guide explique comment déployer le frontend Smart Business Card sur Vercel.

## Prérequis

- Un compte [Vercel](https://vercel.com)
- Un compte [GitHub](https://github.com) avec le repository configuré
- Le backend déployé (sur Render ou autre)

## Méthode 1: Déploiement via Vercel Dashboard

### Étape 1: Connecter le repository

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez votre repository GitHub `smart-business-card`
4. Configurez les options:

   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `frontend`

### Étape 2: Configurer les variables d'environnement

Dans la section **"Environment Variables"**, ajoutez:

```
VITE_API_URL=https://your-backend-api.com/api/v1
```

> ⚠️ **Important**: Remplacez `your-backend-api.com` par l'URL réelle de votre backend.

Pour le développement local, créez un fichier `.env` dans `frontend/`:

```env
VITE_API_URL=http://localhost:3001/api/v1
```

### Étape 3: Déployer

1. Cliquez sur **"Deploy"**
2. Attendez la fin du build
3. Votre application sera accessible sur `https://your-project.vercel.app`

---

## Méthode 2: Déploiement via Vercel CLI

### Installation

```bash
npm i -g vercel
```

### Connexion

```bash
cd smart-business-card/frontend
vercel login
```

### Déploiement (Production)

```bash
vercel --prod
```

### Configuration interactive

Lors du premier déploiement:

```
Vercel CLI
? Set up and deploy? [Yes] → Yes
? Which scope? [Votre compte] → Sélectionnez votre compte
? Link to existing project? [No] → No (ou Yes si déjà créé)
? What's your project's name? smart-business-card
? In which directory is your code? ./
? Want to modify these settings? [No] → No
```

---

## Configuration CORS sur le Backend

Pour que le frontend Vercel puisse communiquer avec votre backend, configurez CORS:

```typescript
// backend/src/middlewares/cors.middleware.ts
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app', // URL de votre frontend Vercel
  ],
  credentials: true,
}));
```

---

## Mise à jour du déploiement

### Via Git (recommandé)

Poussez vos modifications sur Git:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Vercel déploiera automatiquement après chaque push sur la branche `main`.

### Via Vercel CLI

```bash
vercel --prod
```

---

## Structure des fichiers pour Vercel

```
frontend/
├── .env.example          # Variables d'environnement (exemple)
├── .vercelignore         # Fichiers à exclure du déploiement
├── vercel.json          # Configuration Vercel
├── vite.config.ts       # Configuration Vite
├── dist/                # Build de production (généré)
└── src/
    └── services/
        └── api.ts       # Configuration API
```

---

## Dépannage

### Erreur 404 sur les routes

Assurez-vous que `vercel.json` est configuré avec les rewrites:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Problèmes de variables d'environnement

1. Vérifiez que `VITE_` est préfixé pour les variables Vite
2. Redéployez après ajout de nouvelles variables
3. Utilisez `vercel env pull` pour télécharger les variables en local

### Erreur de build

```bash
cd frontend
npm install
npm run build
```

Vérifiez que le build local fonctionne avant de déployer sur Vercel.

---

## URLs attendues

- **Frontend (Vercel)**: `https://smart-business-card.vercel.app`
- **Backend (Render)**: `https://visit-backend-2.onrender.com`
- **API Base URL**: `https://visit-backend-2.onrender.com/api/v1`

---

## Prochaines étapes

1. Configurer un domaine personnalisé sur Vercel (optionnel)
2. Activer HTTPS (automatique sur Vercel)
3. Configurer les headers de sécurité
4. Mettre en place le monitoring avec Vercel Analytics

