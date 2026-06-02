Purpose

Provide workload identities and permissions for InnGrid services.

Roles

1. ECS Execution Role
   - Pull images
   - Write logs

2. ECS Task Role
   - Read secrets
   - Access S3

Principles

- Least Privilege
- No AdministratorAccess
- Separation of Duties
- Workload Identity