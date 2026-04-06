# ============================================
# API Gateway - DealsVouchersAPI-P2
# ============================================

# ----------------------------
# 1. REST API
# ----------------------------
resource "aws_api_gateway_rest_api" "main" {
  name        = "DealsVouchersAPI-P2"
  description = "API for P2 Ecommerce Application"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# ----------------------------
# 2. Cognito Authorizer
# ----------------------------
resource "aws_api_gateway_authorizer" "cognito" {
  name            = "CognitoAuthorizer"
  rest_api_id     = aws_api_gateway_rest_api.main.id
  type            = "COGNITO_USER_POOLS"
  provider_arns   = ["arn:aws:cognito-idp:us-east-1:254689257322:userpool/us-east-1_YXmExZcxg"]
  identity_source = "method.request.header.Authorization"
}

# ----------------------------
# 3. Resources (Paths)
# ----------------------------

# /deals
resource "aws_api_gateway_resource" "deals" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "deals"
}

# /deals/{dealId}
resource "aws_api_gateway_resource" "deal_by_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.deals.id
  path_part   = "{dealId}"
}

# /orders
resource "aws_api_gateway_resource" "orders" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "orders"
}

# /orders/{orderId}
resource "aws_api_gateway_resource" "order_by_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.orders.id
  path_part   = "{orderId}"
}

# /orders/{orderId}/vouchers
resource "aws_api_gateway_resource" "order_vouchers" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.order_by_id.id
  path_part   = "vouchers"
}

# /orders/{orderId}/vouchers/{voucherId}
resource "aws_api_gateway_resource" "order_voucher_by_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.order_vouchers.id
  path_part   = "{voucherId}"
}

# /orders/{orderId}/vouchers/{voucherId}/gift
resource "aws_api_gateway_resource" "order_voucher_gift" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.order_voucher_by_id.id
  path_part   = "gift"
}

# /orders/{orderId}/vouchers/{voucherId}/redeem
resource "aws_api_gateway_resource" "order_voucher_redeem" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.order_voucher_by_id.id
  path_part   = "redeem"
}

# /orders/{orderId}/vouchers/validate
resource "aws_api_gateway_resource" "order_vouchers_validate" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.order_vouchers.id
  path_part   = "validate"
}

# /vouchers
resource "aws_api_gateway_resource" "vouchers" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "vouchers"
}

# /vouchers/validate
resource "aws_api_gateway_resource" "vouchers_validate" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.vouchers.id
  path_part   = "validate"
}

# ----------------------------
# 4. Methods & Integrations
# ----------------------------

# GET /deals (public)
resource "aws_api_gateway_method" "get_deals" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.deals.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_deals" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.deals.id
  http_method             = aws_api_gateway_method.get_deals.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_deals.invoke_arn
}

# GET /deals/{dealId} (public)
resource "aws_api_gateway_method" "get_deal_by_id" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.deal_by_id.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_deal_by_id" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.deal_by_id.id
  http_method             = aws_api_gateway_method.get_deal_by_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_deal_by_id.invoke_arn
}

# GET /orders (auth required)
resource "aws_api_gateway_method" "get_orders" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.orders.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_orders" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.orders.id
  http_method             = aws_api_gateway_method.get_orders.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_orders.invoke_arn
}

# POST /orders (auth required)
resource "aws_api_gateway_method" "post_orders" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.orders.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "post_orders" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.orders.id
  http_method             = aws_api_gateway_method.post_orders.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.create_order.invoke_arn
}

# PUT /orders/{orderId}/vouchers/{voucherId}/gift (auth required)
resource "aws_api_gateway_method" "put_order_voucher_gift" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.order_voucher_gift.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "put_order_voucher_gift" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.order_voucher_gift.id
  http_method             = aws_api_gateway_method.put_order_voucher_gift.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.gift_voucher.invoke_arn
}

# PUT /orders/{orderId}/vouchers/{voucherId}/redeem (auth required)
resource "aws_api_gateway_method" "put_order_voucher_redeem" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.order_voucher_redeem.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "put_order_voucher_redeem" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.order_voucher_redeem.id
  http_method             = aws_api_gateway_method.put_order_voucher_redeem.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.redeem_voucher.invoke_arn
}

# POST /orders/{orderId}/vouchers/validate (auth required)
resource "aws_api_gateway_method" "post_order_vouchers_validate" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.order_vouchers_validate.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "post_order_vouchers_validate" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.order_vouchers_validate.id
  http_method             = aws_api_gateway_method.post_order_vouchers_validate.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.validate_voucher.invoke_arn
}

# POST /vouchers/validate (auth required)
resource "aws_api_gateway_method" "post_vouchers_validate" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.vouchers_validate.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "post_vouchers_validate" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.vouchers_validate.id
  http_method             = aws_api_gateway_method.post_vouchers_validate.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.validate_voucher.invoke_arn
}

# ----------------------------
# 5. Lambda Permissions
# ----------------------------

resource "aws_lambda_permission" "get_deals" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_deals.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_deal_by_id" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_deal_by_id.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_orders" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_orders.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "create_order" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_order.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "gift_voucher" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.gift_voucher.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "redeem_voucher" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.redeem_voucher.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "validate_voucher" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.validate_voucher.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# ----------------------------
# 6. Deployment & Stage
# ----------------------------

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_method.get_deals.id,
      aws_api_gateway_method.get_deal_by_id.id,
      aws_api_gateway_method.get_orders.id,
      aws_api_gateway_method.post_orders.id,
      aws_api_gateway_method.put_order_voucher_gift.id,
      aws_api_gateway_method.put_order_voucher_redeem.id,
      aws_api_gateway_method.post_order_vouchers_validate.id,
      aws_api_gateway_method.post_vouchers_validate.id,
      aws_api_gateway_integration.get_deals.id,
      aws_api_gateway_integration.get_deal_by_id.id,
      aws_api_gateway_integration.get_orders.id,
      aws_api_gateway_integration.post_orders.id,
      aws_api_gateway_integration.put_order_voucher_gift.id,
      aws_api_gateway_integration.put_order_voucher_redeem.id,
      aws_api_gateway_integration.post_order_vouchers_validate.id,
      aws_api_gateway_integration.post_vouchers_validate.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_method.get_deals,
    aws_api_gateway_method.get_deal_by_id,
    aws_api_gateway_method.get_orders,
    aws_api_gateway_method.post_orders,
    aws_api_gateway_method.put_order_voucher_gift,
    aws_api_gateway_method.put_order_voucher_redeem,
    aws_api_gateway_method.post_order_vouchers_validate,
    aws_api_gateway_method.post_vouchers_validate,
    aws_api_gateway_integration.get_deals,
    aws_api_gateway_integration.get_deal_by_id,
    aws_api_gateway_integration.get_orders,
    aws_api_gateway_integration.post_orders,
    aws_api_gateway_integration.put_order_voucher_gift,
    aws_api_gateway_integration.put_order_voucher_redeem,
    aws_api_gateway_integration.post_order_vouchers_validate,
    aws_api_gateway_integration.post_vouchers_validate,
  ]
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "prod"

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# ----------------------------
# 7. Outputs
# ----------------------------

output "api_gateway_url" {
  value       = aws_api_gateway_stage.prod.invoke_url
  description = "API Gateway prod stage URL"
}

output "api_gateway_id" {
  value       = aws_api_gateway_rest_api.main.id
  description = "API Gateway REST API ID"
}