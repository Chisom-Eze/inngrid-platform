from collections.abc import Callable
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.tenant import Tenant
from app.models.user import User

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    try:
        payload = decode_token(credentials.credentials)
        user_id = UUID(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid bearer token") from None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is inactive or missing")
    return user


def require_roles(*roles: UserRole) -> Callable[[User], User]:
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency


def get_tenant_context(
    x_tenant_id: UUID | None = Header(default=None, alias="X-Tenant-ID"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Tenant:
    if user.role == UserRole.PLATFORM_SUPER_ADMIN:
        if x_tenant_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="X-Tenant-ID header is required")
        tenant_id = x_tenant_id
    elif user.tenant_id:
        tenant_id = user.tenant_id
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not assigned to a tenant")

    tenant = db.get(Tenant, tenant_id)
    if tenant is None or not tenant.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return tenant
