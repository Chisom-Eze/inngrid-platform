# Frontend Module

## Purpose

Provide the frontend runtime layer for InnGrid.

## Components

- EC2 Instance
- Ubuntu 24.04 LTS
- Nginx Web Server
- ALB Target Group Registration
- User Data Bootstrap

## Architecture

Internet
    ↓
ALB
    ↓
Frontend EC2

## Security

- Security Group Protected
- Managed Through IAM Instance Profile
- No Direct Database Access

## Design Decisions

- Dynamic Ubuntu AMI Discovery
- Template-based User Data
- Standardized Resource Tagging

## Future Enhancements

- Auto Scaling Group
- Launch Templates
- CloudWatch Agent
- SSM Session Manager