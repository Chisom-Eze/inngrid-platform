from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_tenant_context, require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.property import Property, Room, RoomCategory
from app.models.tenant import Tenant
from app.schemas.common import Page
from app.schemas.property import (
    PropertyCreate,
    PropertyRead,
    PropertyUpdate,
    RoomCategoryCreate,
    RoomCategoryRead,
    RoomCreate,
    RoomRead,
    RoomUpdate,
)
from app.services import property_service, tenant_service

router = APIRouter()
write_roles = (UserRole.PLATFORM_SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.OPERATIONS_STAFF)


@router.get("", response_model=Page[PropertyRead])
def list_properties(
    search: str | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
) -> Page[PropertyRead]:
    stmt = select(Property).where(Property.tenant_id == tenant.id).order_by(Property.name)
    if search:
        stmt = stmt.where(Property.name.ilike(f"%{search}%"))
    items, total = tenant_service.page_query(db, stmt, limit, offset)
    return Page(items=items, total=total, limit=limit, offset=offset)


@router.post("", response_model=PropertyRead, status_code=201)
def create_property(
    payload: PropertyCreate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*write_roles)),
) -> Property:
    return property_service.create_property(db, tenant.id, payload)


@router.patch("/{property_id}", response_model=PropertyRead)
def update_property(
    property_id: UUID,
    payload: PropertyUpdate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*write_roles)),
) -> Property:
    item = property_service.get_property_or_404(db, tenant.id, property_id)
    return property_service.update_property(db, item, payload)


@router.get("/room-categories", response_model=Page[RoomCategoryRead])
def list_categories(
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
) -> Page[RoomCategoryRead]:
    stmt = select(RoomCategory).where(RoomCategory.tenant_id == tenant.id).order_by(RoomCategory.name)
    items, total = tenant_service.page_query(db, stmt, limit, offset)
    return Page(items=items, total=total, limit=limit, offset=offset)


@router.post("/room-categories", response_model=RoomCategoryRead, status_code=201)
def create_category(
    payload: RoomCategoryCreate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*write_roles)),
) -> RoomCategory:
    return property_service.create_category(db, tenant.id, payload)


@router.get("/rooms", response_model=Page[RoomRead])
def list_rooms(
    status: str | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
) -> Page[RoomRead]:
    stmt = select(Room).where(Room.tenant_id == tenant.id).order_by(Room.number)
    if status:
        stmt = stmt.where(Room.status == status)
    items, total = tenant_service.page_query(db, stmt, limit, offset)
    return Page(items=items, total=total, limit=limit, offset=offset)


@router.post("/rooms", response_model=RoomRead, status_code=201)
def create_room(
    payload: RoomCreate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*write_roles)),
) -> Room:
    return property_service.create_room(db, tenant.id, payload)


@router.patch("/rooms/{room_id}", response_model=RoomRead)
def update_room(
    room_id: UUID,
    payload: RoomUpdate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*write_roles)),
) -> Room:
    return property_service.update_room(db, tenant.id, room_id, payload)


@router.delete("/rooms/{room_id}", status_code=204)
def delete_room(
    room_id: UUID,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*write_roles)),
) -> None:
    property_service.delete_room(db, tenant.id, room_id)
