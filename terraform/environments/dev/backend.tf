terraform {
  backend "s3" {
    bucket         = "inngrid-dev-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "inngrid-dev-terraform-lock"
    encrypt        = true
  }
}