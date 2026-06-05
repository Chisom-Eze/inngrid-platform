Purpose

Provide TLS certificates for InnGrid.

Components

- ACM Certificate
- Route53 DNS Validation
- Automatic Certificate Validation

Architecture

Route53
    ↓
ACM Validation
    ↓
Certificate
    ↓
ALB HTTPS Listener