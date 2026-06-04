# Secrets Manager Module

## Purpose

Provide secure storage for application secrets.

## Components

- JWT Secret
- Future API Secrets
- Future Third-Party Credentials

## Security Principles

- No hardcoded secrets
- Secrets stored in AWS Secrets Manager
- Access controlled through IAM
- Application retrieval at runtime

## Architecture

Secrets Manager
       ↓
IAM Role
       ↓
ECS Task
       ↓
Application

## Notes

Database credentials are managed by the RDS module through AWS-managed password generation.