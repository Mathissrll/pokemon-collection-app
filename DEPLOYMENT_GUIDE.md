# 🚀 Guide de Déploiement - Pokémon Collection Manager

## 🌐 Options de Déploiement

### 1. **Vercel (Recommandé)**
- **URL** : `votre-app.vercel.app` ou domaine personnalisé
- **Gratuit** : Plan gratuit généreux
- **Avantages** : Optimisé pour Next.js, déploiement automatique
- **Temps** : 5 minutes

### 2. **Netlify**
- **URL** : `votre-app.netlify.app`
- **Gratuit** : Plan gratuit disponible
- **Avantages** : Interface simple, CDN global

### 3. **Railway**
- **URL** : `votre-app.railway.app`
- **Payant** : À partir de 5$/mois
- **Avantages** : Base de données incluse

## 🚀 Déploiement sur Vercel (Étape par Étape)

### Étape 1 : Préparer votre projet

```bash
# Vérifier que tout fonctionne localement
npm run build
npm run dev
```

### Étape 2 : Créer un repository GitHub

1. Allez sur [github.com](https://github.com)
2. Créez un nouveau repository
3. Nommez-le `pokemon-collection-app`
4. Uploadez votre code :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/votre-username/pokemon-collection-app.git
git push -u origin main
```

### Étape 3 : Déployer sur Vercel

1. **Créer un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Sign Up"
   - Connectez-vous avec GitHub

2. **Importer votre projet**
   - Cliquez sur "New Project"
   - Sélectionnez votre repository `pokemon-collection-app`
   - Vercel détecte automatiquement Next.js

3. **Configuration**
   - **Framework Preset** : Next.js (automatique)
   - **Root Directory** : `./` (par défaut)
   - **Build Command** : `npm run build` (automatique)
   - **Output Directory** : `.next` (automatique)

4. **Variables d'environnement** (optionnel pour commencer)
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

5. **Déployer**
   - Cliquez sur "Deploy"
   - Attendez 2-3 minutes
   - Votre app est en ligne !

### Étape 4 : Votre URL

Votre app sera disponible à :
- **URL automatique** : `https://pokemon-collection-app-xxx.vercel.app`
- **URL personnalisée** : `https://pokemon-collection-app.vercel.app`

## 📱 Configuration PWA (Application Mobile)

### Fonctionnalités PWA activées :
- ✅ **Installation** : Les utilisateurs peuvent installer l'app sur leur téléphone
- ✅ **Mode hors ligne** : Fonctionne sans connexion (données locales)
- ✅ **Icône d'app** : Icône personnalisée sur l'écran d'accueil
- ✅ **Splash screen** : Écran de chargement personnalisé
- ✅ **Navigation native** : Interface comme une vraie app

### Comment installer sur mobile :
1. **iOS (Safari)** :
   - Ouvrez l'app dans Safari
   - Cliquez sur "Partager" (icône carrée avec flèche)
   - Sélectionnez "Sur l'écran d'accueil"

2. **Android (Chrome)** :
   - Ouvrez l'app dans Chrome
   - Cliquez sur le menu (3 points)
   - Sélectionnez "Ajouter à l'écran d'accueil"

## 🔧 Configuration Avancée

### Domaine personnalisé
1. Dans Vercel Dashboard, allez dans "Settings" > "Domains"
2. Ajoutez votre domaine (ex: `pokemon-collection.com`)
3. Configurez les DNS selon les instructions Vercel

### Variables d'environnement
Dans Vercel Dashboard > Settings > Environment Variables :
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Déploiement automatique
- Chaque push sur `main` déclenche un nouveau déploiement
- Les branches créent des previews automatiques
- Rollback possible en un clic

## 📊 Monitoring et Analytics

### Vercel Analytics (Gratuit)
- **Visiteurs** : Nombre de visiteurs uniques
- **Pages vues** : Pages les plus visitées
- **Performance** : Temps de chargement
- **Erreurs** : Erreurs en production

### Google Analytics
1. Créez un compte [Google Analytics](https://analytics.google.com)
2. Ajoutez votre ID de tracking dans les variables d'environnement
3. Configurez les événements de conversion (abonnements Premium)

## 🔒 Sécurité

### HTTPS automatique
- Vercel fournit SSL gratuit
- Redirection automatique HTTP → HTTPS
- Certificats renouvelés automatiquement

### Headers de sécurité
- Protection XSS
- Protection clickjacking
- Headers de sécurité configurés

## 💰 Coûts

### Vercel (Gratuit)
- **Bandwidth** : 100GB/mois
- **Build minutes** : 6000/mois
- **Serverless functions** : 100GB-Hrs/mois
- **Domains** : Illimités

### Si vous dépassez (Payant)
- **Pro** : 20$/mois
- **Enterprise** : Sur mesure

## 🚨 Dépannage

### Erreurs courantes

#### Build échoue
```bash
# Vérifiez localement
npm run build
```

#### Variables d'environnement manquantes
- Vérifiez dans Vercel Dashboard > Settings > Environment Variables

#### Images ne se chargent pas
- Vérifiez les domaines dans `next.config.mjs`

### Support
- **Vercel Support** : [vercel.com/support](https://vercel.com/support)
- **Documentation** : [vercel.com/docs](https://vercel.com/docs)

## 🎯 Prochaines Étapes

1. **Déployer** sur Vercel (5 minutes)
2. **Tester** l'app en production
3. **Configurer** les variables d'environnement
4. **Ajouter** Google Analytics
5. **Configurer** un domaine personnalisé
6. **Monitorer** les performances

## 📱 Test sur Mobile

Après déploiement :
1. Ouvrez l'URL sur votre téléphone
2. Testez l'installation PWA
3. Vérifiez que tout fonctionne
4. Testez les paiements (mode test)

---

**Votre app sera en ligne en moins de 10 minutes !** 🚀 