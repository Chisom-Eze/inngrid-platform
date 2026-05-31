variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "public_subnet_a_cidr" {
  description = "Public subnet A CIDR"
  type        = string
}

variable "public_subnet_b_cidr" {
  description = "Public subnet B CIDR"
  type        = string
}

variable "private_subnet_a_cidr" {
  description = "Private subnet A CIDR"
  type        = string
}

variable "private_subnet_b_cidr" {
  description = "Private subnet B CIDR"
  type        = string
}