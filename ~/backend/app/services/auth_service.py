from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import UserRole
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterTenantRequest, TokenResponse


def register_tenant(db: Session, payload: RegisterTenantRequest) -> TokenResponse:
    existing = db.scalar(select(Tenant).where(Tenant.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tenant slug already exists")
    existing_user = db.scalar(select(User).where(User.email == payload.admin_email.lower()))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    tenant = Tenant(name=payload.organization_name, slug=payload.slug, business_type=payload.business_type)
    db.add(tenant)
    db.flush()

    user = User(
        tenant_id=tenant.id,
        email=payload.admin_email.lower(),
        full_name=payload.admin_full_name,
        hashed_password=hash_password(payload.admin_password),
        role=UserRole.TENANT_ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, tenant_id=user.tenant_id, role=user.role.value)
    return TokenResponse(access_token=token)


def login(db: Session, payload: LoginRequest) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")

    token = create_access_token(subject=user.id, tenant_id=user.tenant_id, role=user.role.value)
    return TokenResponse(access_token=token)
