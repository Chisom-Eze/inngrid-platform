resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-igw"
    }
  )
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_a_cidr
  map_public_ip_on_launch = true

  availability_zone = "${var.region}a"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-public-a"
    }
  )
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_b_cidr
  map_public_ip_on_launch = true

  availability_zone = "${var.region}b"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-public-b"
    }
  )
}

resource "aws_subnet" "private_a" {
  vpc_id     = aws_vpc.main.id
  cidr_block = var.private_subnet_a_cidr

  availability_zone = "${var.region}a"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-private-a"
    }
  )
}

resource "aws_subnet" "private_b" {
  vpc_id     = aws_vpc.main.id
  cidr_block = var.private_subnet_b_cidr

  availability_zone = "${var.region}b"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-private-b"
    }
  )
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-public-rt"
    }
  )
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-cluster"
    }
  )
}