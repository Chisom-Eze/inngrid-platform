output "bucket_name" {
  value = aws_s3_bucket.frontend_artifacts.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.frontend_artifacts.arn
}