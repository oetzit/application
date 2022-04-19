FROM node:16-alpine as base
LABEL maintainer="Paolo Brasolin <paolo.brasolin@eurac.edu>"

WORKDIR /app

COPY package*.json ./

# FIXME: apparently today GH is congestioned and we need to use a chinese mirror.
RUN npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
RUN npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"

RUN npm install

COPY . .

FROM base as production
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}
ENV NODE_PATH=./build
RUN npm run build
#CMD ["npm", "run", "start"]
