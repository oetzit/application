FROM node:16-alpine as base
LABEL maintainer="Paolo Brasolin <paolo.brasolin@eurac.edu>"

# TODO: drop sqlite3 and delete this
RUN apk add --update python2 build-base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
