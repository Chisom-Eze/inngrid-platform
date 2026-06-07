data "aws_ami" "ubuntu" {
  most_recent = true

  owners = ["099720109477"]

  filter {
    name = "name"

    values = [
      "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"
    ]
  }

  filter {
    name = "virtualization-type"

    values = ["hvm"]
  }
}

locals {
  user_data = templatefile(
    "${path.module}/user-data.sh.tpl",
    {
      environment = var.environment
    }
  )
}

resource "aws_launch_template" "frontend" {
  name_prefix = "${var.project_name}-${var.environment}-frontend-"

  image_id = data.aws_ami.ubuntu.id

  instance_type = var.instance_type

  iam_instance_profile {
    name = var.instance_profile_name
  }

  vpc_security_group_ids = [
    var.frontend_security_group_id
  ]

  user_data = base64encode(local.user_data)

  tag_specifications {
    resource_type = "instance"

    tags = merge(
      var.tags,
      {
        Name = "${var.project_name}-${var.environment}-frontend"
      }
    )
  }
}

resource "aws_lb_target_group_attachment" "frontend" {
  target_group_arn = var.frontend_target_group_arn

  target_id = aws_instance.frontend.id

  port = 80
}

resource "aws_cloudwatch_log_group" "frontend_nginx_access" {
  name              = "/inngrid/frontend/nginx/access"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "frontend_nginx_error" {
  name              = "/inngrid/frontend/nginx/error"
  retention_in_days = 7
}
