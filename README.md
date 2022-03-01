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

**CAVEAT:** the cluster has `k8s 1.10.11` but **you must use `kubectl 1.11.0`**, otherwise the schema validation breaks since `1.10.11` schemas aren't around anymore.

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
