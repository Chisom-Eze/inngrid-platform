resource "aws_db_subnet_group" "this" {
  name = "${var.project_name}-${var.environment}-db-subnet-group"

  subnet_ids = var.private_subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-db-subnet-group"
    }
  )
}

#tfsec:ignore:aws0176 
resource "aws_db_instance" "this" {
  identifier = "${var.project_name}-${var.environment}-postgres"

  engine         = "postgres"
  engine_version = "16"

  instance_class = "db.t3.micro"

  allocated_storage = 20

  db_name  = var.db_name
  username = var.db_username

  manage_master_user_password = true

  storage_encrypted = true

  backup_retention_period = 7

  performance_insights_enabled = false

  monitoring_interval = 60

  monitoring_role_arn = var.rds_monitoring_role_arn

  publicly_accessible = false

  skip_final_snapshot = true

  deletion_protection = false

  db_subnet_group_name = aws_db_subnet_group.this.name

  vpc_security_group_ids = [
    var.database_security_group_id
  ]

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-postgres"
    }
  )
}