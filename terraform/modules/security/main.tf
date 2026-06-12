resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = var.vpc_id

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-alb-sg"
    }
  )
}


resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 80
  to_port     = 80
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 443
  to_port     = 443
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "alb_outbound" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}

resource "aws_security_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-frontend-sg"
  description = "Security group for EC2 instances"
  vpc_id      = var.vpc_id

  tags = merge(
  var.tags,
    {
      Name = "${var.project_name}-${var.environment}-frontend-sg"
    }
  )
}

resource "aws_vpc_security_group_ingress_rule" "frontend_from_alb" {
  security_group_id = aws_security_group.frontend.id

  referenced_security_group_id = aws_security_group.alb.id

  from_port   = 80
  to_port     = 80
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "frontend_outbound" {
  security_group_id = aws_security_group.frontend.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}

resource "aws_security_group" "backend" {
  name        = "${var.project_name}-${var.environment}-backend-sg"
  description = "Security group for backend ECS services"
  vpc_id      = var.vpc_id

  tags = merge(
  var.tags,
    {
      Name = "${var.project_name}-${var.environment}-backend-sg"
    }
  )
}

resource "aws_vpc_security_group_ingress_rule" "backend_from_alb" {
  security_group_id = aws_security_group.backend.id

  referenced_security_group_id = aws_security_group.alb.id

  from_port   = 8000
  to_port     = 8000
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "backend_outbound" {
  security_group_id = aws_security_group.backend.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}

resource "aws_security_group" "database" {
  name        = "${var.project_name}-${var.environment}-database-sg"
  description = "Security group for PostgreSQL"
  vpc_id      = var.vpc_id

  tags = merge(
  var.tags,
    {
      Name = "${var.project_name}-${var.environment}-database-sg"
    }
  )
}

resource "aws_vpc_security_group_ingress_rule" "database_from_backend" {
  security_group_id = aws_security_group.database.id

  referenced_security_group_id = aws_security_group.backend.id

  from_port   = 5432
  to_port     = 5432
  ip_protocol = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "database_outbound" {
  security_group_id = aws_security_group.database.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
}