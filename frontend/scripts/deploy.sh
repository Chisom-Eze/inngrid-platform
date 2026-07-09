#!/bin/bash

set -euxo pipefail

cd /opt/inngrid/frontend

aws s3 cp \
s3://${frontend_artifacts_bucket}/frontend-standalone.tar.gz \
frontend-standalone.tar.gz

rm -rf .next node_modules server.js package.json

tar -xzf frontend-standalone.tar.gz

pm2 restart inngrid-frontend || \
pm2 start server.js --name inngrid-frontend

pm2 save