"""operational onboarding fields

Revision ID: 202605250001
Revises: 202605230001
Create Date: 2026-05-25
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "202605250001"
down_revision: Union[str, None] = "202605230001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'MANAGER'")
    op.add_column("tenants", sa.Column("property_category", sa.String(length=120), nullable=True))
    op.add_column("tenants", sa.Column("city", sa.String(length=120), nullable=True))
    op.add_column("tenants", sa.Column("country", sa.String(length=120), nullable=True))
    op.add_column("tenants", sa.Column("preferred_currency", sa.String(length=3), nullable=False, server_default="USD"))


def downgrade() -> None:
    op.drop_column("tenants", "preferred_currency")
    op.drop_column("tenants", "country")
    op.drop_column("tenants", "city")
    op.drop_column("tenants", "property_category")
