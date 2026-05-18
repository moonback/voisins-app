# Voisin. - Marketplace Mobile de Services de Proximité

**Voisin.** est une application mobile-first (Web/PWA) de mise en relation entre voisins pour des petits services du quotidien (bricolage, jardinage, dépannage informatique, etc.). Conçue pour offrir une expérience "Premium" et fluide inspirée des standards actuels (Uber, Airbnb).

##  Fonctionnalités Principales

### Authentification & Profils
- Inscription et connexion via Supabase Auth (email/password)
- Profils utilisateurs détaillés avec avatar, bio, compétences et note moyenne
- Système de rôles (client, prestataire, ou les deux)
- Profils publics consultables par tous les utilisateurs

### Système de Missions
- Création de missions avec titre, description, catégorie, budget et date
- Upload d'images pour les missions
- Statuts de mission : draft, open, assigned, completed, cancelled
- Candidatures (mission_offers) avec prix proposé et message
- Affectation d'un prestataire à une mission

### Géolocalisation & Carte
- Carte interactive Leaflet affichant les missions à proximité
- Géolocalisation utilisateur (latitude/longitude)
- Filtrage des missions par distance

### Messagerie Temps Réel
- Chat en temps réel via Supabase Realtime
- Conversations liées aux missions
- Indicateur de message "vu"
- Liste des conversations actives

### Système d'Avis & Notations
- Étoiles (1-5) et commentaires après mission terminée
- Moyenne des notes et compteur d'avis sur les profils
- Compteur de missions complétées

### Panel Administrateur
- Dashboard avec KPIs (utilisateurs, missions, revenus 10%)
- Modération des missions (suppression)
- Vue d'ensemble de l'activité de la plateforme

##  Stack Technique

- **Frontend** : React 19, TypeScript, Vite
- **Styling** : Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icônes)
- **State Management** : Zustand (Global state)
- **Data Fetching** : TanStack Query v5
- **Forms** : React Hook Form + Zod validation
- **Backend & Database** : Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Maps** : Leaflet + React Leaflet
- **AI** : Google GenAI (intégré pour futures fonctionnalités IA)
- **UI/UX** : Design minimaliste "Clean Utility" (Glassmorphism, animations fluides)
- **PWA** : Vite PWA Plugin (configuré)

##  Architecture du Projet

```
voisins-app/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── BottomTabs.tsx       # Navigation tabs (Home, Search, Inbox, Profile)
│   │       └── MobileContainer.tsx  # Container mobile-first avec Safe Area
│   ├── lib/
│   │   ├── supabase.ts              # Client Supabase
│   │   ├── utils.ts                 # Utilitaires (cn, formatage)
│   │   └── validations.ts           # Schémas Zod
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Écran principal (liste missions, catégories)
│   │   ├── SearchScreen.tsx         # Recherche de missions
│   │   ├── InboxScreen.tsx          # Liste des conversations
│   │   ├── ChatScreen.tsx           # Salon de chat temps réel
│   │   ├── ProfileScreen.tsx        # Profil utilisateur connecté
│   │   ├── PublicProfileScreen.tsx  # Profil public d'un autre utilisateur
│   │   ├── CreateMissionScreen.tsx  # Formulaire création mission
│   │   ├── MissionDetailScreen.tsx  # Détails mission + offres + reviews
│   │   ├── NearbyMapScreen.tsx      # Carte Leaflet des missions
│   │   ├── OnboardingScreen.tsx     # Écran d'accueil non-connecté
│   │   ├── LoginScreen.tsx          # Connexion
│   │   ├── RegisterScreen.tsx        # Inscription
│   │   └── AdminDashboardScreen.tsx # Dashboard admin
│   ├── store/
│   │   ├── useAuth.ts               # Store auth (user, session)
│   │   ├── useMissionStore.ts       # Store missions (CRUD)
│   │   ├── useChatStore.ts          # Store chat (messages, conversations)
│   │   └── useNotificationStore.ts  # Store notifications
│   ├── App.tsx                      # Routing et layout principal
│   ├── index.css                    # Styles globaux (Tailwind v4)
│   └── main.tsx                     # Point d'entrée
├── supabase/
│   ├── schema.sql                   # Schéma BDD complet + RLS
│   └── fix-1.sql                    # Corrections/migrations
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

##  Modèle de Données (Schema BDD)

### Tables Principales

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (nom, avatar, bio, skills, note, géolocalisation) |
| `missions` | Annonces de services (titre, desc, catégorie, budget, statut, localisation) |
| `mission_offers` | Candidatures des prestataires (prix proposé, message, statut) |
| `conversations` | Conversations entre utilisateurs |
| `messages` | Messages temps réel |
| `reviews` | Avis et notes |
| `notifications` | Notifications push/email |

### Sécurité (RLS)

Toutes les tables ont le Row Level Security activé avec des politiques :
- Profils : lecture publique, modification par soi-même
- Missions : lecture publique des missions ouvertes, modification par participants
- Messages : lecture/écriture uniquement par les participants de la conversation

##  Configuration & Installation

1. **Pré-requis** : Node.js >= 18
2. **Variables d'environnement** :
   Créez un fichier `.env` basé sur `.env.example` :
   ```env
   VITE_SUPABASE_URL="votre_url_supabase"
   VITE_SUPABASE_ANON_KEY="votre_cle_anonyme"
   ```
3. **Installation** :
   ```bash
   npm install
   ```
4. **Lancement** :
   ```bash
   npm run dev
   ```
5. **Build production** :
   ```bash
   npm run build
   ```

##  Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lancement serveur développement (port 3000) |
| `npm run build` | Build production |
| `npm run preview` | Prévisualisation build |
| `npm run lint` | Vérification TypeScript |
| `npm run clean` | Nettoyage dossier dist |

##  Écrans de l'Application

1. **Onboarding** - Écran d'accueil avec CTA inscription/connexion
2. **Login/Register** - Formulaires d'authentification
3. **Home** - Liste des missions ouvertes, catégories, pull-to-refresh
4. **Search** - Recherche avec filtres par catégorie
5. **Mission Detail** - Détails, candidature, chat avec client
6. **Create Mission** - Formulaire création de mission
7. **Nearby Map** - Carte Leaflet des missions
8. **Inbox** - Liste des conversations
9. **Chat** - Messages temps réel
10. **Profile** - Profil utilisateur connecté (édition)
11. **Public Profile** - Profil d'un autre utilisateur + reviews
12. **Admin Dashboard** - KPIs et modération

##  Fonctionnalités Premium Implémentées

- Animations fluides avec Framer Motion (transitions, variants)
- Pull-to-refresh sur les listes
- Skeleton loading states
- Optimistic UI updates
- Dark mode ready (structure CSS disponible)
- PWA ready avec service worker
- Design glassmorphism subtil
- Micro-interactions (scale, opacity)
- Safe areas pour mobile

##  Prochaines Étapes (Voir Roadmap)

- Intégration Stripe Connect réelle
- Notifications push PWA
- Matching IA avec Google GenAI
- Application React Native
- Système de vérification utilisateur
- Résolution de litiges
