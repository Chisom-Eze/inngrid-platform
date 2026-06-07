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

- WAF Integration

Observability

- ALB Access Logs
- CloudWatch Alarms
- Health Checks

Monitoring

- HTTP 5XX Detection
- Request Visibility
- Traffic Analysis