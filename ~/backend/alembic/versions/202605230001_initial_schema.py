"""initial schema

Revision ID: 202605230001
Revises:
Create Date: 2026-05-23
"""
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "202605230001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def uuid_pk() -> sa.Column:
    return sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid4)


def timestamps() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    ]


def upgrade() -> None:
    tenant_type = postgresql.ENUM("HOTEL", "RESORT", "AIRBNB_OPERATOR", "AIRPORT_LOUNGE", "HOSPITALITY_GROUP", name="tenanttype")
    role = postgresql.ENUM("PLATFORM_SUPER_ADMIN", "TENANT_ADMIN", "RECEPTIONIST", "ACCOUNTANT", "OPERATIONS_STAFF", name="userrole")
    room_status = postgresql.ENUM("AVAILABLE", "OCCUPIED", "MAINTENANCE", "OUT_OF_SERVICE", name="roomstatus")
    reservation_status = postgresql.ENUM("PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW", name="reservationstatus")
    event_type = postgresql.ENUM("RESERVATION_CREATED", "CHECK_IN", "CHECK_OUT", "PAYMENT_POSTED", "ROOM_MAINTENANCE", name="analyticseventtype")

    tenant_type.create(op.get_bind(), checkfirst=True)
    role.create(op.get_bind(), checkfirst=True)
    room_status.create(op.get_bind(), checkfirst=True)
    reservation_status.create(op.get_bind(), checkfirst=True)
    event_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "tenants",
        uuid_pk(),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("business_type", tenant_type, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("timezone", sa.String(length=80), nullable=False, server_default="UTC"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        *timestamps(),
        sa.UniqueConstraint("slug"),
    )

    op.create_table(
        "users",
        uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", role, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        *timestamps(),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "properties",
        uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("code", sa.String(length=40), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(length=120), nullable=True),
        sa.Column("country", sa.String(length=120), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        *timestamps(),
        sa.UniqueConstraint("tenant_id", "code"),
    )

    op.create_table(
        "room_categories",
        uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("base_rate", sa.Numeric(12, 2), nullable=False, server_default="0"),
        *timestamps(),
        sa.UniqueConstraint("tenant_id", "name"),
    )

    op.create_table(
        "rooms",
        uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("room_categories.id", ondelete="SET NULL"), nullable=True),
        sa.Column("number", sa.String(length=40), nullable=False),
        sa.Column("floor", sa.String(length=30), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=False, server_default="2"),
        sa.Column("status", room_status, nullable=False, server_default="AVAILABLE"),
        *timestamps(),
        sa.UniqueConstraint("tenant_id", "property_id", "number"),
    )

    op.create_table(
        "guests",
        uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("document_number", sa.String(length=80), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *timestamps(),
    )

    op.create_table(
        "reservations",
        uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("properties.id", ondelete="CASCADE"), nullable=False),
        sa.Column("room_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True),
        sa.Column("guest_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("guests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", reservation_status, nullable=False, server_default="PENDING"),
        sa.Column("source", sa.String(length=80), nullable=False, server_default="direct"),
        sa.Column("check_in_date", sa.Date(), nullable=False),
        sa.Column("check_out_date", sa.Date(), nullable=False),
        sa.Column("checked_in_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("checked_out_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("adults", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("children", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        *timestamps(),
    )

    op.create_table(
        "analytics_events",
        uuid_pk(),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("property_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("properties.id", ondelete="SET NULL"), nullable=True),
        sa.Column("event_type", event_type, nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        *timestamps(),
    )

    op.create_index("ix_users_tenant_role", "users", ["tenant_id", "role"])
    op.create_index("ix_rooms_tenant_status", "rooms", ["tenant_id", "status"])
    op.create_index("ix_reservations_tenant_dates", "reservations", ["tenant_id", "check_in_date", "check_out_date"])
    op.create_index("ix_events_tenant_occurred", "analytics_events", ["tenant_id", "occurred_at"])


def downgrade() -> None:
    op.drop_table("analytics_events")
    op.drop_table("reservations")
    op.drop_table("guests")
    op.drop_table("rooms")
    op.drop_table("room_categories")
    op.drop_table("properties")
    op.drop_table("users")
    op.drop_table("tenants")
    for enum_name in ["analyticseventtype", "reservationstatus", "roomstatus", "userrole", "tenanttype"]:
        postgresql.ENUM(name=enum_name).drop(op.get_bind(), checkfirst=True)
