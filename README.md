# TalentHub - Job Portal

Plateforme moderne de recherche d'emploi permettant aux candidats de trouver leur job idéal et aux employeurs de publier leurs offres.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20.12+
- npm ou yarn

### Installation

1. **Cloner le projet et installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Puis générez un secret pour NextAuth :
   ```bash
   openssl rand -base64 32
   ```
   Remplacez `your-secret-key-change-this-in-production` dans `.env`

3. **Initialiser la base de données**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   
   Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
talent/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── auth/            # NextAuth endpoints
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Page d'accueil
├── components/              # Composants React
│   ├── home/               # Composants page d'accueil
│   ├── jobs/               # Composants liés aux jobs
│   ├── layout/             # Navigation, Footer
│   ├── providers/          # Context providers
│   └── ui/                 # Composants UI réutilisables
├── lib/                     # Utilitaires
│   ├── auth.ts             # Configuration NextAuth
│   ├── prisma.ts           # Client Prisma
│   └── utils.ts            # Fonctions utilitaires
├── prisma/                  # Configuration Prisma
│   ├── schema.prisma       # Schéma de la base de données
│   └── migrations/         # Migrations
├── types/                   # Définitions TypeScript
└── src/                     # Fichiers brouillons (à supprimer)
```

## 🗄️ Base de Données

### Schéma

Le projet utilise Prisma ORM avec SQLite pour le développement. Le schéma comprend :

- **User** : Utilisateurs (candidats et employeurs)
- **Company** : Entreprises
- **Job** : Offres d'emploi
- **Application** : Candidatures
- **SavedJob** : Jobs sauvegardés

### Scripts Prisma

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer et appliquer une migration
npm run prisma:migrate

# Ouvrir Prisma Studio
npm run prisma:studio
```

## 🎨 Technologies Utilisées

- **Framework** : Next.js 16 (App Router)
- **Base de données** : Prisma + SQLite
- **Authentification** : NextAuth.js
- **Styling** : Tailwind CSS
- **UI Components** : Shadcn/ui (custom)
- **Icons** : Lucide React
- **Language** : TypeScript

## 📝 Scripts Disponibles

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Build pour la production
npm run start        # Démarrer le serveur de production
npm run lint         # Vérifier le code avec ESLint

# Scripts Prisma
npm run prisma:generate  # Générer le client Prisma
npm run prisma:migrate   # Appliquer les migrations
npm run prisma:studio    # Ouvrir l'interface de gestion
```

## 🔐 Authentification

Le projet est configuré avec NextAuth.js pour gérer l'authentification. Actuellement configuré pour :

- **Credentials Provider** : Connexion avec email/mot de passe
- **Session Strategy** : JWT

### Pages d'authentification à créer

- `/auth/signin` : Page de connexion
- `/auth/signup` : Page d'inscription

## 🎯 Fonctionnalités

### ✅ Implémentées

- Page d'accueil avec :
  - Hero section avec barre de recherche
  - Catégories d'emploi
  - Jobs en vedette (depuis la base de données)
  - Statistiques en temps réel
- Navigation responsive
- Layout avec header et footer
- Schéma de base de données complet
- Configuration NextAuth

### 🚧 À Implémenter

- Pages d'authentification (signin/signup)
- Page de liste des jobs avec filtres
- Page de détail d'un job
- Système de candidature
- Dashboard candidat
- Dashboard employeur
- Page de profil utilisateur
- Upload de CV
- Gestion des entreprises

## 👥 Rôles

Le système distingue deux types d'utilisateurs :

1. **CANDIDATE** (Candidat)
   - Rechercher des jobs
   - Postuler aux offres
   - Sauvegarder des jobs
   - Gérer son profil et CV

2. **EMPLOYER** (Employeur)
   - Créer une entreprise
   - Publier des offres d'emploi
   - Gérer les candidatures reçues
   - Consulter les statistiques

## 🛠️ Développement

### Ajouter des Données de Test

1. Ouvrir Prisma Studio :
   ```bash
   npm run prisma:studio
   ```

2. Créer des enregistrements :
   - Un utilisateur employeur
   - Une entreprise liée à cet employeur
   - Des offres d'emploi liées à l'entreprise

3. Recharger la page d'accueil pour voir les jobs s'afficher

### Variables d'Environnement

```env
# Base de données
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere"
```

## 📚 Documentation

Pour plus d'informations, consultez :

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contribution

Ce projet est en développement actif. Les contributions sont les bienvenues !

## 📄 Licence

[À définir]
