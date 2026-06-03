resource "aws_lb" "this" {
  name = "${var.project_name}-${var.environment}-alb"

  internal = false

  load_balancer_type = "application"

  security_groups = [var.alb_security_group_id]

  subnets = var.public_subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}

resource "aws_lb_target_group" "frontend" {
  name = "${var.project_name}-${var.environment}-frontend"

  port = 3000

  protocol = "HTTP"

  vpc_id = var.vpc_id

  target_type = "instance"

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

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn

  port = 80

  protocol = "HTTP"

  default_action {
    type = "forward"

    target_group_arn = aws_lb_target_group.frontend.arn
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}

resource "aws_lb_listener_rule" "backend_api" {
  listener_arn = aws_lb_listener.http.arn

  priority = 100

  action {
    type = "forward"

    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}