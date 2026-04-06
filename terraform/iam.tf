# ============================================
# IAM Roles for Lambda Functions
# ============================================

# ----------------------------
# 1. Deals Read Role
# Used by: getDeals-P2, getDealById-P2
# ----------------------------
resource "aws_iam_role" "deals_read" {
  name = "DealsReadRole-P2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_role_policy" "deals_read_dynamodb" {
  name = "DealsReadDynamoDBPolicy"
  role = aws_iam_role.deals_read.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ]
      Resource = aws_dynamodb_table.deals.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "deals_read_basic" {
  role       = aws_iam_role.deals_read.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ----------------------------
# 2. Vouchers Read Role
# Used by: validateVoucher-P2
# ----------------------------
resource "aws_iam_role" "vouchers_read" {
  name = "VouchersReadRole-P2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_role_policy" "vouchers_read_dynamodb" {
  name = "VouchersReadDynamoDBPolicy"
  role = aws_iam_role.vouchers_read.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ]
      Resource = aws_dynamodb_table.vouchers.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "vouchers_read_basic" {
  role       = aws_iam_role.vouchers_read.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ----------------------------
# 3. Orders Read Role
# Used by: getOrders
# ----------------------------
resource "aws_iam_role" "orders_read" {
  name = "OrdersReadRole-P2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_role_policy" "orders_read_dynamodb" {
  name = "OrdersReadDynamoDBPolicy"
  role = aws_iam_role.orders_read.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query"
      ]
      Resource = aws_dynamodb_table.orders.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "orders_read_basic" {
  role       = aws_iam_role.orders_read.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ----------------------------
# 4. Orders Write Role
# Used by: redeemVoucher, giftVoucher
# ----------------------------
resource "aws_iam_role" "orders_write" {
  name = "OrdersWriteRole-P2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_role_policy" "orders_write_dynamodb" {
  name = "OrdersWriteDynamoDBPolicy"
  role = aws_iam_role.orders_write.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem"
      ]
      Resource = aws_dynamodb_table.orders.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "orders_write_basic" {
  role       = aws_iam_role.orders_write.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ----------------------------
# 5. Order Management Role
# Used by: createOrder-P2
# ----------------------------
resource "aws_iam_role" "order_management" {
  name = "OrderManagementRole-P2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_role_policy" "order_management_dynamodb" {
  name = "OrderManagementDynamoDBPolicy"
  role = aws_iam_role.order_management.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.deals.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.orders.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "order_management_basic" {
  role       = aws_iam_role.order_management.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ----------------------------
# 6. Cognito Trigger Role
# Used by: autoConfirmUser-P2
# ----------------------------
resource "aws_iam_role" "cognito_trigger" {
  name = "CognitoTriggerRole-P2"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_role_policy_attachment" "cognito_trigger_basic" {
  role       = aws_iam_role.cognito_trigger.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}