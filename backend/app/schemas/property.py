from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import RoomStatus


class PropertyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    code: str = Field(min_length=2, max_length=40)
    address: str | None = None
    city: str | None = None
    country: str | None = None


class PropertyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    address: str | None = None
    city: str | None = None
    country: str | None = None
    is_active: bool | None = None


class PropertyRead(PropertyCreate):
    id: UUID
    tenant_id: UUID
    is_active: bool

    class Config:
        from_attributes = True


class RoomCategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None
    base_rate: Decimal = Field(default=0, ge=0)


class RoomCategoryRead(RoomCategoryCreate):
    id: UUID
    tenant_id: UUID

    class Config:
        from_attributes = True


class RoomCreate(BaseModel):
    property_id: UUID
    category_id: UUID | None = None
    number: str = Field(min_length=1, max_length=40)
    floor: str | None = Field(default=None, max_length=30)
    capacity: int = Field(default=2, ge=1)
    status: RoomStatus = RoomStatus.AVAILABLE


class RoomUpdate(BaseModel):
    category_id: UUID | None = None
    floor: str | None = Field(default=None, max_length=30)
    capacity: int | None = Field(default=None, ge=1)
    status: RoomStatus | None = None


class RoomRead(RoomCreate):
    id: UUID
    tenant_id: UUID

    class Config:
        from_attributes = True
