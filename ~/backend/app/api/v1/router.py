from fastapi import APIRouter

from app.api.v1.routes import analytics, auth, properties, reservations, tenants

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["reservations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
