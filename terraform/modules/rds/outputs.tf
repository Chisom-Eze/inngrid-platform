output "db_endpoint" {
  value = aws_db_instance.this.endpoint
}

output "db_identifier" {
  value = aws_db_instance.this.identifier
}

output "db_secret_arn" {
  value = aws_db_instance.this.master_user_secret[0].secret_arn
}