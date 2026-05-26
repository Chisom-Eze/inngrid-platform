from fastapi import HTTPException, status
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.tenant import InviteUserRequest, TenantCreate, TenantUpdate


def page_query(db: Session, stmt: Select, limit: int, offset: int) -> tuple[list, int]:
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = list(db.scalars(stmt.limit(limit).offset(offset)))
    return items, total


def create_tenant(db: Session, payload: TenantCreate) -> Tenant:
    if db.scalar(select(Tenant).where(Tenant.slug == payload.slug)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tenant slug already exists")
    tenant = Tenant(**payload.model_dump())
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant


def update_tenant(db: Session, tenant: Tenant, payload: TenantUpdate) -> Tenant:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(tenant, key, value)
    db.commit()
    db.refresh(tenant)
    return tenant


def invite_user(db: Session, tenant: Tenant, payload: InviteUserRequest) -> User:
    if payload.role == UserRole.PLATFORM_SUPER_ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot invite platform admins to tenants")
    if db.scalar(select(User).where(User.email == payload.email.lower())):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        tenant_id=tenant.id,
        email=payload.email.lower(),
        full_name=payload.full_name,
        role=payload.role,
        hashed_password=hash_password(payload.temporary_password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
