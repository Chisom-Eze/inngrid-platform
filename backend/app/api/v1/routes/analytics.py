from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_tenant_context
from app.db.session import get_db
from app.models.tenant import Tenant
from app.schemas.analytics import DashboardSummary
from app.services.analytics_service import get_dashboard_summary

router = APIRouter()


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard_summary(tenant: Tenant = Depends(get_tenant_context), db: Session = Depends(get_db)) -> DashboardSummary:
    return get_dashboard_summary(db, tenant.id)
