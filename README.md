# Ötzi

This is a web-based typing game.

## Backend

The backend is a `fastify` webserver exposing some APIs.

To spin it up for development,

```bash
cd backend
npm install
npm exec knex migrate:latest
npm exec knex seed:run
PORT=8080 npm run serve
```

The webserver will be abailable at `http://localhost:8080`.

### Deployment

**NOTE:** currently we have `k8s 1.10.11` on cluster. This causes quite a few problems in reproducing the environment easily, mostly due to the fact that `1.10.11` schemas aren't around anymore and early versions of `minikube` are not easy to get.

### `dev`

First you get the latest `minikube` up and running:

```bash
winget install minikibe
minikube start
```

Then you build the backend image and push it to the runtime cache of `minikube`:

```bash
docker build -t oetzi:latest backend/
minikube image load oetzi:latest
```

Finally you apply the `dev` manifest and open a tunnel:

```bash
minikube kubectl -- apply -k backend/k8s/overlays/dev/
```

For your sanity, remember to open a tunnel and ensure the `ingress` is enabled:

```bash
minikube addons enable ingress
minikube tunnel
```

That's it!

#### Tentatively reproducing the cluster

Our current cluster has `k8s 1.10.11`.

The earliest `minikube` available via `choco` reaches that, but apparently even `minikube 1.11.0` only supports up to `k8s 1.13.0` so there's no use going down that road.

The earliest `minikube` available via `winget` is `1.15.1`, so we might as well go with it.

```bash
winget install minikibe --version=1.15.1
```

This way we can get back to `k8s 1.13.0`:

```bash
minikube start --kubernetes-version=v1.13.0
```

Finally, we can deploy:

```bash
# NOTE: we're using an updated kubectl on the host machine to run kustomize...
kubectl kustomize backend/k8s/overlays/dev | minikube kubectl -- apply -f -
# NOTE: ... a modern version would afford us this instead
#   minikube kubectl -- apply -k dev
```

#### `stg`/`prd`

**IMPORTANT:** while the cluster has `k8s 1.10.11` and you can easily get `kubectl 1.10.11`, **you must use `kubectl 1.11.0`** because `1.10.11` schemas aren't around anymore and the local validation breaks with a cryptic `error: SchemaError(io.k8s.apimachinery.pkg.apis.meta.v1.APIGroup_v2): invalid object doesn't have additional properties`.

```bash
# Please validate before deploying (1.11.0 is the closest available schema version)
kustomize build backend/k8s/overlays/ENV/ | kubeval --kubernetes-version 1.11.0
# We're on an old version and there's no -k flag:
kustomize build backend/k8s/overlays/ENV/ | kubectl apply -f -
```

## Frontend

The frontend is a `phaser` webapp built `parcel`.

To spin it up for development,

```bash
cd frontend
npm install
npm run serve
```

Also, remember to

    Change line 63/64 of main.js file in src/js folder by switching the comment.
    This operation permits the ui to call the backend at `http://localhost:8080/oetzi_words/` instead of to the relative path.

The webapp will be abailable at `http://localhost:1234`.

### Assets

- critters?
- https://chierit.itch.io/elementals-ground-monk
- https://edermunizz.itch.io/free-pixel-art-forest
- https://jdwasabi.itch.io/8-bit-16-bit-sound-effects-pack
- https://gooseninja.itch.io/minimalistc-loops
