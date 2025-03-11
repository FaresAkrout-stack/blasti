# Use Node.js 18 as the base image
FROM node:18

WORKDIR /backend

COPY package*.json ./

RUN npm install

RUN npm install -g nodemon




COPY backend/. /app/

EXPOSE 8000

CMD ["nodemon", "--exec", "npm", "run", "dev"]