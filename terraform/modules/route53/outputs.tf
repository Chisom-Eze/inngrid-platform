output "hosted_zone_id" {
  value = aws_route53_zone.this.zone_id
}

output "name_servers" {
  value = aws_route53_zone.this.name_servers
}

output "application_fqdn" {
  value = "${var.subdomain}.${var.domain_name}"
}