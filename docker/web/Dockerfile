FROM node:22

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY vendor/pnpm-store ./vendor/pnpm-store
COPY vendor/npm ./vendor/npm

RUN npm install -g ./vendor/npm/pnpm_tgz/pnpm-10.33.0.tgz --prefix vendor/npm/pnpm_bin/

RUN ./vendor/npm/pnpm_bin/bin/pnpm install --offline --frozen-lockfile --prod --store-dir vendor/pnpm-store

#RUN ./vendor/npm/pnpm_bin/bin/pnpm rebuild bcrypt
#RUN ./vendor/npm/pnpm_bin/bin/pnpm why bcrypt || true
#RUN ls -la node_modules/.pnpm | grep bcrypt || true
#RUN find node_modules -path "*bcrypt*" -maxdepth 8 -type f | sort | head -100
#RUN node -e "console.log(require.resolve('bcrypt/package.json')); console.log(require('bcrypt/package.json').scripts)"
#RUN node -e "require('bcrypt'); console.log('bcrypt loaded OK')"

COPY . .

RUN make

CMD [ "node", "server.js", "80", "yetipredict-mongo", "27017" ]

