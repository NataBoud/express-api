# EXPRESS-API

## Start

```bash
npx express-generator
```

```bash
npm i multer
```
### Multer ###
 Multer est un middleware Node.js pour gérer les fichiers multipart/form-data, utilisés principalement pour le téléchargement de fichiers. Il est spécialement conçu pour travailler avec l'application Express.js et permet de gérer facilement les fichiers envoyés depuis le côté client via des formulaires HTML.

### ORM Prisma ###

```bash
npx prisma init
```

### Docker ###


```
Dans .env changer database url selon la commande de docker:

```javascript
DATABASE_URL="mongodb://johndoe:randompassword@localhost:5432/mydb?schema=public"
```
#### schema.prisma ####

```javascript
model User {
  id String @id @default(auto()) @map("_id") @db.ObjectId
} 

// @id : Fait du champ id la clé primaire du modèle.
// @default(auto()) : Demande à MongoDB de générer automatiquement la valeur de ce champ.
// @map("_id") : Mappe le champ id au champ _id de MongoDB.
// @db.ObjectId : Spécifie que ce champ utilise le type ObjectId de MongoDB.
```
```bash
npx prisma format
```
```bash
npx prisma db push
```
```bash
npx prisma studio
```
```bash
npm i  bcryptjs jsonwebtoken jdenticon
```
```bash
npm i -D nodemon
```

docker run --name mongo \
      -p 27017:27017 \
      -e MONGO_INITDB_ROOT_USERNAME="admin" \
      -e MONGO_INITDB_ROOT_PASSWORD="adminpass" \
      -d prismagraphql/mongo-single-replica:5.0.3


docker run --name mongo \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME="admin" \
-e MONGO_INITDB_ROOT_PASSWORD="adminpass" \
-d mongo --replSet rs0# express-api
