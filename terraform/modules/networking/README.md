### Purpose

Provide networking foundation for InnGrid.

### CIDR Strategy

```
VPC:                 10.0.0.0/16

Public Subnet A:     10.0.1.0/24
Public Subnet B:     10.0.2.0/24

Private Subnet A:    10.0.10.0/24
Private Subnet B:    10.0.20.0/24
```

### Availability Strategy

# Multi-AZ deployment

```
AZ-A
AZ-B
```

# Purpose:

- High Availability
- Fault Tolerance

### Security Philosophy

Only ALB exposed publicly.

Protected resources:

+ Frontend EC2
* ECS Fargate
+ PostgreSQL

remain in private subnets.

### Cost Considerations

Use NAT Gateway initially.

# Future optimization:

- VPC Endpoints
- Reduced NAT traffic