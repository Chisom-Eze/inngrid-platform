Purpose

Provide Layer 7 traffic routing for InnGrid.

Components

- Application Load Balancer
- Frontend Target Group
- Backend Target Group
- HTTP Listener
- Path-based Routing

Routing

/          -> Frontend
/api/*     -> Backend

Security

- Public ALB
- Private Backend Services
- Security Group Protected

Future Enhancements

- ACM Certificate
- HTTPS Listener (443)
- HTTP to HTTPS Redirect
- WAF Integration