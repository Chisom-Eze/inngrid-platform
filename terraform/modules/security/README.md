# Purpose

Provide security controls for InnGrid infrastructure using AWS Security Groups.

Security Model
```
Internet
   ↓
ALB
   ↓
Frontend
   ↓
Backend
   ↓
Database

Principles

- Least Privilege
- Defense in Depth
- No Direct Database Exposure
- No Public Backend Access
- Single Public Entry Point (ALB)
```
# Security Group #1

## ALB Security Group
Allow:
```
80
443
```

From:
```
0.0.0.0/0
```

Why?

Because customers must reach the application.

# Security Group #2
## Frontend EC2 Security Group

Allow:
```
3000
```

From:
```
ALB Security Group
```
NOT:
```
0.0.0.0/0
```
This is the first major least-privilege rule.

# Security Group #3
## Backend ECS Security Group

Allow:
```
8000
```
From:
```
Frontend Security Group
```
Only.

Not from the internet.

Not from every subnet.

Only from frontend.

# Security Group #4
## Database Security Group

Allow:
```
5432
```
From:
```
ECS Security Group
```
Only.

### Frontend Security Group

Purpose:

Protect frontend EC2 instances.

Ingress:

- TCP 3000
- Source: ALB Security Group

Egress:

- All outbound traffic

Rationale:

Frontend services should only accept requests routed through the Application Load Balancer.

```
Internet
    ↓
ALB
    ↓
Frontend
    ↓
Backend
    ↓
Database
```