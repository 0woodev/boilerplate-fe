output "s3_bucket_name" {
  description = "FE 정적 파일 S3 버킷명"
  value       = aws_s3_bucket.fe.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.fe.id
}

output "fe_url" {
  description = "FE URL"
  value       = "https://${var.fe_domain}"
}
