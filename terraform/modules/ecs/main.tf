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

      image = var.backend_image

      essential = true

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "AWS_REGION"
          value = var.region
        }
      ]

      secrets = [
         {
           name      = "DATABASE_SECRET"
            valueFrom = var.database_secret_arn
         },
         {
            name      = "JWT_SECRET"
            valueFrom = var.jwt_secret_arn
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

  desired_count = 1

  deployment_minimum_healthy_percent = 100

  deployment_maximum_percent = 200

  enable_execute_command = true

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

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}

resource "aws_appautoscaling_target" "ecs" {
  max_capacity = 2
  min_capacity = 1

  resource_id = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.backend.name}"

  scalable_dimension = "ecs:service:DesiredCount"

  service_namespace = "ecs"
}

resource "aws_appautoscaling_policy" "memory" {
  name = "${var.project_name}-${var.environment}-ecs-memory"

  policy_type = "TargetTrackingScaling"

  resource_id = aws_appautoscaling_target.ecs.resource_id

  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension

  service_namespace = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value = 75
  }
}

resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name = "${var.project_name}-${var.environment}-ecs-cpu-high"

  comparison_operator = "GreaterThanThreshold"

  evaluation_periods = 2

  metric_name = "CPUUtilization"

  namespace = "AWS/ECS"

  period = 300

  statistic = "Average"

  threshold = 80

  dimensions = {
    ClusterName = aws_ecs_cluster.this.name
    ServiceName = aws_ecs_service.backend.name
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}

resource "aws_appautoscaling_policy" "cpu" {
  name = "${var.project_name}-${var.environment}-ecs-cpu"

  policy_type = "TargetTrackingScaling"

  resource_id = aws_appautoscaling_target.ecs.resource_id

  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension

  service_namespace = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = 60
  }
}