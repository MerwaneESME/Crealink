# Guide de test de l'API CREALINK

Ce guide vous aidera à tester l'API CREALINK en utilisant Postman ou tout autre outil de test d'API.

## Prérequis

1. Assurez-vous que le serveur backend est démarré :
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Assurez-vous que MongoDB est installé et en cours d'exécution sur votre machine.

3. Importez la collection Postman fournie (`CREALINK_API_Tests.postman_collection.json`).

## Étapes de test

### 1. Vérifier que le serveur est en ligne

- Envoyez une requête GET à `http://localhost:5000/api`
- Vous devriez recevoir une réponse avec les endpoints disponibles.

### 2. Créer un compte créateur de contenu

- Envoyez une requête POST à `http://localhost:5000/api/auth/register`
- Utilisez le corps JSON suivant :
  ```json
  {
    "email": "creator@test.com",
    "password": "password123",
    "name": "Creator Test",
    "role": "creator",
    "channelInfo": {
      "name": "My Channel",
      "subscribers": 1000,
      "type": "lifestyle"
    }
  }
  ```
- Vous recevrez un token JWT que vous devrez conserver pour les requêtes ultérieures.

### 3. Créer un compte expert

- Envoyez une requête POST à `http://localhost:5000/api/auth/register`
- Utilisez le corps JSON suivant :
  ```json
  {
    "email": "expert@test.com",
    "password": "password123",
    "name": "Expert Test",
    "role": "expert",
    "expertise": {
      "categories": ["editing", "filming"],
      "yearsOfExperience": 5,
      "portfolioUrl": "http://example.com/portfolio"
    }
  }
  ```
- Conservez également ce token.

### 4. Se connecter (si nécessaire)

- Envoyez une requête POST à `http://localhost:5000/api/auth/login`
- Utilisez le corps JSON suivant :
  ```json
  {
    "email": "creator@test.com",
    "password": "password123"
  }
  ```

### 5. Créer une offre d'emploi

- Envoyez une requête POST à `http://localhost:5000/api/jobs`
- Ajoutez l'en-tête `Authorization: Bearer <votre_token_créateur>`
- Utilisez le corps JSON suivant :
  ```json
  {
    "title": "Montage de ma vidéo lifestyle",
    "description": "Je recherche un monteur pour ma vidéo de voyage à Paris. Durée: 15 minutes.",
    "jobType": "creator-post",
    "category": "editing",
    "budget": 200,
    "duration": "1 week",
    "location": "remote",
    "skills": ["Premiere Pro", "After Effects", "Color Grading"]
  }
  ```
- Notez l'ID de l'offre d'emploi retournée.

### 6. Consulter toutes les offres d'emploi

- Envoyez une requête GET à `http://localhost:5000/api/jobs`

### 7. Postuler à une offre d'emploi

- Envoyez une requête POST à `http://localhost:5000/api/jobs/<job_id>/apply`
- Ajoutez l'en-tête `Authorization: Bearer <votre_token_expert>`
- Utilisez le corps JSON suivant :
  ```json
  {
    "coverLetter": "Je suis très intéressé par cette offre et j'ai une grande expérience en montage vidéo.",
    "proposedBudget": 180
  }
  ```

### 8. Créer une conversation

- Envoyez une requête POST à `http://localhost:5000/api/messages/conversations`
- Ajoutez l'en-tête `Authorization: Bearer <votre_token_créateur>`
- Utilisez le corps JSON suivant :
  ```json
  {
    "jobId": "<job_id>",
    "receiverId": "<expert_id>"
  }
  ```

### 9. Envoyer un message

- Envoyez une requête POST à `http://localhost:5000/api/messages/conversations/<conversation_id>/messages`
- Ajoutez l'en-tête `Authorization: Bearer <votre_token>`
- Utilisez le corps JSON suivant :
  ```json
  {
    "text": "Bonjour, je suis intéressé par votre candidature. Pouvons-nous discuter des détails ?"
  }
  ```

## Variables Postman

Pour faciliter les tests, vous pouvez définir des variables Postman :

1. `token` : Token JWT du créateur
2. `expertToken` : Token JWT de l'expert
3. `jobId` : ID de l'offre d'emploi créée
4. `expertId` : ID de l'expert
5. `conversationId` : ID de la conversation créée

## Erreurs courantes

1. **Erreur 401 Unauthorized** : Vérifiez que le token JWT est correct et n'a pas expiré.
2. **Erreur 404 Not Found** : Vérifiez que l'ID utilisé existe bien.
3. **Erreur 400 Bad Request** : Vérifiez le format des données envoyées. 