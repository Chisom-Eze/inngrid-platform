resource "aws_s3_bucket" "frontend_artifacts" {
  bucket = "${var.project_name}-${var.environment}-artifacts"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-artifacts"
    }
  )
}

resource "aws_s3_bucket_versioning" "frontend_artifacts" {
  bucket = aws_s3_bucket.frontend_artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_artifacts" {
  bucket = aws_s3_bucket.frontend_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

#tfsec:ignore:aws-s3-encryption-customer-key
resource "aws_s3_bucket_server_side_encryption_configuration" "frontend_artifacts" {
  bucket = aws_s3_bucket.frontend_artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}