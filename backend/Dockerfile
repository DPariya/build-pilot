FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get update && apt-get install -y git

EXPOSE 3000

CMD ["sh", "-c", "node scripts/migrate.js && node server.js"]