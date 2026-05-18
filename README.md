# Voisin. - Marketplace Mobile de Services de Proximité

**Voisin.** est une application mobile-first (Web/PWA) de mise en relation entre voisins pour des petits services du quotidien (bricolage, jardinage, dépannage informatique, etc.). Conçue pour offrir une expérience "Premium" et fluide inspirée des standards actuels (Uber, Airbnb).

## 🚀 Fonctionnalités Principales

- **Authentification & Profils** : Inscription, connexion, profils détaillés avec avis et compétences.
- **Missions** : Création de missions (détails, photos, budget), navigation et recherche par liste et carte.
- **Géolocalisation** : Carte interactive affichant les missions à proximité (React Native Maps / Leaflet).
- **Messagerie Temps Réel** : Chat entre voisins pour coordonner les missions.
- **Paiement Sécurisé** : (À venir via Stripe Connect) Système d'escrow et libération des fonds.

## 🛠 Stack Technique

- **Frontend** : React 19, TypeScript, Vite
- **Styling** : Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icônes)
- **State Management** : Zustand (Global state), TanStack Query (Data fetching)
- **Backend & Database** : Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **UI/UX** : Design minimaliste "Clean Utility" (Glassmorphism, animations fluides)

## 📁 Architecture du Projet

```text
/
├── src/
│   ├── components/      # Composants UI partagés et Layout (MobileContainer, Tabs)
│   ├── lib/             # Configurations et utilitaires externes (Supabase, utils)
│   ├── screens/         # Écrans de l'application mobile (Home, Search, Profile, etc.)
│   ├── store/           # Stores globaux Zustand (useAuth)
│   ├── App.tsx          # Point d'entrée de l'application et pur routing
│   ├── index.css        # Styles globaux (Tailwind)
│   └── main.tsx         # Entrée React
├── supabase/
│   └── schema.sql       # Structure complète de la BDD PostgreSQL avec RLS policies
├── README.md
└── ROADMAP.md
```

## ⚙️ Configuration & Installation

1. **Pré-requis :** Node.js >= 18
2. **Variables d'environnement :**
   Créez un fichier `.env` basé sur `.env.example` en renseignant les clés Supabase de votre projet.
   ```env
   VITE_SUPABASE_URL="votre_url_supabase"
   VITE_SUPABASE_ANON_KEY="votre_cle_anonyme"
   ```
3. **Installation :**
   ```bash
   npm install
   ```
4. **Lancement en développement :**
   ```bash
   npm run dev
   ```

## 🔒 Base de Données & RLS

Le fichier `supabase/schema.sql` contient les tables pour les profils, les missions, les messages, etc. Il configure également les règles de sécurité au niveau des lignes (RLS) pour garantir que seules les personnes autorisées puissent lire ou écrire des données.
