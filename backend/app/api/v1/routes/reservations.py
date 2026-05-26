from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_tenant_context, require_roles
from app.db.session import get_db
from app.models.enums import ReservationStatus, UserRole
from app.models.reservation import Guest, Reservation
from app.models.tenant import Tenant
from app.schemas.common import Page
from app.schemas.reservation import GuestCreate, GuestRead, GuestUpdate, ReservationCreate, ReservationRead
from app.services import reservation_service, tenant_service

router = APIRouter()
front_desk_roles = (
    UserRole.PLATFORM_SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.OPERATIONS_STAFF,
)


@router.get("", response_model=Page[ReservationRead])
def list_reservations(
    status: ReservationStatus | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
) -> Page[ReservationRead]:
    stmt = select(Reservation).where(Reservation.tenant_id == tenant.id).order_by(Reservation.check_in_date.desc())
    if status:
        stmt = stmt.where(Reservation.status == status)
    items, total = tenant_service.page_query(db, stmt, limit, offset)
    return Page(items=items, total=total, limit=limit, offset=offset)


@router.post("", response_model=ReservationRead, status_code=201)
def create_reservation(
    payload: ReservationCreate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*front_desk_roles)),
) -> Reservation:
    return reservation_service.create_reservation(db, tenant.id, payload)


@router.post("/{reservation_id}/check-in", response_model=ReservationRead)
def check_in(
    reservation_id: UUID,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*front_desk_roles)),
) -> Reservation:
    return reservation_service.transition_reservation(db, tenant.id, reservation_id, ReservationStatus.CHECKED_IN)


@router.post("/{reservation_id}/check-out", response_model=ReservationRead)
def check_out(
    reservation_id: UUID,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*front_desk_roles)),
) -> Reservation:
    return reservation_service.transition_reservation(db, tenant.id, reservation_id, ReservationStatus.CHECKED_OUT)


@router.post("/{reservation_id}/cancel", response_model=ReservationRead)
def cancel(
    reservation_id: UUID,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*front_desk_roles)),
) -> Reservation:
    return reservation_service.cancel_reservation(db, tenant.id, reservation_id)


@router.get("/guests", response_model=Page[GuestRead])
def list_guests(
    search: str | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
) -> Page[GuestRead]:
    stmt = select(Guest).where(Guest.tenant_id == tenant.id).order_by(Guest.last_name, Guest.first_name)
    if search:
        stmt = stmt.where((Guest.first_name.ilike(f"%{search}%")) | (Guest.last_name.ilike(f"%{search}%")))
    items, total = tenant_service.page_query(db, stmt, limit, offset)
    return Page(items=items, total=total, limit=limit, offset=offset)


@router.post("/guests", response_model=GuestRead, status_code=201)
def create_guest(
    payload: GuestCreate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*front_desk_roles)),
) -> Guest:
    return reservation_service.create_guest(db, tenant.id, payload)


@router.patch("/guests/{guest_id}", response_model=GuestRead)
def update_guest(
    guest_id: UUID,
    payload: GuestUpdate,
    tenant: Tenant = Depends(get_tenant_context),
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(*front_desk_roles)),
) -> Guest:
    return reservation_service.update_guest(db, tenant.id, guest_id, payload)
