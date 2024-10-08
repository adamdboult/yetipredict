FROM node:22
RUN apt-get update && apt-get -y install \
  build-essential

# Needed for the empty folder stuff to work
WORKDIR /Projects/yetipredict/

COPY . .
RUN npm ci && make
CMD [ "node", "server.js", "80", "yetipredict-mongo", "27017" ]
