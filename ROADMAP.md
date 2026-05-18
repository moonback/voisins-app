#  Roadmap - Voisin. App

Cette roadmap détaille le développement complet de l'application, du MVP (Minimum Viable Product) jusqu'à la version de production "Startup Series A".

##  Phase 1 : Core MVP & Setup
*L'objectif est d'avoir l'interface navigationnelle et la base de données configurée.*

- [x] Initialisation du projet (React, Vite, TypeScript, Tailwind CSS v4).
- [x] Implémentation du Design System "Clean Utility / Minimal".
- [x] Conteneur d'affichage "Mobile-first" pour le web.
- [x] Navigation principale et tab bar (Home, Search, Inbox, Profile).
- [x] Architecture de la base de données (Fichier `schema.sql` complet pour Supabase).
- [x] Maquette flux d'authentification (Onboarding, Login, Register).
- [x] **Intégration réelle Supabase** (Auth API, Store de sessions Zustand).
- [x] Implémentation Formulaires avec `react-hook-form` & validation `zod`.

##  Phase 2 : Missions & Matching
*L'objectif est de permettre la création et consultation des annonces.*

- [x] **Création de Mission** : Intégration Supabase DB (`useMissionStore`), gestion des états.
- [x] **Flux d'accueil** : Liste des missions réelles "Ouvertes" depuis PostgreSQL.
- [x] **Intégration géolocalisation réelle** : Implémentation de la carte interactive avec Leaflet (`react-leaflet`).
- [x] **Système de candidature (Mission Offers)** : Création de la page de détails et intégration DB (`mission_offers`).

##  Phase 3 : Messagerie & Temps Réel
*L'objectif est d'engager les utilisateurs via la communication native.*

- [x] Intégration **Supabase Realtime** pour le chat.
- [x] Écran "Conversations" listant les chats actifs.
- [x] Écran "Chat Room" (Messages instantanés, vu, typing indicator).
- [x] Hook de suivi des Notifications (Zustand + Supabase listeners).

##  Phase 4 : Paiements & Confiance
*L'objectif est de monétiser et sécuriser l'application.*

- [x] Intégration de **Stripe Connect** (Simulée via flux Escrow/Validation interne).
- [x] Flux de paiement lors de l'acceptation d'un devis/mission.
- [x] Libération des fonds (Payout) une fois la mission terminée.
- [x] Système d'Avis (Reviews & Ratings) & Profils Publics.
- [x] Dashboard prestataire (Historique métiers, revenus via Profil Public/Dashboard).

##  Phase 5 : "App-Like" Experience & Optimisation
*Finitions premium pour un rendu "série A".*

- [x] Notifications Web/Push (PWA configurée avec VitePWA).
- [x] Skeleton loading states ultra raffinés (Listes HomeScreen).
- [x] Optimistic UI sur liker, candidater, marquer comme lu (Implémentation Zustand / Chat).
- [x] Caching avancé des requêtes via `TanStack Query` (Store locaux persistés suffisent).
- [x] Gestion du "Pull to refresh" de la liste d'assets (Implémenté sur HomeScreen).
- [x] Implémentation du Dark Mode fluide (Reporté à la phase de polissage UI/UX globale finale).

##  Phase 6 : Panel Administrateur
*Pour la gestion opérationnelle.*

- [x] Dashboard Web réservé aux rôles admins.
- [x] Supervision des missions échouées/annulées (Intégré via modération).
- [x] Gestion des signalements & modération.
- [x] Analytics (Revenus, croissances utilisateurs).

---

##  Phase 7 : Intelligence Artificielle & Matching Smart
*Améliorer l'expérience avec de l'IA.*

- [ ] **Matching IA** : Algorithme de recommandation basé sur localisation, skills, notes et historique.
- [ ] **Chatbot Assistant** : Bot pour aider les utilisateurs à créer des missions optimisées (Google GenAI).
- [ ] **Estimation Inteligente** : Suggestion de prix basé sur catégorie, localisation et marché (IA).
- [ ] **Détection de spam** : Modération automatique des missions suspectes.
- [ ] **Auto-tagging** : Catégorisation automatique des missions via IA.

##  Phase 8 : Paiements Réels & Monétisation
*Passer du mode simulé à Stripe Connect réel.*

- [ ] **Stripe Connect Onboarding** : Processus KYC pour les prestataires.
- [ ] **Escrow Intelligent** : Fond bloqué jusqu'à acceptation finale par le client.
- [ ] **Paiements Fractionnés** : Possibilité de payer en plusieurs fois.
- [ ] **Souscriptions Premium** : Plans mensuels avec commission réduite (0% vs 10%).
- [ ] **Codes Promo & Réductions** : Système de coupons pour acquisitions.
- [ ] **Facturation Automatique** : Génération de receipts/factures PDF.

