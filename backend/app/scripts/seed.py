from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.enums import ReservationStatus, RoomStatus, TenantType, UserRole
from app.models.property import Property, Room, RoomCategory
from app.models.reservation import Guest, Reservation
from app.models.tenant import Tenant
from app.models.user import User


def run() -> None:
    db = SessionLocal()
    try:
        tenant = db.scalar(select(Tenant).where(Tenant.slug == "eko-harbor-suites"))
        if tenant is None:
            tenant = Tenant(
                name="Eko Harbor Suites",
                slug="eko-harbor-suites",
                business_type=TenantType.HOTEL,
                email="ops@ekoharbor.com",
                phone="+234 800 000 0101",
                timezone="Africa/Lagos",
                property_category="Full service hotel",
                city="Lagos",
                country="Nigeria",
                preferred_currency="NGN",
            )
            db.add(tenant)
            db.flush()
        else:
            tenant.name = "Eko Harbor Suites"
            tenant.business_type = TenantType.HOTEL
            tenant.email = "ops@ekoharbor.com"
            tenant.phone = "+234 800 000 0101"
            tenant.timezone = "Africa/Lagos"
            tenant.property_category = "Full service hotel"
            tenant.city = "Lagos"
            tenant.country = "Nigeria"
            tenant.preferred_currency = "NGN"

        users = [
            ("Ada Johnson", "admin@demoinngrid.com", "admin@demo.inngrid.local", UserRole.TENANT_ADMIN),
            ("Kemi Rhodes", "manager@demoinngrid.com", "manager@demo.inngrid.local", UserRole.MANAGER),
            ("Musa Bello", "frontdesk@demoinngrid.com", "frontdesk@demo.inngrid.local", UserRole.RECEPTIONIST),
            ("Tara Okafor", "finance@demoinngrid.com", "finance@demo.inngrid.local", UserRole.ACCOUNTANT),
        ]
        for full_name, email, legacy_email, role in users:
            user = db.scalar(select(User).where(User.email == email))
            if user is None:
                user = db.scalar(select(User).where(User.email == legacy_email))

            if user is None:
                db.add(
                    User(
                        tenant_id=tenant.id,
                        full_name=full_name,
                        email=email,
                        role=role,
                        hashed_password=hash_password("Password123!"),
                    )
                )
            else:
                user.tenant_id = tenant.id
                user.full_name = full_name
                user.email = email
                user.role = role
                user.hashed_password = hash_password("Password123!")
                user.is_active = True

        if db.scalar(select(Property.id).where(Property.tenant_id == tenant.id)):
            db.commit()
            return

        property_one = Property(
            tenant_id=tenant.id,
            name="Eko Harbor Suites Victoria Island",
            code="EKO-VI",
            city="Lagos",
            country="Nigeria",
            address="1 Marina View",
        )
        property_two = Property(
            tenant_id=tenant.id,
            name="Eko Harbor Airport Lounge",
            code="EKO-LOS",
            city="Ikeja",
            country="Nigeria",
            address="Private Terminal Wing",
        )
        db.add_all([property_one, property_two])
        db.flush()

        deluxe = RoomCategory(tenant_id=tenant.id, name="Deluxe Suite", base_rate=Decimal("180.00"))
        lounge = RoomCategory(tenant_id=tenant.id, name="Private Lounge Bay", base_rate=Decimal("95.00"))
        db.add_all([deluxe, lounge])
        db.flush()

        rooms = [
            Room(
                tenant_id=tenant.id,
                property_id=property_one.id,
                category_id=deluxe.id,
                number="101",
                floor="1",
                status=RoomStatus.OCCUPIED,
            ),
            Room(
                tenant_id=tenant.id,
                property_id=property_one.id,
                category_id=deluxe.id,
                number="102",
                floor="1",
                status=RoomStatus.AVAILABLE,
            ),
            Room(
                tenant_id=tenant.id,
                property_id=property_one.id,
                category_id=deluxe.id,
                number="201",
                floor="2",
                status=RoomStatus.MAINTENANCE,
            ),
            Room(
                tenant_id=tenant.id,
                property_id=property_two.id,
                category_id=lounge.id,
                number="L1",
                floor="A",
                status=RoomStatus.OCCUPIED,
            ),
            Room(
                tenant_id=tenant.id,
                property_id=property_two.id,
                category_id=lounge.id,
                number="L2",
                floor="A",
                status=RoomStatus.AVAILABLE,
            ),
        ]
        db.add_all(rooms)
        db.flush()

        today = date.today()
        guests = [
            Guest(tenant_id=tenant.id, first_name="Nora", last_name="Cole", email="nora@example.com", phone="+1 555 0101"),
            Guest(tenant_id=tenant.id, first_name="Ibrahim", last_name="Sani", email="ibrahim@example.com", phone="+234 800 0102"),
            Guest(tenant_id=tenant.id, first_name="Elena", last_name="Park", email="elena@example.com", phone="+44 20 0103"),
        ]
        db.add_all(guests)
        db.flush()

        reservations = [
            Reservation(
                tenant_id=tenant.id,
                property_id=property_one.id,
                room_id=rooms[0].id,
                guest_id=guests[0].id,
                status=ReservationStatus.CHECKED_IN,
                source="direct",
                check_in_date=today,
                check_out_date=today + timedelta(days=2),
                total_amount=Decimal("540.00"),
            ),
            Reservation(
                tenant_id=tenant.id,
                property_id=property_two.id,
                room_id=rooms[3].id,
                guest_id=guests[1].id,
                status=ReservationStatus.CONFIRMED,
                source="corporate",
                check_in_date=today + timedelta(days=1),
                check_out_date=today + timedelta(days=1),
                total_amount=Decimal("190.00"),
            ),
            Reservation(
                tenant_id=tenant.id,
                property_id=property_one.id,
                room_id=rooms[1].id,
                guest_id=guests[2].id,
                status=ReservationStatus.CONFIRMED,
                source="booking.com",
                check_in_date=today + timedelta(days=3),
                check_out_date=today + timedelta(days=6),
                total_amount=Decimal("720.00"),
            ),
        ]
        db.add_all(reservations)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
