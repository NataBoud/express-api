# Une image officielle de Node.js 22.x avec Alpine comme image de base
FROM node:22-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier package.json et package-lock.json dans le le container
COPY package*.json ./

# Installer les dépendances
# RUN npm install --production
RUN npm install 

# Copier le reste des fichiers de l'application dans le container
COPY . .

# Copier le fichier .env dans le conteneur
# COPY .env ./

# Exposer le port sur lequel l'application va écouter
EXPOSE 5000

# Définir la commande à exécuter pour démarrer l'application
CMD ["npm", "start"]