# InnGrid

InnGrid is a production-style multi-tenant B2B SaaS platform for hospitality operations across hotels, resorts, Airbnb operators, luxury apartments, airport lounges, and hospitality management groups.

## Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS, Recharts
- Backend: FastAPI, SQLAlchemy 2, Alembic, Pydantic
- Database: PostgreSQL
- Auth: JWT bearer tokens with bcrypt password hashing
- Architecture: modular monolith, RESTful APIs, tenant-aware data access, RBAC

## Local Run

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

Seeded demo login:

- Email: `admin@demoinngrid.com`
- Password: `Password123!`

## Project Structure

```
backend/
  alembic/                 Database migrations
  app/
    api/                   FastAPI routers and dependencies
    core/                  config, security, logging
    db/                    SQLAlchemy base/session
    models/                database models and enums
    schemas/               Pydantic request/response models
    scripts/               local seed data
    services/              business logic and tenant enforcement
frontend/
  app/                     Next.js app router pages
  components/              layout, auth, and UI components
  lib/                     API client, RBAC helpers, shared types
docker-compose.yml         PostgreSQL, API, and frontend
```

## Multi-Tenancy Model

InnGrid uses a shared database with tenant-scoped rows. Operational records carry `tenant_id`, and API access resolves a tenant context from the authenticated user. Platform super admins can act across tenants only when an `X-Tenant-ID` header is supplied; tenant users are restricted to their assigned tenant.

## RBAC

Roles:

- `PLATFORM_SUPER_ADMIN`
- `TENANT_ADMIN`
- `MANAGER`
- `RECEPTIONIST`
- `ACCOUNTANT`
- `OPERATIONS_STAFF`

Backend routes enforce role permissions with FastAPI dependencies. The frontend also renders navigation based on the signed-in user's role.

## Core API Areas

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/tenants/current`
- `POST /api/v1/tenants/current/users`
- `GET /api/v1/properties`
- `POST /api/v1/properties`
- `GET /api/v1/properties/rooms`
- `POST /api/v1/properties/rooms`
- `POST /api/v1/reservations`
- `POST /api/v1/reservations/{id}/check-in`
- `POST /api/v1/reservations/{id}/check-out`
- `POST /api/v1/reservations/{id}/cancel`
- `GET /api/v1/reservations/guests`
- `POST /api/v1/reservations/guests`
- `GET /api/v1/analytics/dashboard`

## Notes

Infrastructure code is intentionally omitted. The Compose setup is for local development only; the app is shaped so the frontend can later run on EC2 and the backend on ECS Fargate without changing the application architecture.
# CI trigger
