# Use the official image as a parent image.
FROM node:8
#FROM ubuntu:18.04

# Set the working directory.
WORKDIR /usr/src/nodeHomePage

# Update/upgrade
RUN apt-get update
RUN apt-get -y upgrade

# Install basic stuff
RUN apt-get -y install build-essential apache2 git

# Install python
RUN apt-get -y install python3
#RUN pip3 install unicodecsv
#RUN pip3 install xlrd

# Install node
#RUN apt-get -y install nodejs npm
#RUN npm -g install npx
#RUN apt-get -y install mongodb

# Copy the file from your host to your current location.
#COPY package.json .
#COPY bower.json .
COPY . .

# Install
RUN npm install
RUN npx gulp

# Add metadata to the image to describe which port the container is listening on at runtime.
EXPOSE 3123

# Run the specified command within the container.
CMD [ "node", "server.js" ]

