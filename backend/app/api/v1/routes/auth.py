from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthUser, LoginRequest, RegisterTenantRequest, TokenResponse
from app.services import auth_service

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterTenantRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return auth_service.register_tenant(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return auth_service.login(db, payload)


@router.get("/me", response_model=AuthUser)
def me(user: User = Depends(get_current_user)) -> AuthUser:
    return AuthUser(
        id=user.id,
        tenant_id=user.tenant_id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        tenant_name=user.tenant.name if user.tenant else None,
    )
