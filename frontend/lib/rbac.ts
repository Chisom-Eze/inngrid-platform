import type { UserRole } from "@/lib/types";

const permissions: Record<UserRole, string[]> = {
  PLATFORM_SUPER_ADMIN: ["analytics", "properties", "reservations", "guests", "users", "settings", "billing"],
  TENANT_ADMIN: ["analytics", "properties", "reservations", "guests", "users", "settings", "billing"],
  MANAGER: ["analytics", "properties", "reservations", "guests", "users", "settings"],
  RECEPTIONIST: ["analytics", "reservations", "guests"],
  ACCOUNTANT: ["analytics", "reservations", "billing"],
  OPERATIONS_STAFF: ["analytics", "properties", "reservations"]
};

export function can(role: UserRole, area: string) {
  return permissions[role]?.includes(area) ?? false;
}

export function roleFocus(role: UserRole) {
  const focus: Record<UserRole, string> = {
    PLATFORM_SUPER_ADMIN: "Platform controls, tenant operations, and analytics",
    TENANT_ADMIN: "Full tenant administration and operational control",
    MANAGER: "Operational analytics, team oversight, and property performance",
    RECEPTIONIST: "Guest inquiries, reservations, check-ins, and check-outs",
    ACCOUNTANT: "Revenue review, booking totals, and billing oversight",
    OPERATIONS_STAFF: "Room status, housekeeping, and availability reset"
  };
  return focus[role];
}

export function quickActionsFor(role: UserRole) {
  const actions: Record<UserRole, Array<{ label: string; href: string; area: string }>> = {
    PLATFORM_SUPER_ADMIN: [
      { label: "Invite staff", href: "/team", area: "users" },
      { label: "Add room", href: "/rooms", area: "properties" },
      { label: "New reservation", href: "/reservations", area: "reservations" },
      { label: "Review revenue", href: "/billing", area: "billing" }
    ],
    TENANT_ADMIN: [
      { label: "Invite staff", href: "/team", area: "users" },
      { label: "Add room", href: "/rooms", area: "properties" },
      { label: "New reservation", href: "/reservations", area: "reservations" },
      { label: "Tenant settings", href: "/settings", area: "settings" }
    ],
    MANAGER: [
      { label: "Review occupancy", href: "/dashboard", area: "analytics" },
      { label: "Manage rooms", href: "/rooms", area: "properties" },
      { label: "Team coverage", href: "/team", area: "users" },
      { label: "Reservations", href: "/reservations", area: "reservations" }
    ],
    RECEPTIONIST: [
      { label: "New reservation", href: "/reservations", area: "reservations" },
      { label: "Check arrivals", href: "/reservations", area: "reservations" },
      { label: "Guest profiles", href: "/guests", area: "guests" }
    ],
    ACCOUNTANT: [
      { label: "Revenue summary", href: "/billing", area: "billing" },
      { label: "Reservation ledger", href: "/reservations", area: "reservations" }
    ],
    OPERATIONS_STAFF: [
      { label: "Room status", href: "/rooms", area: "properties" },
      { label: "Departures", href: "/reservations", area: "reservations" }
    ]
  };
  return actions[role].filter((action) => can(role, action.area));
}

export function roleLabel(role: UserRole) {
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
