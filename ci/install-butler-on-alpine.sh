#!/usr/bin/env sh

set -e # exit of first error
#set -o xtrace # trace commands

# NOTE: Alpine Linux stuff if linked with muslc. Butler is linked with glibc, and this causes an error -- see https://stackoverflow.com/a/66974607/6438061 for details. We need to install a compatibility layer: https://github.com/sgerrand/alpine-pkg-glibc#installing

echo "Installing glibc..."

GLIBC_VERSION=2.34-r0
GLIBC_URL=https://github.com/sgerrand/alpine-pkg-glibc/releases/download/$GLIBC_VERSION/glibc-$GLIBC_VERSION.apk
GLIBC_KEY=https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub

wget -P /etc/apk/keys $GLIBC_KEY
wget -O glibc.apk $GLIBC_URL
apk add glibc.apk
rm glibc.apk

echo "Installing unzip..."

apk add --no-cache unzip

echo "Installing butler..."

BUTLER_VERSION=LATEST
BUTLER_URL=https://broth.itch.ovh/butler/linux-amd64/$BUTLER_VERSION/archive/default

wget -O butler.zip $BUTLER_URL
unzip butler.zip *.so -d /usr/local/lib
unzip butler.zip butler -d /usr/local/bin
chmod +x /usr/local/bin/butler
rm butler.zip
butler -V

# NOTE: sometimes this fails with error `runtime/cgo: pthread_create failed: Operation not permitted` and I'm not sure why. A strict Docker's seccomp policy would explain this, but then why is it flaky?! **UPDATE**: it appears that I was right and setting `tags: [commul]` selects only runners with extended policies.
