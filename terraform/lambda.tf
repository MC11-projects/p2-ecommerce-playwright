# ============================================
# Lambda Functions
# ============================================

# ----------------------------
# 1. getDeals-P2
# ----------------------------
resource "aws_lambda_function" "get_deals" {
  filename         = "../lambda-code/getDeals-P2.zip"
  function_name    = "getDeals-P2"
  role            = aws_iam_role.deals_read.arn
  handler         = "index.handler"
  runtime         = "nodejs24.x"
  source_code_hash = filebase64sha256("../lambda-code/getDeals-P2.zip")

  environment {
    variables = {
      DEALS_TABLE = aws_dynamodb_table.deals.name
    }
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# ----------------------------
# 2. getDealById-P2
# ----------------------------
resource "aws_lambda_function" "get_deal_by_id" {
  filename         = "../lambda-code/getDealById-P2.zip"
  function_name    = "getDealById-P2"
  role            = aws_iam_role.deals_read.arn
  handler         = "index.handler"
  runtime         = "nodejs24.x"
  source_code_hash = filebase64sha256("../lambda-code/getDealById-P2.zip")

  environment {
    variables = {
      DEALS_TABLE = aws_dynamodb_table.deals.name
    }
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# ----------------------------
# 3. validateVoucher-P2
# ----------------------------
resource "aws_lambda_function" "validate_voucher" {
  filename         = "../lambda-code/validateVoucher-P2.zip"
  function_name    = "validateVoucher-P2"
  role            = aws_iam_role.vouchers_read.arn
  handler         = "index.handler"
  runtime         = "nodejs24.x"
  source_code_hash = filebase64sha256("../lambda-code/validateVoucher-P2.zip")

  environment {
    variables = {
      VOUCHERS_TABLE = aws_dynamodb_table.vouchers.name
    }
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# ----------------------------
# 4. getOrders
# ----------------------------
resource "aws_lambda_function" "get_orders" {
  filename         = "../lambda-code/getOrders.zip"
  function_name    = "getOrders"
  role            = aws_iam_role.orders_read.arn
  handler         = "index.handler"
  runtime         = "nodejs24.x"
  source_code_hash = filebase64sha256("../lambda-code/getOrders.zip")

  environment {
    variables = {
      ORDERS_TABLE = aws_dynamodb_table.orders.name
    }
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# ----------------------------
# 5. redeemVoucher
# ----------------------------
resource "aws_lambda_function" "redeem_voucher" {
  filename         = "../lambda-code/redeemVoucher.zip"
  function_name    = "redeemVoucher"
  role            = aws_iam_role.orders_write.arn
  handler         = "index.handler"
  runtime         = "nodejs24.x"
  source_code_hash = filebase64sha256("../lambda-code/redeemVoucher.zip")

  environment {
    variables = {
      ORDERS_TABLE = aws_dynamodb_table.orders.name
    }
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# ----------------------------
# 6. giftVoucher
# ----------------------------
resource "aws_lambda_function" "gift_voucher" {
  filename         = "../lambda-code/giftVoucher.zip"
  function_name    = "giftVoucher"
  role            = aws_iam_role.orders_write.arn
  handler         = "index.handler"
  runtime         = "nodejs24.x"
  source_code_hash = filebase64sha256("../lambda-code/giftVoucher.zip")

  environment {
    variables = {
      ORDERS_TABLE = aws_dynamodb_table.orders.name
    }
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# ----------------------------
# 7. createOrder-P2
# ----------------------------
resource "aws_lambda_function" "create_order" {
  filename         = "../lambda-code/createOrder-P2.zip"
  function_name    = "createOrder-P2"
  role            = aws_iam_role.order_management.arn
  handler         = "index.handler"
  runtime         = "nodejs24.x"
  source_code_hash = filebase64sha256("../lambda-code/createOrder-P2.zip")

  environment {
    variables = {
      DEALS_TABLE  = aws_dynamodb_table.deals.name
      ORDERS_TABLE = aws_dynamodb_table.orders.name
    }
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# ----------------------------
# 8. autoConfirmUser-P2
# ----------------------------
resource "aws_lambda_function" "auto_confirm_user" {
  filename         = "../lambda-code/autoConfirmUser-P2.zip"
  function_name    = "autoConfirmUser-P2"
  role            = aws_iam_role.cognito_trigger.arn
  handler         = "index.handler"
  runtime         = "nodejs24.x"
  source_code_hash = filebase64sha256("../lambda-code/autoConfirmUser-P2.zip")

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}