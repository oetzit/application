#!/usr/bin/env bash

ROLLBAR_ACCESS_TOKEN=7730eca6e334480abee44b0d5267a75f

NODE_ENV=production
GAME_NAME=oetzit
DIST_PATH=dist/prd

APP_VERSION=$(git describe --tags)

rm -rf $DIST_PATH
NODE_ENV=$NODE_ENV APP_VERSION=$APP_VERSION npm run build -- --dist-dir $DIST_PATH

./dev/butler \
    push \
    $DIST_PATH \
    eurac/$GAME_NAME:html5 \
    --userversion $APP_VERSION
