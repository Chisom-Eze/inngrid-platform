# Remote State Module

## Overview

The Remote State module provisions the infrastructure required to store and protect Terraform state in AWS.

It creates:

* Amazon S3 bucket for Terraform state storage
* DynamoDB table for state locking
* S3 server-side encryption
* S3 versioning
* Public access restrictions
* Lifecycle management for old state versions

## Purpose

Terraform state is critical infrastructure metadata that tracks managed resources.

Storing state locally introduces risks:

* State loss due to workstation failure
* Accidental state corruption
* Lack of collaboration support
* Concurrent modification conflicts

This module provides a centralized and production-ready backend for Terraform state management.

## Resources

### S3 Bucket

Used to store Terraform state files.

Features:

* Server-side encryption (AES256)
* Versioning enabled
* Public access blocked
* Lifecycle management

### DynamoDB Table

Used for Terraform state locking.

Benefits:

* Prevents concurrent state modifications
* Protects against corruption during deployments
* Enables safe team collaboration

## Security

### Encryption

State files are encrypted at rest using AWS-managed encryption.

### Public Access Protection

All forms of public access are blocked.

### Versioning

State history is retained through S3 versioning.

This enables recovery from:

* Accidental deletions
* State corruption
* Misconfigured deployments

## Lifecycle Management

Old non-current object versions are automatically removed after 90 days to reduce storage growth.

## Outputs

| Output            | Description                 |
| ----------------- | --------------------------- |
| state_bucket_name | Terraform state bucket name |
| lock_table_name   | DynamoDB lock table name    |

## Deployment Strategy

### Phase 1

Provision:

* S3 Bucket
* DynamoDB Lock Table

### Phase 2

Configure Terraform backend:

```hcl
terraform {
  backend "s3" {
    bucket         = "..."
    key            = "..."
    region         = "..."
    dynamodb_table = "..."
  }
}
```

### Phase 3

Migrate local state to remote state.

## Operational Benefits

* Team collaboration
* State locking
* State recovery
* Change tracking
* Production-ready Terraform workflow
