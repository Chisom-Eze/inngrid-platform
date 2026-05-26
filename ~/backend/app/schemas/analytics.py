from decimal import Decimal

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_properties: int
    total_rooms: int
    occupied_rooms: int
    occupancy_rate: float
    active_reservations: int
    check_ins_today: int
    check_outs_today: int
    revenue_total: Decimal
    reservations_by_status: dict[str, int]
    property_performance: list[dict[str, str | int | float]]
