from decimal import Decimal

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import RoomStatus


class Property(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "properties"
    __table_args__ = (UniqueConstraint("tenant_id", "code"),)

    tenant_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    code: Mapped[str] = mapped_column(String(40), nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(120))
    country: Mapped[str | None] = mapped_column(String(120))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    rooms = relationship("Room", back_populates="property")


class RoomCategory(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "room_categories"
    __table_args__ = (UniqueConstraint("tenant_id", "name"),)

    tenant_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    base_rate: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)


class Room(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "rooms"
    __table_args__ = (UniqueConstraint("tenant_id", "property_id", "number"),)

    tenant_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    property_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"))
    category_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("room_categories.id", ondelete="SET NULL"))
    number: Mapped[str] = mapped_column(String(40), nullable=False)
    floor: Mapped[str | None] = mapped_column(String(30))
    capacity: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    status: Mapped[RoomStatus] = mapped_column(Enum(RoomStatus), default=RoomStatus.AVAILABLE, nullable=False)

    property = relationship("Property", back_populates="rooms")
    category = relationship("RoomCategory")
