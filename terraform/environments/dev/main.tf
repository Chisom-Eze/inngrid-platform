module "networking" {
  source = "../../modules/networking"

  project_name = var.project_name
  environment  = var.environment

  vpc_cidr              = var.vpc_cidr
  public_subnet_a_cidr  = var.public_subnet_a_cidr
  public_subnet_b_cidr  = var.public_subnet_b_cidr
  private_subnet_a_cidr = var.private_subnet_a_cidr
  private_subnet_b_cidr = var.private_subnet_b_cidr
  region                = var.region

  flow_logs_role_arn = module.iam.flow_logs_role_arn

  tags = var.tags
}

module "security" {
  source = "../../modules/security"

  project_name = var.project_name
  environment  = var.environment

  vpc_id = module.networking.vpc_id

  tags = var.tags
}

module "iam" {
  source = "../../modules/iam"

  project_name = var.project_name
  environment  = var.environment

  database_secret_arn = module.rds.db_secret_arn
  jwt_secret_arn      = module.secrets.jwt_secret_arn

  tags = var.tags
}

module "logging" {
  source = "../../modules/logging"

  project_name = var.project_name
  environment  = var.environment

  tags = var.tags
}

module "alb" {
  source = "../../modules/alb"

  project_name = var.project_name
  environment  = var.environment

  vpc_id = module.networking.vpc_id

  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids

  alb_security_group_id      = module.security.alb_security_group_id
  frontend_security_group_id = module.security.frontend_security_group_id
  backend_security_group_id  = module.security.backend_security_group_id

  alb_log_bucket_name = module.logging.alb_log_bucket_name

  certificate_arn = module.acm.certificate_arn

  tags = var.tags
}

module "frontend" {
  source = "../../modules/frontend"

  project_name = var.project_name
  environment  = var.environment

  frontend_security_group_id = module.security.frontend_security_group_id

  instance_profile_name = module.iam.instance_profile_name

  frontend_target_group_arn = module.alb.frontend_target_group_arn

  private_subnet_ids = module.networking.private_subnet_ids

  instance_type = var.instance_type

  min_size         = var.min_size
  desired_capacity = var.desired_capacity
  max_size         = var.max_size

  tags = var.tags
}

module "ecs" {
  source = "../../modules/ecs"

  project_name = var.project_name
  environment  = var.environment

  backend_security_group_id = module.security.backend_security_group_id

  backend_target_group_arn = module.alb.backend_target_group_arn

  private_subnet_ids = module.networking.private_subnet_ids

  ecs_execution_role_arn = module.iam.ecs_execution_role_arn
  ecs_task_role_arn      = module.iam.ecs_task_role_arn

  backend_image_repository = module.ecr.repository_url
  backend_image_tag        = "v1.0.0"

  database_secret_arn = module.rds.db_secret_arn
  jwt_secret_arn      = module.secrets.jwt_secret_arn


  region = var.region

  tags = var.tags
}

module "rds" {
  source = "../../modules/rds"

  project_name = var.project_name
  environment  = var.environment

  private_subnet_ids = module.networking.private_subnet_ids

  database_security_group_id = module.security.database_security_group_id
  rds_monitoring_role_arn    = module.iam.rds_monitoring_role_arn

  db_name     = var.db_name
  db_username = var.db_username

  tags = var.tags
}

module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment

  tags = var.tags
}

module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment

  tags = var.tags
}

module "route53" {
  source = "../../modules/route53"

  project_name = var.project_name

  domain_name = var.domain_name
  subdomain   = var.subdomain_name

  alb_dns_name = module.alb.alb_dns_name
  alb_zone_id  = module.alb.alb_zone_id

  tags = var.tags
}

module "acm" {
  source = "../../modules/acm"

  project_name = var.project_name

  domain_name = var.domain_name
  subdomain   = var.subdomain_name

  hosted_zone_id = module.route53.hosted_zone_id

  tags = var.tags
}

module "monitoring" {
  source = "../../modules/monitoring"

  project_name = var.project_name
  environment  = var.environment

  region = var.region

  ecs_cluster_name = module.ecs.ecs_cluster_name
  ecs_service_name = module.ecs.ecs_service_name

  db_instance_id = module.rds.db_instance_id

  alb_arn_suffix = module.alb.alb_arn_suffix

  tags = var.tags
}