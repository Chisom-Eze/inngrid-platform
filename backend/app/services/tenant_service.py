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
    data = payload.model_dump()
    data["preferred_currency"] = data["preferred_currency"].upper()
    tenant = Tenant(**data)
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant


def update_tenant(db: Session, tenant: Tenant, payload: TenantUpdate) -> Tenant:
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key == "preferred_currency" and value:
            value = value.upper()
        setattr(tenant, key, value)
    db.commit()
    db.refresh(tenant)
    return tenant


def invite_user(db: Session, tenant: Tenant, payload: InviteUserRequest) -> User:
    if payload.role in {UserRole.PLATFORM_SUPER_ADMIN, UserRole.TENANT_ADMIN}:
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


def update_user(db: Session, tenant: Tenant, user: User, full_name: str | None, role: UserRole | None, is_active: bool | None) -> User:
    if role in {UserRole.PLATFORM_SUPER_ADMIN, UserRole.TENANT_ADMIN}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot assign platform or tenant admin role here")
    if user.tenant_id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if full_name is not None:
        user.full_name = full_name
    if role is not None:
        user.role = role
    if is_active is not None:
        user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user
