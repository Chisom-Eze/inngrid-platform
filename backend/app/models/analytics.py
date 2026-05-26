from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import AnalyticsEventType


class AnalyticsEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "analytics_events"

    tenant_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    property_id: Mapped[UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="SET NULL"))
    event_type: Mapped[AnalyticsEventType] = mapped_column(Enum(AnalyticsEventType), nullable=False)
    amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    event_metadata: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
