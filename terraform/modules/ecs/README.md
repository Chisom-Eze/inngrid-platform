### Purpose

Provide backend compute runtime for InnGrid.

Components

- ECS Cluster
- Fargate Service
- Task Definition
- CloudWatch Logs

Architecture

Internet
    ↓
ALB
    ↓
Backend Target Group
    ↓
ECS Service