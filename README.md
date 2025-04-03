# CREALINK - Plateforme de connexion entre créateurs de contenu et experts

CREALINK est une plateforme innovante qui met en relation les créateurs de contenu avec des experts qualifiés dans différents domaines comme le montage vidéo, le cadrage, la rédaction de scripts, etc.

## Structure du projet

Le projet est divisé en deux parties principales :

- **Backend** : API REST développée avec Node.js, Express et Firebase
- **Frontend** : Interface utilisateur développée avec React, Vite, TypeScript et Tailwind CSS

## Configuration Firebase

Le projet utilise Firebase pour l'authentification, le stockage de données et la gestion de base de données. Pour configurer Firebase :

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez l'authentification par email/mot de passe
3. Créez une base de données Firestore
4. Configurez les règles de sécurité pour Firestore
5. Activez le stockage Firebase
6. Pour le frontend, créez un fichier `.env` dans le dossier frontend avec les variables suivantes :

```
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
VITE_API_URL=http://localhost:3000
```

7. Pour le backend, téléchargez le fichier de clé privée `serviceAccountKey.json` depuis les paramètres du projet Firebase (Project Settings > Service Accounts) et placez-le à la racine du dossier backend

8. Créez un fichier `firestore.rules` dans le dossier backend pour définir les règles de sécurité de votre base de données

## Fonctionnalités principales

### Inscription et profils utilisateurs
- Inscription en tant que créateur de contenu ou expert
- Profils personnalisés selon le type d'utilisateur
- Ajout de portfolio, compétences, tarifs, etc.

### Offres d'emploi
- Les créateurs peuvent publier des offres pour trouver des experts
- Les experts peuvent publier leurs services
- Système de candidature et d'acceptation

### Messagerie intégrée
- Communication directe entre créateurs et experts
- Notification de nouveaux messages
- Historique des conversations

### Contrats et paiements
- Création de contrats formels
- Suivi des livrables
- Système d'évaluation post-projet

## Installation et démarrage

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn
- Compte Firebase avec projet configuré

### Backend

```bash
# Se placer dans le répertoire backend
cd backend

# Installer les dépendances
npm install

# Configurer Firebase
# 1. Placer le fichier serviceAccountKey.json à la racine du dossier backend
# 2. Configurer les règles Firestore dans firestore.rules

# Démarrer le serveur en mode développement
npm run dev
```

### Frontend

```bash
# Se placer dans le répertoire frontend
cd frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement Firebase
# Créer un fichier .env avec les variables Firebase (voir section Configuration Firebase)

# Démarrer le serveur en mode développement
npm run dev
```

### Notes pour Windows (PowerShell)

Dans PowerShell, n'utilisez pas l'opérateur `&&` pour chaîner les commandes. Utilisez plutôt le point-virgule `;` ou exécutez les commandes séparément :

```powershell
# Mauvaise pratique dans PowerShell
cd frontend && npm run dev  # Ne fonctionnera pas

# Bonnes pratiques dans PowerShell
cd frontend; npm run dev    # Utiliser le point-virgule
# Ou exécuter les commandes séparément
cd frontend
npm run dev
```

## API Documentation

L'API est accessible à l'adresse `http://localhost:3000/api/`.

### Authentification

L'authentification est gérée via Firebase Authentication. Le backend s'intègre avec Firebase pour vérifier les jetons d'authentification.

### Routes principales

- Authentification: `/api/auth` (vérification de token)
- Utilisateurs: `/api/users` (profils, recherche)
- Offres d'emploi: `/api/jobs` (publication, candidature)
- Messages: `/api/messages` (conversations)
- Contrats: `/api/contracts` (création, validation)

### Accès aux données Firestore

La plupart des opérations CRUD sont effectuées directement depuis le frontend via le SDK Firebase pour Web, avec des règles de sécurité Firestore définies dans le fichier `backend/firestore.rules`.

## Modèles de données

Les données sont stockées dans Firebase Firestore avec la structure suivante :

### Utilisateur
- Informations générales (nom, email, etc.)
- Informations spécifiques selon le rôle (créateur ou expert)
- Compétences, portfolio, tarifs

### Offre d'emploi
- Titre, description, budget
- Catégorie, compétences requises
- Candidatures

### Conversation
- Participants
- Lien avec une offre d'emploi
- Messages

### Contrat
- Détails du projet
- Livrables
- Termes et conditions
- Feedback

## Licence

Ce projet est sous licence ISC. 