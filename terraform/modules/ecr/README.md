# ECR Module

## Purpose

Provide a secure container image registry for InnGrid workloads.

This module creates and manages Amazon Elastic Container Registry (ECR) repositories used by ECS services.

---

## Components

### ECR Repository

Stores Docker container images for:

- Backend API
- Future microservices
- Frontend containers (if required)

### Lifecycle Policy

Automatically removes old images to reduce storage costs.

Current policy:

- Retain latest 20 images
- Expire older images

### Image Scanning

Image vulnerability scanning is enabled on image push.

---

## Architecture

Developer
    ↓
GitHub Actions
    ↓
Docker Build
    ↓
Amazon ECR
    ↓
Amazon ECS

---

## Security

- Private repository
- Image scanning enabled
- IAM-controlled access
- No public image access

---

## Outputs

- Repository Name
- Repository ARN
- Repository URL

---

## Future Enhancements

- Immutable image tags
- Multiple repositories
- Cross-account image replication
- Enhanced vulnerability scanning

---

## Design Principles

- Least Privilege
- Secure Image Storage
- Cost Optimization
- CI/CD Integration