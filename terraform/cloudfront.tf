# ============================================
# CloudFront Distribution - Frontend CDN
# ============================================

# Origin Access Control (OAC)
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "deals-vouchers-frontend-OAC"
  description                       = "OAC for S3 frontend bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"

  lifecycle {
    ignore_changes = [name]
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_All"

    web_acl_id = "arn:aws:wafv2:us-east-1:254689257322:global/webacl/CreatedByCloudFront-e7acc214/03c924cd-7166-4245-85c8-b04483f698ed"

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
    origin_id                = "S3-deals-vouchers-frontend"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-deals-vouchers-frontend"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # Use AWS managed cache policy (CachingOptimized)
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    # Response headers policy for CORS + security headers
    response_headers_policy_id = "eaab4381-ed33-4a86-88ca-d9558dc6cd63"
  }

  # SPA routing fix - serve index.html for 403 errors
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# Output
output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.main.domain_name
  description = "CloudFront distribution domain name"
}