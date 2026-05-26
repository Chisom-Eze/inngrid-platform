from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import TenantType, UserRole


class RegisterTenantRequest(BaseModel):
    organization_name: str = Field(min_length=2, max_length=160)
    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")
    business_type: TenantType
    admin_full_name: str = Field(min_length=2, max_length=160)
    admin_email: EmailStr
    admin_password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthUser(BaseModel):
    id: UUID
    tenant_id: UUID | None
    email: EmailStr
    full_name: str
    role: UserRole
    tenant_name: str | None = None
