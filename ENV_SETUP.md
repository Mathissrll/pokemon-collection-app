# Guide de Configuration des Variables d'Environnement

## 📋 Prérequis

Avant de configurer les variables d'environnement, assurez-vous d'avoir :
- Un compte Stripe (pour les paiements)
- Un compte Google Cloud (pour les images)
- Une application Next.js fonctionnelle

## 🚀 Configuration Rapide

### 1. Créer le fichier .env.local

```bash
# Copier le fichier d'exemple
cp env.local.example .env.local
```

### 2. Configurer Stripe

#### Obtenir les clés Stripe :
1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com/)
2. Allez dans **Developers > API keys**
3. Copiez les clés suivantes :

```env
# Clé publique (commence par pk_test_ ou pk_live_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique

# Clé secrète (commence par sk_test_ ou sk_live_)
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete

# Webhook secret (à configurer plus tard)
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
```

#### Configurer les webhooks Stripe :
1. Dans Stripe Dashboard, allez dans **Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/payments/webhook`
4. Événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 3. Configurer Google Custom Search

#### Créer un projet Google Cloud :
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API **Custom Search API**

#### Obtenir la clé API :
1. Allez dans **APIs & Services > Credentials**
2. Cliquez sur **Create Credentials > API Key**
3. Copiez la clé :

```env
NEXT_PUBLIC_GOOGLE_API_KEY=votre_cle_api_google
```

#### Créer un moteur de recherche personnalisé :
1. Allez sur [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Cliquez sur **Create a search engine**
3. Configurez pour rechercher sur tout le web
4. Copiez l'ID du moteur de recherche :

```env
NEXT_PUBLIC_GOOGLE_CSE_ID=votre_id_moteur_recherche
```

### 4. Configuration de l'Authentification

```env
# Email de l'administrateur principal
NEXT_PUBLIC_ADMIN_EMAIL=zzetchh@gmail.com

# Secret pour les sessions (générer une chaîne aléatoire)
NEXTAUTH_SECRET=votre_secret_nextauth_ici

# URL de base de l'application
NEXTAUTH_URL=http://localhost:3000
```

### 5. Générer les secrets

#### Secret NextAuth :
```bash
# Générer un secret aléatoire
openssl rand -base64 32
```

#### Clé de chiffrement :
```bash
# Générer une clé de chiffrement
openssl rand -base64 32
```

## 🔧 Configuration Avancée

### Variables Optionnelles

#### Analytics (Google Analytics) :
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Base de données (pour futur développement) :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pokemon_db
```

#### Email de support :
```env
NEXT_PUBLIC_SUPPORT_EMAIL=support@votreapp.com
```

### Configuration pour la Production

Lors du déploiement, modifiez ces variables :

```env
# Mode production
NODE_ENV=production

# URL de production
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
NEXTAUTH_URL=https://votre-app.vercel.app

# Clés Stripe de production (pas de test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_production
STRIPE_SECRET_KEY=sk_live_votre_cle_production
```

## 🛡️ Sécurité

### Variables Sensibles

⚠️ **NE JAMAIS COMMITER** ces variables dans Git :
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`

### Variables Publiques

✅ Ces variables peuvent être exposées côté client :
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_GOOGLE_API_KEY`
- `NEXT_PUBLIC_GOOGLE_CSE_ID`
- `NEXT_PUBLIC_ADMIN_EMAIL`

## 🔍 Vérification

### Tester la configuration :

1. **Stripe** :
```bash
npm run dev
# Aller sur la page de paiement et tester avec une carte de test
```

2. **Google Images** :
```bash
# Tester la recherche d'images dans l'app
```

3. **Authentification** :
```bash
# Tester la connexion avec l'email admin
```

## 🚨 Dépannage

### Erreurs courantes :

1. **"Invalid API key"** :
   - Vérifiez que la clé Google API est correcte
   - Assurez-vous que l'API Custom Search est activée

2. **"Stripe error"** :
   - Vérifiez les clés Stripe
   - Assurez-vous d'utiliser les bonnes clés (test vs production)

3. **"Environment variable not found"** :
   - Vérifiez que le fichier `.env.local` existe
   - Redémarrez le serveur de développement

### Commandes utiles :

```bash
# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Redémarrer le serveur
npm run dev

# Nettoyer le cache
rm -rf .next
npm run dev
```

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Google Custom Search API](https://developers.google.com/custom-search)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables) 