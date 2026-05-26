"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  HomeModernIcon,
  IdentificationIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { can, roleFocus, roleLabel } from "@/lib/rbac";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: ChartBarSquareIcon, area: "analytics" },
  { href: "/properties", label: "Properties", icon: BuildingOffice2Icon, area: "properties" },
  { href: "/rooms", label: "Rooms", icon: HomeModernIcon, area: "properties" },
  { href: "/reservations", label: "Reservations", icon: CalendarDaysIcon, area: "reservations" },
  { href: "/guests", label: "Guests", icon: IdentificationIcon, area: "guests" },
  { href: "/billing", label: "Billing", icon: BanknotesIcon, area: "billing" },
  { href: "/team", label: "Team", icon: UserGroupIcon, area: "users" },
  { href: "/settings", label: "Settings", icon: Cog6ToothIcon, area: "settings" }
];

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const items = nav.filter((item) => user && can(user.role, item.area));

  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-[#f5f7fa]">
        <aside className="hidden w-72 shrink-0 border-r border-line bg-white lg:block">
          <div className="flex h-16 items-center border-b border-line px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-brand-600 text-sm font-bold text-white">IG</div>
            <div className="ml-3">
              <div className="font-semibold text-ink">InnGrid</div>
              <div className="text-xs text-slate-500">Hospitality Ops</div>
            </div>
          </div>
          <nav className="space-y-1 px-3 py-4">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur md:px-8">
            <div>
              <div className="text-sm font-semibold text-ink">{user?.tenant_name ?? "Platform Console"}</div>
              <div className="text-xs text-slate-500">{user ? `${roleLabel(user.role)} - ${roleFocus(user.role)}` : ""}</div>
            </div>
            <button onClick={signOut} className="rounded-md border border-line px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Sign out
            </button>
          </header>
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShellContent>{children}</ShellContent>
    </AuthProvider>
  );
}
