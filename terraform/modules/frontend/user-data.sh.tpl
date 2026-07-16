#!/bin/bash

set -euxo pipefail

exec > >(tee /var/log/inngrid-bootstrap.log | logger -t inngrid-bootstrap) 2>&1


apt-get update -y

apt-get install -y nginx wget curl unzip jq

# Create InnGrid application user
#
if ! id -u inngrid >/dev/null 2>&1; then
    useradd \
        --create-home \
        --shell /bin/bash \
        inngrid
fi

mkdir -p /opt/inngrid/scripts
mkdir -p /opt/inngrid/logs

mkdir -p /opt/inngrid/frontend

#
# Install Node.js 22
#
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

apt-get install -y nodejs

#
# Install PM2
#
npm install -g pm2

pm2 startup systemd -u inngrid --hp /home/inngrid

#
# Install AWS CLI v2
#
cd /tmp

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
  -o awscliv2.zip

unzip -q awscliv2.zip

./aws/install

#
# Create frontend deployment directory
#
mkdir -p /opt/inngrid/frontend

chown -R inngrid:inngrid /opt/inngrid
chmod -R 755 /opt/inngrid

cat >/etc/inngrid.env <<'EOF'
FRONTEND_ARTIFACTS_BUCKET=${frontend_artifacts_bucket}
EOF

systemctl enable nginx
systemctl start nginx


if ! snap list amazon-ssm-agent >/dev/null 2>&1; then
  snap install amazon-ssm-agent --classic
fi

systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service

#
# Install CloudWatch Agent
#
wget -q https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

dpkg -i amazon-cloudwatch-agent.deb || apt-get install -f -y

mkdir -p /opt/aws/amazon-cloudwatch-agent/etc


cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<EOF
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },

  "metrics": {
    "namespace": "InnGrid/Frontend",

    "append_dimensions": {
      "AutoScalingGroupName": "$${aws:AutoScalingGroupName}",
      "InstanceId": "$${aws:InstanceId}"
    },

    "metrics_collected": {

      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "totalcpu": true
      },

      "mem": {
        "measurement": [
          "mem_used_percent"
        ]
      },

      "disk": {
        "measurement": [
          "used_percent"
        ],
        "resources": [
          "/"
        ]
      }
    }
  },

  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [

          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/inngrid/frontend/nginx/access",
            "log_stream_name": "{instance_id}"
          },

          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/inngrid/frontend/nginx/error",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
EOF


/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s


cat > /etc/nginx/sites-available/default <<'EOF'
server {
    listen 80;

    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }
}
EOF

cat >/opt/inngrid/scripts/deploy-frontend.sh <<'EOF'
#!/bin/bash

set -euxo pipefail

cd /opt/inngrid/frontend

aws s3 cp \
s3://${frontend_artifacts_bucket}/frontend-standalone.tar.gz \
frontend-standalone.tar.gz

rm -rf \
.next \
node_modules \
server.js \
package.json

# Extract new deployment
tar -xzf frontend-standalone.tar.gz

chown -R inngrid:inngrid .

sudo -u inngrid pm2 restart inngrid-frontend || \
sudo -u inngrid pm2 start server.js --name inngrid-frontend

sudo -u inngrid pm2 save
EOF

chmod +x /opt/inngrid/scripts/deploy-frontend.sh

nginx -t

systemctl reload nginx

systemctl is-active nginx

systemctl is-active snap.amazon-ssm-agent.amazon-ssm-agent.service

systemctl is-active amazon-cloudwatch-agent