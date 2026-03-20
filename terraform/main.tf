terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # bucket, key, region, dynamodb_table은 -backend-config 로 주입
  backend "s3" {
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}

# CloudFront ACM 인증서는 반드시 us-east-1에 있어야 함
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

locals {
  name = "${var.project_name}-${var.stage}"
  default_tags = {
    Project = var.project_name
    Stage   = var.stage
  }
}

# ============================================================
# 공유 리소스 참조 (setup.sh에서 생성됨 - Terraform 외부 관리)
# ============================================================
data "aws_acm_certificate" "wildcard" {
  provider    = aws.us_east_1
  domain      = "*.${var.domain}"
  statuses    = ["ISSUED"]
  most_recent = true
}

data "aws_route53_zone" "this" {
  name = var.domain
}

# ============================================================
# S3 Bucket (정적 파일 호스팅)
# ============================================================
resource "aws_s3_bucket" "fe" {
  bucket = "${local.name}-fe"
  tags   = local.default_tags
}

resource "aws_s3_bucket_public_access_block" "fe" {
  bucket = aws_s3_bucket.fe.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "fe" {
  bucket = aws_s3_bucket.fe.id
  versioning_configuration {
    status = "Enabled"
  }
}

# ============================================================
# CloudFront OAC + Distribution
# ============================================================
resource "aws_cloudfront_origin_access_control" "fe" {
  name                              = "${local.name}-fe"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "fe" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = [var.fe_subdomain]
  price_class         = "PriceClass_200"

  origin {
    domain_name              = aws_s3_bucket.fe.bucket_regional_domain_name
    origin_id                = "s3-${local.name}-fe"
    origin_access_control_id = aws_cloudfront_origin_access_control.fe.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-${local.name}-fe"
    viewer_protocol_policy = "redirect-to-https"
    cached_methods         = ["GET", "HEAD"]
    allowed_methods        = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  # SPA 라우팅: S3 403/404 → index.html 200 반환
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.wildcard.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = local.default_tags
}

# S3 버킷 정책: CloudFront OAC만 접근 허용
resource "aws_s3_bucket_policy" "fe" {
  bucket = aws_s3_bucket.fe.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "AllowCloudFrontOAC"
      Effect = "Allow"
      Principal = {
        Service = "cloudfront.amazonaws.com"
      }
      Action   = "s3:GetObject"
      Resource = "${aws_s3_bucket.fe.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.fe.arn
        }
      }
    }]
  })

  depends_on = [aws_cloudfront_distribution.fe]
}

# ============================================================
# Route53 A Record → CloudFront
# ============================================================
resource "aws_route53_record" "fe" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = var.fe_subdomain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.fe.domain_name
    zone_id                = "Z2FDTNDATAQYW2" # CloudFront global hosted zone ID (고정값)
    evaluate_target_health = false
  }
}
