#tfsec:ignore:aws-secretsmanager-secret-customer-key
resource "aws_secretsmanager_secret" "jwt" {
  name = "${var.project_name}/${var.environment}/jwt"

  description = "JWT signing secret"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-jwt-secret"
    }
  )
}

resource "random_password" "jwt" {
  length  = 64
  special = true
}

#tfsec:ignore:aws-secretsmanager-secret-version-customer-key
resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id

  secret_string = random_password.jwt.result
}