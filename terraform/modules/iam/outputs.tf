output "ecs_execution_role_arn" {
  value = aws_iam_role.ecs_execution_role.arn
}

output "ecs_task_role_arn" {
  value = aws_iam_role.ecs_task_role.arn
}

output "instance_profile_name" {
  value = aws_iam_instance_profile.frontend.name
}

output "rds_monitoring_role_arn" {
  value = aws_iam_role.rds_monitoring.arn
}