FROM node:22
RUN apt-get update && apt-get -y install \
  build-essential

# Needed for the empty folder stuff to work
WORKDIR /Projects/yetipredict/

# Copy package.json and package-lock.json to leverage Docker cache
COPY package.json package-lock.json ./
# Install dependencies using npm ci
RUN npm ci

COPY . .

RUN make

CMD [ "node", "server.js", "80", "yetipredict-mongo", "27017" ]
