#tfsec:ignore:aws-elb-alb-not-public --- IGNORE ---
resource "aws_lb" "this" {
  name = "${var.project_name}-${var.environment}-alb"

  internal = false

  load_balancer_type = "application"

  security_groups = [var.alb_security_group_id]

  subnets = var.public_subnet_ids

  access_logs {
    bucket = var.alb_log_bucket_name

    enabled = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
  drop_invalid_header_fields = true
}

resource "aws_lb_target_group" "frontend" {
  name = "${var.project_name}-${var.environment}-frontend"

  port = 80

  protocol = "HTTP"

  vpc_id = var.vpc_id

  target_type = "instance"

  health_check {
    enabled = true

    path = "/"

    protocol = "HTTP"

    matcher = "200-399"

    healthy_threshold = 3

    unhealthy_threshold = 3

    timeout = 5

    interval = 30
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}

resource "aws_lb_target_group" "backend" {
  name = "${var.project_name}-${var.environment}-backend-tg"

  port     = 8000
  protocol = "HTTP"

  target_type = "ip"

  vpc_id = var.vpc_id

  health_check {
    enabled = true

    path = "/health"

    protocol = "HTTP"

    matcher = "200"

    healthy_threshold = 3

    unhealthy_threshold = 3

    timeout = 5

    interval = 30
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}

resource "aws_lb_listener_rule" "backend_api" {
  listener_arn = aws_lb_listener.https.arn

  priority = 100

  action {
    type = "forward"

    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = [
        "/api/*",
        "/health",
        "/docs",
        "/openapi.json"
      ]
    }
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-backend-api-rule"
    }
  )
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn

  port = 80

  protocol = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port = "443"

      protocol = "HTTPS"

      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn

  port     = 443
  protocol = "HTTPS"

  certificate_arn = var.certificate_arn

  default_action {
    type = "forward"

    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name = "${var.project_name}-${var.environment}-alb-5xx"

  comparison_operator = "GreaterThanThreshold"

  evaluation_periods = 2

  metric_name = "HTTPCode_ELB_5XX_Count"

  namespace = "AWS/ApplicationELB"

  period = 300

  statistic = "Sum"

  threshold = 5

  dimensions = {
    LoadBalancer = aws_lb.this.arn_suffix
  }
}