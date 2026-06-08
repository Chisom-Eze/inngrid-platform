output "alb_log_bucket_id" {
  value = aws_s3_bucket.alb_logs.id
}

output "alb_log_bucket_arn" {
  value = aws_s3_bucket.alb_logs.arn
}

output "alb_log_bucket_name" {
  value = aws_s3_bucket.alb_logs.bucket
}