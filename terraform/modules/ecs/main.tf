resource "aws_ecs_cluster" "this" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(
  var.tags,
  {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
)
}

resource "aws_cloudwatch_log_group" "backend" {
  name = "/ecs/${var.project_name}-${var.environment}"

  retention_in_days = 7

  tags = merge(
  var.tags,
  {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
)
}

resource "aws_ecs_task_definition" "backend" {
  family = "${var.project_name}-${var.environment}-backend"

  requires_compatibilities = ["FARGATE"]

  network_mode = "awsvpc"

  cpu    = 256
  memory = 512

  execution_role_arn = var.ecs_execution_role_arn
  task_role_arn      = var.ecs_task_role_arn

  container_definitions = jsonencode([
    {
      name = "backend"

      image = "nginx:latest"

      essential = true

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = aws_cloudwatch_log_group.backend.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "backend"
        }
      }
    }
  ])

  tags = merge(
  var.tags,
  {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
)
}

resource "aws_ecs_service" "backend" {
  name = "${var.project_name}-${var.environment}-backend"

  cluster = aws_ecs_cluster.this.id

  task_definition = aws_ecs_task_definition.backend.arn

  desired_count = 2

  launch_type = "FARGATE"

  network_configuration {
    assign_public_ip = false

    security_groups = [
      var.backend_security_group_id
    ]

    subnets = var.private_subnet_ids
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn

    container_name = "backend"

    container_port = 8000
  }

  tags = merge(
  var.tags,
  {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
)
}

