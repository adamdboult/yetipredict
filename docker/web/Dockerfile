FROM node:10
RUN apt-get update && apt-get -y install build-essential apache2 git python3 ruby-sass

# Needed for the empty folder stuff to work
WORKDIR /Projects/yetipredict/

COPY . .
RUN npm install && make
CMD [ "node", "server.js", "80", "yetipredict-mongo", "27017" ]
