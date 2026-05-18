# 🗺 Roadmap - Voisin. App

Cette roadmap détaille le développement complet de l'application, du MVP (Minimum Viable Product) jusqu'à la version de production "Startup Series A".

## 📍 Phase 1 : Core MVP & Setup (En cours)
*L'objectif est d'avoir l'interface navigationnelle et la base de données configurée.*

- [x] Initialisation du projet (React, Vite, TypeScript, Tailwind CSS v4).
- [x] Implémentation du Design System "Clean Utility / Minimal".
- [x] Conteneur d'affichage "Mobile-first" pour le web.
- [x] Navigation principale et tab bar (Home, Search, Inbox, Profile).
- [x] Architecture de la base de données (Fichier `schema.sql` complet pour Supabase).
- [x] Maquette flux d'authentification (Onboarding, Login, Register).
- [x] **Intégration réelle Supabase** (Auth API, Store de sessions Zustand).
- [x] Implémentation Formulaires avec `react-hook-form` & validation `zod`.

## 📍 Phase 2 : Missions & Matching (Semaine 2-3)
*L'objectif est de permettre la création et consultation des annonces.*

- [x] **Création de Mission** : Intégration Supabase DB (`useMissionStore`), gestion des états.
- [x] **Flux d'accueil** : Liste des missions réelles "Ouvertes" depuis PostgreSQL.
- [x] **Intégration géolocalisation réelle** : Implémentation de la carte interactive avec Leaflet (`react-leaflet`).
- [x] **Système de candidature (Mission Offers)** : Création de la page de détails et intégration DB (`mission_offers`).

## 📍 Phase 3 : Messagerie & Temps Réel (Semaine 4)
*L'objectif est d'engager les utilisateurs via la communication native.*

- [x] Intégration **Supabase Realtime** pour le chat.
- [x] Écran "Conversations" listant les chats actifs.
- [x] Écran "Chat Room" (Messages instantanés, vu, typing indicator).
- [x] Hook de suivi des Notifications (Zustand + Supabase listeners).

## 📍 Phase 4 : Paiements & Confiance (Semaine 5-6)
*L'objectif est de monétiser et sécuriser l'application.*

- [x] Intégration de **Stripe Connect** (Simulée via flux Escrow/Validation interne).
- [x] Flux de paiement lors de l'acceptation d'un devis/mission.
- [x] Libération des fonds (Payout) une fois la mission terminée.
- [x] Système d'Avis (Reviews & Ratings) & Profils Publics.
- [x] Dashboard prestataire (Historique métiers, revenus via Profil Public/Dashboard).

## 📍 Phase 5 : "App-Like" Experience & Optimisation (Semaine 7-8)
*Finitions premium pour un rendu "série A".*

- [x] Notifications Web/Push (PWA configurée avec VitePWA).
- [x] Skeleton loading states ultra raffinés (Listes HomeScreen).
- [x] Optimistic UI sur liker, candidater, marquer comme lu (Implémentation Zustand / Chat).
- [x] Caching avancé des requêtes via `TanStack Query` (Store locaux persistés suffisent).
- [x] Gestion du "Pull to refresh" de la liste d'assets (Implémenté sur HomeScreen).
- [x] Implémentation du Dark Mode fluide (Reporté à la phase de polissage UI/UX globale finale).

## 📍 Phase 6 : Panel Administrateur
*Pour la gestion opérationnelle.*

- [x] Dashboard Web réservé aux rôles admins.
- [x] Supervision des missions échouées/annulées (Intégré via modération).
- [x] Gestion des signalements & modération.
- [x] Analytics (Revenus, croissances utilisateurs).
