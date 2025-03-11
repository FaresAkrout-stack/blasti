FROM node:18

WORKDIR /src 

COPY package*.json ./


RUN npm install

RUN npm install -g nodemon

COPY . /backend

EXPOSE 8000

CMD ["nodemon", "--exec", "npm", "run", "dev"]