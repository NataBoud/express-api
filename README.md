# EXPRESS-API

## Start

```bash
npx express-generator
```

```bash
npm i multer
npm i cors
npm i  bcryptjs jsonwebtoken jdenticon
npm i -D nodemon
```
### Multer ###
 Multer est un middleware Node.js pour gérer les fichiers multipart/form-data, utilisés principalement pour le téléchargement de fichiers. Il est spécialement conçu pour travailler avec l'application Express.js et permet de gérer facilement les fichiers envoyés depuis le côté client via des formulaires HTML.

### Docker ###

```bash
docker-compose build
docker-compose up -d
docker-compose up --build -d
```
Dans .env changer database url selon la commande de docker:

DATABASE_URL=mongodb://root:example@db:27017/mydb?authSource=databaseexample

 
```bash
git rm -r --cached uploads/
git add .gitignore
git commit -m "Supprimer le dossier uploads du dépôt Git"
git push origin main
```

