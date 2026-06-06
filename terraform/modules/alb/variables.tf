variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "alb_security_group_id" {
  type = string
}

variable "frontend_security_group_id" {
  type = string
}

variable "backend_security_group_id" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
}

variable "certificate_arn" {
  type = string
}