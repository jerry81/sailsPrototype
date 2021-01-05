FROM node:12-alpine
WORKDIR /app
COPY . . 
RUN yarn install
CMD ["node", "./src/controller/server.js"]
