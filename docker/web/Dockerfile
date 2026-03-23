FROM node:22
#RUN npm install -g npm@latest

WORKDIR /app

#COPY package.json package-lock.json ./
COPY package.json pnpm-lock.yaml ./
COPY vendor/pnpm-store ./vendor/pnpm-store

#ENV NODE_ENV=production
#RUN npm ci
#RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod
#RUN corepack enable pnpm
RUN npm install -g pnpm@10
#RUN pnpm config set store-dir vendor/pnpm-store
RUN pnpm install --offline --frozen-lockfile --prod --store-dir vendor/pnpm-store

COPY . .

RUN make

CMD [ "node", "server.js", "80", "yetipredict-mongo", "27017" ]

