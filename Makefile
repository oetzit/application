include Makefile.env

APP_VERSION := $(shell git describe --tags)
CI_COMMIT_SHA := $(shell git rev-parse HEAD)

# BE HELPERS

docker-login:
	docker login \
		-u ${CI_REGISTRY_USER} \
		-p ${CI_JOB_TOKEN} \
		https://${CI_REGISTRY}

docker-build:
	docker build \
		--target production \
		--tag=${IMAGE_NAME}:${APP_VERSION} \
		--tag=${IMAGE_NAME}:${CI_COMMIT_SHA} \
		--build-arg APP_VERSION=${APP_VERSION} \
		--build-arg ROLLBAR_ACCESS_TOKEN=${POST_SERVER_ITEM_ROLLBAR_ACCESS_TOKEN} \
		backend

docker-push:
	docker image push --all-tags ${IMAGE_NAME}

# BE JOBS

build-be-job: docker-login docker-build docker-push

stg-be-deploy-job:
	kubectl set image \
		deployment/${K8S_DEPLOYMENT} \
		oetzit=${IMAGE_NAME}:${CI_COMMIT_SHA} \
		--namespace=kommul-dev

prd-be-deploy-job:
	kubectl set image \
		deployment/${K8S_DEPLOYMENT} \
		oetzit=${IMAGE_NAME}:${CI_COMMIT_SHA} \
		--namespace=kommul

# FE HELPERS

get-butler:
	wget -O butler.zip ${BUTLER_URL}
	unzip butler.zip
	chmod +x tmp/butler
	./butler -V

# FE JOBS

stg-build-fe-node-job:
	rm -rf frontend/dist/stg
	cd frontend && \
	NODE_ENV=staging \
	npm run build -- --dist-dir dist/stg

prd-build-fe-node-job:
	rm -rf frontend/dist/prd
	cd frontend && \
	NODE_ENV=production \
	npm run build -- --dist-dir dist/prd

stg-fe-deploy-job:
	./butler push \
		frontend/dist/stg \
		eurac/oetzit-staging:html5 \
		--userversion ${APP_VERSION}

prd-fe-deploy-job:
	./butler push \
		frontend/dist/prd \
		eurac/oetzit:html5 \
		--userversion ${APP_VERSION}
