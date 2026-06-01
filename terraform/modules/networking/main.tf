resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-${var.environment}-igw"
    Environment = var.environment
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_a_cidr
  map_public_ip_on_launch = true

  availability_zone = "${var.region}a"

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-a"
    Environment = var.environment
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_b_cidr
  map_public_ip_on_launch = true

  availability_zone = "${var.region}b"

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-b"
    Environment = var.environment
  }
}

resource "aws_subnet" "private_a" {
  vpc_id     = aws_vpc.main.id
  cidr_block = var.private_subnet_a_cidr

  availability_zone = "${var.region}a"

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-a"
    Environment = var.environment
  }
}

resource "aws_subnet" "private_b" {
  vpc_id     = aws_vpc.main.id
  cidr_block = var.private_subnet_b_cidr

  availability_zone = "${var.region}b"

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-b"
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}