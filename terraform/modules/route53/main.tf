resource "aws_route53_zone" "this" {
  name = var.domain_name

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-hosted-zone"
    }
  )
}

resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.this.zone_id

  name = var.subdomain

  type = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}
