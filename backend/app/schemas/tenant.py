from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import TenantType, UserRole


class TenantBase(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")
    business_type: TenantType
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=40)
    timezone: str = "UTC"
    property_category: str | None = Field(default=None, max_length=120)
    city: str | None = Field(default=None, max_length=120)
    country: str | None = Field(default=None, max_length=120)
    preferred_currency: str = Field(default="USD", min_length=3, max_length=3)


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    business_type: TenantType | None = None
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=40)
    timezone: str | None = None
    property_category: str | None = Field(default=None, max_length=120)
    city: str | None = Field(default=None, max_length=120)
    country: str | None = Field(default=None, max_length=120)
    preferred_currency: str | None = Field(default=None, min_length=3, max_length=3)
    is_active: bool | None = None


class TenantRead(TenantBase):
    id: UUID
    is_active: bool

    class Config:
        from_attributes = True


class InviteUserRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=160)
    role: UserRole
    temporary_password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=160)
    role: UserRole | None = None
    is_active: bool | None = None


class UserRead(BaseModel):
    id: UUID
    tenant_id: UUID | None
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
