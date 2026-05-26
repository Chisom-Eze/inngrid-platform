export type UserRole =
  | "PLATFORM_SUPER_ADMIN"
  | "TENANT_ADMIN"
  | "MANAGER"
  | "RECEPTIONIST"
  | "ACCOUNTANT"
  | "OPERATIONS_STAFF";

export type AuthUser = {
  id: string;
  tenant_id: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  tenant_name: string | null;
};

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type DashboardSummary = {
  total_properties: number;
  total_rooms: number;
  occupied_rooms: number;
  occupancy_rate: number;
  active_reservations: number;
  check_ins_today: number;
  check_outs_today: number;
  revenue_total: string;
  reservations_by_status: Record<string, number>;
  property_performance: Array<{ property_id: string; name: string; reservations: number; revenue: number }>;
};

export type Property = {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  email?: string | null;
  phone?: string | null;
  timezone: string;
  property_category?: string | null;
  city?: string | null;
  country?: string | null;
  preferred_currency: string;
  is_active: boolean;
};

export type Room = {
  id: string;
  tenant_id: string;
  property_id: string;
  category_id?: string | null;
  number: string;
  floor?: string | null;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "OUT_OF_SERVICE";
};

export type Reservation = {
  id: string;
  tenant_id: string;
  property_id: string;
  room_id?: string | null;
  guest_id: string;
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
  source: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  total_amount: string;
  guest?: Guest | null;
};

export type Guest = {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  document_number?: string | null;
  notes?: string | null;
};
