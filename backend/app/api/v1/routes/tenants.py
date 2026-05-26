from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_tenant_context, require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.common import Page
from app.schemas.tenant import InviteUserRequest, TenantCreate, TenantRead, TenantUpdate, UserRead, UserUpdate
from app.services import tenant_service

router = APIRouter()


@router.get("", response_model=Page[TenantRead])
def list_tenants(
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.PLATFORM_SUPER_ADMIN)),
) -> Page[TenantRead]:
    items, total = tenant_service.page_query(db, select(Tenant).order_by(Tenant.name), limit, offset)
    return Page(items=items, total=total, limit=limit, offset=offset)


@router.post("", response_model=TenantRead, status_code=201)
def create_tenant(
    payload: TenantCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.PLATFORM_SUPER_ADMIN)),
) -> Tenant:
    return tenant_service.create_tenant(db, payload)


@router.get("/current", response_model=TenantRead)
def current_tenant(tenant: Tenant = Depends(get_tenant_context)) -> Tenant:
    return tenant


@router.patch("/current", response_model=TenantRead)
def update_current_tenant(
    payload: TenantUpdate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.PLATFORM_SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)),
) -> Tenant:
    return tenant_service.update_tenant(db, tenant, payload)


@router.post("/current/users", response_model=UserRead, status_code=201)
def invite_user(
    payload: InviteUserRequest,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.PLATFORM_SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)),
) -> User:
    return tenant_service.invite_user(db, tenant, payload)


@router.get("/current/users", response_model=Page[UserRead])
def list_users(
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.PLATFORM_SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)),
) -> Page[UserRead]:
    stmt = select(User).where(User.tenant_id == tenant.id).order_by(User.full_name)
    items, total = tenant_service.page_query(db, stmt, limit, offset)
    return Page(items=items, total=total, limit=limit, offset=offset)


@router.patch("/current/users/{user_id}/deactivate", response_model=UserRead)
def deactivate_user(
    user_id: UUID,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.PLATFORM_SUPER_ADMIN, UserRole.TENANT_ADMIN)),
) -> User:
    user = db.scalar(select(User).where(User.id == user_id, User.tenant_id == tenant.id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/current/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: UUID,
    payload: UserUpdate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.PLATFORM_SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)),
) -> User:
    user = db.scalar(select(User).where(User.id == user_id, User.tenant_id == tenant.id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return tenant_service.update_user(db, tenant, user, payload.full_name, payload.role, payload.is_active)
