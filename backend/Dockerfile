# Utiliser une image Node.js officielle comme base
FROM node:18-slim

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer le port 8080
EXPOSE 8080

# Démarrer l'application
CMD [ "node", "server.js" ] 