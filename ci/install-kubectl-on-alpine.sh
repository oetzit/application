#!/usr/bin/env sh

set -e # exit of first error
#set -o xtrace # trace commands

echo "Installing kubectl..."

KUBECTL_VERSION=v1.8.10
KUBECTL_URL=https://storage.googleapis.com/kubernetes-release/release/$KUBECTL_VERSION/bin/linux/amd64/kubectl

wget $KUBECTL_URL
# NOTE: version is too ald and doesn't have sha256 available
# wget https://dl.k8s.io/release/$KUBECTL_VERSION/bin/linux/amd64/kubectl.sha256
# echo "$(<kubectl.sha256)  kubectl" | sha256sum --check
mv kubectl /usr/bin/
chmod +x /usr/bin/kubectl

echo "Configuring kubectl..."

K8S_USER=gitlab-deploy
K8S_CLUSTER=k8sproduction

kubectl config \
  set-cluster "$K8S_CLUSTER" \
  --server="$KUBE_URL" \
  --certificate-authority="$KUBE_CA_PEM_FILE"

kubectl config \
  set-credentials "$K8S_USER" \
  --token="$K8S_PRODUCTION_TOKEN"

kubectl config \
  set-context "$CI_PROJECT_ID" \
  --cluster="$K8S_CLUSTER" \
  --user="$K8S_USER"

kubectl config \
  use-context "$CI_PROJECT_ID"
