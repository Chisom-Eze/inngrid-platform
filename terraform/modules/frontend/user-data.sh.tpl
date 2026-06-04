#!/bin/bash

set -euxo pipefail

apt-get update -y

apt-get install -y nginx

systemctl enable nginx

systemctl start nginx

cat > /var/www/html/index.html <<EOF
<!DOCTYPE html>
<html>
<head>
<title>InnGrid Frontend</title>
</head>
<body>
<h1>InnGrid Frontend Server</h1>
<p>Environment: ${environment}</p>
</body>
</html>
EOF