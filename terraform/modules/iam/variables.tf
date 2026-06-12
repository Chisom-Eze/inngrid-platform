variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
}

variable "jwt_secret_arn" {
  description = "ARN of the JWT secret in AWS Secrets Manager"
  type        = string
}

variable "database_secret_arn" {
  description = "ARN of the database credentials secret in AWS Secrets Manager"
  type        = string
}