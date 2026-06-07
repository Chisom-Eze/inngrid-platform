#!/bin/bash

set -euxo pipefail


apt-get update -y


apt-get install -y nginx wget curl unzip

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
      "AutoScalingGroupName": "\${aws:AutoScalingGroupName}",
      "InstanceId": "\${aws:InstanceId}"
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

systemctl restart nginx

systemctl is-active nginx

systemctl is-active snap.amazon-ssm-agent.amazon-ssm-agent.service

systemctl is-active amazon-cloudwatch-agent