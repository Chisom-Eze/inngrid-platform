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
      environment     = var.environment
      frontend_artifacts_bucket = var.frontend_artifacts_bucket_arn
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

  metadata_options {
    http_tokens = "required"
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

#tfsec:ignore:aws-cloudwatch-log-group-customer-key
resource "aws_cloudwatch_log_group" "frontend_nginx_access" {
  name              = "/inngrid/frontend/nginx/access"
  retention_in_days = 7
}

#tfsec:ignore:aws-cloudwatch-log-group-customer-key
resource "aws_cloudwatch_log_group" "frontend_nginx_error" {
  name              = "/inngrid/frontend/nginx/error"
  retention_in_days = 7
}

resource "aws_autoscaling_group" "this" {
  name = "${var.project_name}-${var.environment}-frontend-asg"

  min_size         = var.min_size
  desired_capacity = var.desired_capacity
  max_size         = var.max_size

  vpc_zone_identifier = var.private_subnet_ids

  target_group_arns = [
    var.frontend_target_group_arn
  ]

  health_check_type = "ELB"

  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.frontend.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-${var.environment}-frontend"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "cpu" {
  name = "${var.project_name}-${var.environment}-frontend-cpu"

  autoscaling_group_name = aws_autoscaling_group.this.name

  policy_type = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }

    target_value = 70
  }
}

