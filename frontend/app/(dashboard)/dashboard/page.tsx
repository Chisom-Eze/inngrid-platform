"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiFetch } from "@/lib/api";
import type { DashboardSummary, Page, Reservation, Room } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { quickActionsFor, roleLabel } from "@/lib/rbac";

const fallback: DashboardSummary = {
  total_properties: 0,
  total_rooms: 0,
  occupied_rooms: 0,
  occupancy_rate: 0,
  active_reservations: 0,
  check_ins_today: 0,
  check_outs_today: 0,
  revenue_total: "0",
  reservations_by_status: {},
  property_performance: []
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary>(fallback);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<DashboardSummary>("/analytics/dashboard"),
      apiFetch<Page<Room>>("/properties/rooms").catch(() => ({ items: [], total: 0, limit: 0, offset: 0 })),
      apiFetch<Page<Reservation>>("/reservations").catch(() => ({ items: [], total: 0, limit: 0, offset: 0 }))
    ])
      .then(([summary, roomPage, reservationPage]) => {
        setData(summary);
        setRooms(roomPage.items);
        setReservations(reservationPage.items);
      })
      .catch((err) => setError(err.message));
  }, []);

  const statusData = Object.entries(data.reservations_by_status).map(([name, value]) => ({ name: name.replaceAll("_", " "), value }));
  const unavailableRooms = rooms.filter((room) => room.status === "MAINTENANCE" || room.status === "OUT_OF_SERVICE").length;
  const arrivals = reservations.filter((reservation) => reservation.status === "CONFIRMED").slice(0, 4);
  const inHouse = reservations.filter((reservation) => reservation.status === "CHECKED_IN").length;
  const quickActions = user ? quickActionsFor(user.role) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-ink">Operations dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user ? `${roleLabel(user.role)} workspace for live hospitality operations.` : "Tenant-level operations workspace."}
          </p>
        </div>
        <div className="rounded-md border border-line bg-white px-3 py-2 text-sm text-slate-600">Today</div>
      </div>
      {error ? <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Occupancy" value={`${data.occupancy_rate}%`} trend={`${data.occupied_rooms}/${data.total_rooms} rooms`} tone="green" />
        <MetricCard label="Active reservations" value={String(data.active_reservations)} trend={`${data.check_ins_today} arrivals`} />
        <MetricCard label="Departures today" value={String(data.check_outs_today)} trend="Front desk" tone="amber" />
        <MetricCard label="Revenue booked" value={`$${Number(data.revenue_total).toLocaleString()}`} trend={`${data.total_properties} properties`} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-ink">Role quick actions</h2>
              <p className="mt-1 text-sm text-slate-500">Actions shown here match your backend permissions.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className="rounded-md border border-line px-3 py-3 text-sm font-semibold text-slate-700 hover:border-brand-600 hover:text-brand-700">
                {action.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-ink">Operational pulse</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs font-semibold uppercase text-slate-500">In-house</div>
              <div className="mt-2 text-xl font-semibold text-ink">{inHouse}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs font-semibold uppercase text-slate-500">Arrivals queue</div>
              <div className="mt-2 text-xl font-semibold text-ink">{arrivals.length}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <div className="text-xs font-semibold uppercase text-slate-500">Housekeeping holds</div>
              <div className="mt-2 text-xl font-semibold text-ink">{unavailableRooms}</div>
            </div>
          </div>
        </div>
      </section>
      {!data.total_properties ? (
        <section className="rounded-lg border border-dashed border-line bg-white p-6 shadow-soft">
          <h2 className="text-base font-semibold text-ink">Set up your first operation</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Add a property, define rooms or suites, invite your operations team, then start creating reservations.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/properties" className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white">
              Add property
            </Link>
            <Link href="/team" className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-slate-700">
              Invite team
            </Link>
          </div>
        </section>
      ) : null}
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Property performance</h2>
            <span className="text-xs font-medium text-slate-500">Reservations and revenue</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.property_performance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#247c73" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="text-base font-semibold text-ink">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {reservations.slice(0, 5).map((reservation) => (
              <div key={reservation.id} className="rounded-md border border-line p-3 text-sm">
                <div className="font-medium text-ink">
                  {reservation.guest ? `${reservation.guest.first_name} ${reservation.guest.last_name}` : "Guest reservation"}
                </div>
                <div className="mt-1 text-slate-500">
                  {reservation.status.replaceAll("_", " ")} - {reservation.check_in_date} to {reservation.check_out_date}
                </div>
              </div>
            ))}
            {!reservations.length ? <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">No operational activity yet.</div> : null}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="text-base font-semibold text-ink">Reservation lifecycle</h2>
          <div className="mt-5 space-y-3">
            {statusData.length ? (
              statusData.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-slate-600">{item.name.toLowerCase()}</span>
                    <span className="font-semibold text-ink">{item.value}</span>
                  </div>
                  <div className="h-2 rounded bg-slate-100">
                    <div className="h-2 rounded bg-saffron" style={{ width: `${Math.min(100, item.value * 12)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">No reservations recorded yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
