resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-${var.environment}-alerts"
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
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  alarm_actions = [
    aws_sns_topic.alerts.arn
  ]

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-ecs-cpu-high"
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {

  alarm_name = "${var.project_name}-${var.environment}-ecs-memory-high"

  namespace   = "AWS/ECS"
  metric_name = "MemoryUtilization"

  statistic = "Average"

  period = 300

  evaluation_periods = 2

  threshold = 80

  comparison_operator = "GreaterThanThreshold"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name = "${var.project_name}-${var.environment}-rds-cpu-high"

  comparison_operator = "GreaterThanThreshold"

  evaluation_periods = 2

  metric_name = "CPUUtilization"

  namespace = "AWS/RDS"

  period = 300

  statistic = "Average"

  threshold = 80

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }

  alarm_actions = [
    aws_sns_topic.alerts.arn
  ]

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-rds-cpu-high"
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "rds_storage_low" {

  alarm_name = "${var.project_name}-${var.environment}-rds-storage-low"

  namespace = "AWS/RDS"

  metric_name = "FreeStorageSpace"

  statistic = "Average"

  period = 300

  evaluation_periods = 2

  threshold = 2147483648

  comparison_operator = "LessThanThreshold"

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {

  alarm_name = "${var.project_name}-${var.environment}-alb-5xx"

  namespace = "AWS/ApplicationELB"

  metric_name = "HTTPCode_ELB_5XX_Count"

  statistic = "Sum"

  period = 300

  evaluation_periods = 2

  threshold = 5

  comparison_operator = "GreaterThanThreshold"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  tags = var.tags
}

resource "aws_cloudwatch_dashboard" "platform" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        x    = 0
        y    = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/ECS", "CPUUtilization", "ClusterName", var.ecs_cluster_name, "ServiceName", var.ecs_service_name ],
            [ ".", "MemoryUtilization", ".", ".", ".", "." ]
          ]
          view       = "timeSeries"
          stacked    = false
          region     = var.region
          title      = "ECS CPU and Memory Utilization"
          period     = 300
        }
      },
      {
        type = "metric"
        x    = 12
        y    = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            [ "AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.db_instance_id ],
            [ ".", "FreeStorageSpace", ".", "." ]
          ]
          view       = "timeSeries"
          stacked    = false
          region     = var.region
          title      = "RDS CPU and Free Storage Space"
          period     = 300
        }
      },
      {
        type = "metric"
        x    = 0
        y    = 6
        width  = 12
        height = 6
        properties = {
          metrics   = [
            [ "AWS/ApplicationELB", "HTTPCode_ELB_5XX_Count", "LoadBalancer", var.alb_arn_suffix ]
          ]
          view       = "timeSeries"
          stacked    = false
          region     = var.region
          title      = "ALB HTTPCode ELB 5XX Count"
          period     = 300
        }
      }
    ]
  })
}