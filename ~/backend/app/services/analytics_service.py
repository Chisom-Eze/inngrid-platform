from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import ReservationStatus, RoomStatus
from app.models.property import Property, Room
from app.models.reservation import Reservation
from app.schemas.analytics import DashboardSummary


def get_dashboard_summary(db: Session, tenant_id: UUID) -> DashboardSummary:
    today = date.today()
    total_properties = db.scalar(select(func.count()).select_from(Property).where(Property.tenant_id == tenant_id)) or 0
    total_rooms = db.scalar(select(func.count()).select_from(Room).where(Room.tenant_id == tenant_id)) or 0
    occupied_rooms = (
        db.scalar(select(func.count()).select_from(Room).where(Room.tenant_id == tenant_id, Room.status == RoomStatus.OCCUPIED))
        or 0
    )
    active_reservations = (
        db.scalar(
            select(func.count())
            .select_from(Reservation)
            .where(
                Reservation.tenant_id == tenant_id,
                Reservation.status.in_([ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN]),
            )
        )
        or 0
    )
    check_ins_today = (
        db.scalar(
            select(func.count())
            .select_from(Reservation)
            .where(Reservation.tenant_id == tenant_id, Reservation.check_in_date == today)
        )
        or 0
    )
    check_outs_today = (
        db.scalar(
            select(func.count())
            .select_from(Reservation)
            .where(Reservation.tenant_id == tenant_id, Reservation.check_out_date == today)
        )
        or 0
    )
    revenue_total = (
        db.scalar(
            select(func.coalesce(func.sum(Reservation.total_amount), 0)).where(
                Reservation.tenant_id == tenant_id,
                Reservation.status != ReservationStatus.CANCELLED,
            )
        )
        or Decimal("0")
    )

    status_rows = db.execute(
        select(Reservation.status, func.count()).where(Reservation.tenant_id == tenant_id).group_by(Reservation.status)
    ).all()
    reservations_by_status = {status.value: count for status, count in status_rows}

    property_rows = db.execute(
        select(Property.id, Property.name, func.count(Reservation.id), func.coalesce(func.sum(Reservation.total_amount), 0))
        .outerjoin(Reservation, Reservation.property_id == Property.id)
        .where(Property.tenant_id == tenant_id)
        .group_by(Property.id, Property.name)
        .order_by(Property.name)
    ).all()
    performance = [
        {"property_id": str(row[0]), "name": row[1], "reservations": row[2], "revenue": float(row[3] or 0)}
        for row in property_rows
    ]

    return DashboardSummary(
        total_properties=total_properties,
        total_rooms=total_rooms,
        occupied_rooms=occupied_rooms,
        occupancy_rate=round((occupied_rooms / total_rooms) * 100, 2) if total_rooms else 0,
        active_reservations=active_reservations,
        check_ins_today=check_ins_today,
        check_outs_today=check_outs_today,
        revenue_total=revenue_total,
        reservations_by_status=reservations_by_status,
        property_performance=performance,
    )
