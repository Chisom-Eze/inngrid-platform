from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.models.enums import ReservationStatus


class GuestCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr | None = None
    phone: str | None = None
    document_number: str | None = None
    notes: str | None = None


class GuestRead(GuestCreate):
    id: UUID
    tenant_id: UUID

    class Config:
        from_attributes = True


class ReservationCreate(BaseModel):
    property_id: UUID
    room_id: UUID | None = None
    guest: GuestCreate
    source: str = "direct"
    check_in_date: date
    check_out_date: date
    adults: int = Field(default=1, ge=1)
    children: int = Field(default=0, ge=0)
    total_amount: Decimal = Field(default=0, ge=0)

    @model_validator(mode="after")
    def dates_are_valid(self) -> "ReservationCreate":
        if self.check_out_date <= self.check_in_date:
            raise ValueError("check_out_date must be after check_in_date")
        return self


class ReservationRead(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    room_id: UUID | None
    guest_id: UUID
    status: ReservationStatus
    source: str
    check_in_date: date
    check_out_date: date
    adults: int
    children: int
    total_amount: Decimal

    class Config:
        from_attributes = True
