data "aws_ami" "ubuntu" {
  most_recent = true

  owners = ["099720109477"]

  filter {
    name = "name"

    values = [
      "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"
    ]
  }

  filter {
    name = "virtualization-type"

    values = ["hvm"]
  }
}

locals {
  user_data = templatefile(
    "${path.module}/user-data.sh.tpl",
    {
      environment = var.environment
    }
  )
}

resource "aws_instance" "frontend" {
  ami = data.aws_ami.ubuntu.id

  instance_type = var.instance_type

  subnet_id = var.public_subnet_id

  vpc_security_group_ids = [
    var.frontend_security_group_id
  ]

  iam_instance_profile = var.instance_profile_name

  user_data = local.user_data

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-frontend"
    }
  )
}

resource "aws_lb_target_group_attachment" "frontend" {
  target_group_arn = var.frontend_target_group_arn

  target_id = aws_instance.frontend.id

  port = 80
}

