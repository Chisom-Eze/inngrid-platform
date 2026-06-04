variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "public_subnet_id" {
  type = string
}

variable "frontend_security_group_id" {
  type = string
}

variable "instance_profile_name" {
  type = string
}

variable "frontend_target_group_arn" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "tags" {
  type = map(string)
}