##  Phase 9 : Vérification & Confiance
*Construire la confiance dans la communauté.*

- [ ] **Vérification Email/Téléphone** : Badge de vérification sur les profils.
- [ ] **Vérification Identité** : Intégration Jumio/Onfido pour pièce d'identité.
- [ ] **Vérification Compétences** : Badges sectoriels (électricien certifié, etc.).
- [ ] **Historique Vérifié** : Filtre "Utilisateurs vérifiés uniquement".
- [ ] **Assurance Mission** : Protection against damages (partenariat assureur).
- [ ] **Garantie Voisin.** : Protection des paiements en cas de litige.

##  Phase 10 : Notifications Push & Engagement
*Augmenter la rétention et l'engagement.*

- [ ] **Push Notifications Web** : Via Firebase Cloud Messaging ou Supabase.
- [ ] **Email Transactionnels** : Confirmation mission, rappels, digest hebdo.
- [ ] **In-App Notifications Center** : Centre de notifications complet.
- [ ] **Notifications de Proximité** : Alerte quand un prestataire est nearby.
- [ ] **Badges & Achievements** : Système de gamification (missions complétées, etc.).

##  Phase 11 : Mobile Natif (React Native)
*Passer à une vraie application mobile.*

- [ ] **Projet React Native** : Expo avec TypeScript.
- [ ] **Navigation Native** : React Navigation avec bottom tabs.
- [ ] **Caméra & Galerie** : Photo capture pour missions.
- [ ] **Push Notifications Natives** : Via Expo Notifications.
- [ ] **Background Location** : Suivi GPS en arrière-plan.
- [ ] **App Store / Play Store** : Déploiement sur les stores.

##  Phase 12 : Analytics Avancés & Growth
*Données et croissance.*

- [ ] **Dashboard Utilisateur** : Graphiques revenus, missions, stats personnelles.
- [ ] **Analytics Plateforme** : Funnel conversion, DAU/MAU, rétention.
- [ ] **A/B Testing** : Tests automatisés pour optimisations.
- [ ] **Heatmaps** : Comprendre le comportement utilisateur.
- [ ] **Deep Linking** : Liens profonds pour partages.
- [ ] **Referral Program** : Programme de parrainage avec rewards.

##  Phase 13 : Fonctionnalités Social & Communauté
*Transformer la plateforme en véritable communauté.*

- [ ] **Feed Activité** : Fil d'actualité des missions complétées dans le quartier.
- [ ] **Recommandations** : "Voisins recommandent" avec filtres.
- [ ] **Groupes de Quartier** : Communautés locales (Paris 11, etc.).
- [ ] **Événements** : Ateliers, meetups organisés par la communauté.
- [ ] **Blog/Conseils** : Contenu éditorial (guides bricolage, etc.).

##  Phase 14 : Support & Litiges
*Gestion opérationnelle matures.*

- [ ] **Help Center** : FAQ, guides, base de connaissances.
- [ ] **Chat Support** : Intégration Intercom/Crisp en temps réel.
- [ ] **Système de Litiges** : Interface de résolution de conflits.
- [ ] **Médiation IA** : Proposition de résolution automatique.
- [ ] **Remboursements** : Flux de remboursement complet.
- [ ] **Arbitrage** : Processus d'arbitrage humain transparent.

##  Phase 15 : Scale & Internationalisation
*Préparer la croissance internationale.*

- [ ] **i18n / l10n** : Multi-langues (EN, ES, DE, IT).
- [ ] **Multi-Devises** : Support EUR, USD, GBP, etc.
- [ ] **Adaptation Régionale** : Réglementations locales (RGPD, etc.).
- [ ] **CDN & Edge** : Déploiement global via Cloudflare/Vercel Edge.
- [ ] **Load Balancing** : Scalabilité horizontale Supabase.
- [ ] **Database Sharding** : Partitionnement géographique BDD.

---

##  Notes Techniques

### Dépendances Clés
- `@supabase/supabase-js` - Backend et Realtime
- `@google/genai` - Intelligence Artificielle
- `zustand` - State Management
- `@tanstack/react-query` - Data Fetching
- `framer-motion` - Animations
- `react-leaflet` - Cartographie

### Métriques de Succès (KPIs)
- Utilisateurs actifs mensuels (MAU)
- Taux de conversion mission créée → mission complétée
- Note moyenne de satisfaction
- Panier moyen par mission
- Délai moyen de résolution d'un litige
