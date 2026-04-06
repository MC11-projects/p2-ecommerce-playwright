# Deals-P2 Table
resource "aws_dynamodb_table" "deals" {
  name           = "Deals-P2"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "dealId"

  attribute {
    name = "dealId"
    type = "S"
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# Orders-P2 Table
resource "aws_dynamodb_table" "orders" {
  name           = "Orders-P2"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "orderId"

  attribute {
    name = "orderId"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}

# Vouchers-P2 Table
resource "aws_dynamodb_table" "vouchers" {
  name           = "Vouchers-P2"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "voucherCode"

  attribute {
    name = "voucherCode"
    type = "S"
  }

  tags = {
    Project     = "P2-Ecommerce"
    Environment = "Dev"
    ManagedBy   = "Terraform"
  }
}