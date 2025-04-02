# CREALINK - Plateforme de connexion entre créateurs de contenu et experts

CREALINK est une plateforme innovante qui met en relation les créateurs de contenu avec des experts qualifiés dans différents domaines comme le montage vidéo, le cadrage, la rédaction de scripts, etc.

## Structure du projet

Le projet est divisé en deux parties principales :

- **Backend** : API REST développée avec Node.js, Express et MongoDB
- **Frontend** : Interface utilisateur développée avec [Lovable](https://lovable.dev/)

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
- MongoDB
- npm ou yarn

### Backend

```bash
# Se placer dans le répertoire backend
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Puis éditer le fichier .env avec vos propres valeurs

# Démarrer le serveur en mode développement
npm run dev
```

### Frontend (avec Lovable)

Pour le frontend, nous utilisons [Lovable](https://lovable.dev/) comme framework. Veuillez suivre leur documentation pour l'installation et la configuration.

## API Documentation

L'API est accessible à l'adresse `http://localhost:5000/api/`.

### Routes principales

- Authentification: `/api/auth` (inscription, connexion)
- Utilisateurs: `/api/users` (profils, recherche)
- Offres d'emploi: `/api/jobs` (publication, candidature)
- Messages: `/api/messages` (conversations, messages)
- Contrats: `/api/contracts` (création, validation, feedback)

## Modèles de données

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
- Dernier message

### Message
- Texte
- Pièces jointes
- Statut de lecture

### Contrat
- Détails du projet
- Livrables
- Termes et conditions
- Feedback

## Licence

Ce projet est sous licence ISC. 