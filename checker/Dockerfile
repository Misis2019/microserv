FROM node:latest

WORKDIR /app

COPY package.json /app

RUN npm install 

COPY . /app

CMD node main.js

EXPOSE 3000