output "frontend_asg_name" {
  value = aws_autoscaling_group.frontend.name
}

output "frontend_launch_template_id" {
  value = aws_launch_template.frontend.id
}