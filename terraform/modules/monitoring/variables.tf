variable "project_name" {
  type = string
}

variable "region" {
  type = string
}


variable "environment" {
  type = string
}

variable "ecs_cluster_name" {
  type = string
}

variable "ecs_service_name" {
  type = string
}

variable "db_instance_id" {
  type = string
}

variable "alb_arn_suffix" {
  type = string
}

variable "tags" {
  type = map(string)
}