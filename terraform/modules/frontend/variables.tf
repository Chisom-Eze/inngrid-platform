variable "project_name" {
  type = string
}

variable "environment" {
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

variable "private_subnet_ids" {
  type = list(string)
}

variable "min_size" {
  type    = number
  default = 1
}

variable "desired_capacity" {
  type    = number
  default = 1
}

variable "max_size" {
  type    = number
  default = 2
}