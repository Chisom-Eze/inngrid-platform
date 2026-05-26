from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.property import Property, Room, RoomCategory
from app.schemas.property import PropertyCreate, PropertyUpdate, RoomCategoryCreate, RoomCreate, RoomUpdate


def get_property_or_404(db: Session, tenant_id: UUID, property_id: UUID) -> Property:
    item = db.scalar(select(Property).where(Property.id == property_id, Property.tenant_id == tenant_id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return item


def create_property(db: Session, tenant_id: UUID, payload: PropertyCreate) -> Property:
    item = Property(tenant_id=tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_property(db: Session, item: Property, payload: PropertyUpdate) -> Property:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


def create_category(db: Session, tenant_id: UUID, payload: RoomCategoryCreate) -> RoomCategory:
    item = RoomCategory(tenant_id=tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def create_room(db: Session, tenant_id: UUID, payload: RoomCreate) -> Room:
    get_property_or_404(db, tenant_id, payload.property_id)
    item = Room(tenant_id=tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_room(db: Session, tenant_id: UUID, room_id: UUID, payload: RoomUpdate) -> Room:
    room = db.scalar(select(Room).where(Room.id == room_id, Room.tenant_id == tenant_id))
    if room is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(room, key, value)
    db.commit()
    db.refresh(room)
    return room
