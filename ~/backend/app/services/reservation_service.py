from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analytics import AnalyticsEvent
from app.models.enums import AnalyticsEventType, ReservationStatus, RoomStatus
from app.models.property import Property, Room
from app.models.reservation import Guest, Reservation
from app.schemas.reservation import ReservationCreate


def create_reservation(db: Session, tenant_id: UUID, payload: ReservationCreate) -> Reservation:
    property_exists = db.scalar(select(Property.id).where(Property.id == payload.property_id, Property.tenant_id == tenant_id))
    if not property_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    if payload.room_id:
        room = db.scalar(select(Room).where(Room.id == payload.room_id, Room.tenant_id == tenant_id))
        if room is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    guest = Guest(tenant_id=tenant_id, **payload.guest.model_dump())
    db.add(guest)
    db.flush()

    reservation = Reservation(
        tenant_id=tenant_id,
        property_id=payload.property_id,
        room_id=payload.room_id,
        guest_id=guest.id,
        source=payload.source,
        check_in_date=payload.check_in_date,
        check_out_date=payload.check_out_date,
        adults=payload.adults,
        children=payload.children,
        total_amount=payload.total_amount,
        status=ReservationStatus.CONFIRMED,
    )
    db.add(reservation)
    db.add(
        AnalyticsEvent(
            tenant_id=tenant_id,
            property_id=payload.property_id,
            event_type=AnalyticsEventType.RESERVATION_CREATED,
            amount=payload.total_amount,
            event_metadata={"source": payload.source},
        )
    )
    db.commit()
    db.refresh(reservation)
    return reservation


def transition_reservation(db: Session, tenant_id: UUID, reservation_id: UUID, target: ReservationStatus) -> Reservation:
    reservation = db.scalar(select(Reservation).where(Reservation.id == reservation_id, Reservation.tenant_id == tenant_id))
    if reservation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")

    if target == ReservationStatus.CHECKED_IN:
        reservation.status = target
        reservation.checked_in_at = datetime.now(timezone.utc)
        event_type = AnalyticsEventType.CHECK_IN
        if reservation.room_id:
            room = db.get(Room, reservation.room_id)
            if room and room.tenant_id == tenant_id:
                room.status = RoomStatus.OCCUPIED
    elif target == ReservationStatus.CHECKED_OUT:
        reservation.status = target
        reservation.checked_out_at = datetime.now(timezone.utc)
        event_type = AnalyticsEventType.CHECK_OUT
        if reservation.room_id:
            room = db.get(Room, reservation.room_id)
            if room and room.tenant_id == tenant_id:
                room.status = RoomStatus.AVAILABLE
    else:
        reservation.status = target
        event_type = AnalyticsEventType.RESERVATION_CREATED

    db.add(AnalyticsEvent(tenant_id=tenant_id, property_id=reservation.property_id, event_type=event_type))
    db.commit()
    db.refresh(reservation)
    return reservation
