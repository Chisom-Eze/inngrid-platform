resource "aws_secretsmanager_secret" "database" {
  name = "${var.project_name}/${var.environment}/database"

  description = "Database credentials secret"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-database-secret"
    }
  )
}

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

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id

  secret_string = random_password.jwt.result
}

