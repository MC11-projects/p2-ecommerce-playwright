# ============================================
# Cognito User Pool
# ============================================

resource "aws_cognito_user_pool" "main" {
  name = "DailyDeals-UserPool-P2"

  # CRITICAL: Must match AWS to avoid replacement
  username_attributes = ["email"]
  deletion_protection = "ACTIVE"

  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # Lambda triggers
  lambda_config {
    pre_sign_up = aws_lambda_function.auto_confirm_user.arn
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
  lifecycle {
    ignore_changes = [schema]
  }
}

# App Client
resource "aws_cognito_user_pool_client" "web_client" {
  name         = "DailyDeals-WebClient"
  user_pool_id = aws_cognito_user_pool.main.id

  # OAuth settings - match current AWS config
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "phone"]
  
  # Update to new CloudFront URL
  callback_urls = ["https://d31p8cguca5y8k.cloudfront.net"]
  logout_urls   = ["https://d31p8cguca5y8k.cloudfront.net"]

  # Token validity - match current
  refresh_token_validity = 5
  access_token_validity  = 60
  id_token_validity      = 60

  token_validity_units {
    refresh_token = "days"
    access_token  = "minutes"
    id_token      = "minutes"
  }

  # Auth flows - match current AWS
  explicit_auth_flows = [
    "ALLOW_USER_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  prevent_user_existence_errors = "ENABLED"
}

# Lambda permission for Cognito trigger
resource "aws_lambda_permission" "cognito_trigger" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auto_confirm_user.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}