FROM node:22
RUN npm install -g npm@latest

WORKDIR /app

COPY package.json package-lock.json ./

ENV NODE_ENV=production
RUN npm ci

COPY . .

RUN make

CMD [ "node", "server.js", "80", "yetipredict-mongo", "27017" ]

