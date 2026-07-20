#!/bin/bash

set -euxo pipefail

if [ $# -ne 1 ]; then
    echo "Usage: deploy-frontend.sh <artifact-name>"
    exit 1
fi

source /etc/inngrid.env

ARTIFACT_NAME="$1"

cd /opt/inngrid/frontend

echo "Deploying ${ARTIFACT_NAME}..."

rm -rf .next node_modules

aws s3 cp \
    "s3://${ARTIFACT_BUCKET}/${ARTIFACT_NAME}" \
    "${ARTIFACT_NAME}"

tar -xzf "${ARTIFACT_NAME}"

rm -f "${ARTIFACT_NAME}"

test -f .next/standalone/server.js

cd .next/standalone

pm2 delete inngrid-frontend >/dev/null 2>&1 || true

pm2 start server.js --name inngrid-frontend

pm2 save

echo "Deployment completed successfully."