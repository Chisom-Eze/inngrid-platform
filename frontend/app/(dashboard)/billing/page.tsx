"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { DashboardSummary, Page, Reservation } from "@/lib/types";
import { MetricCard } from "@/components/ui/MetricCard";

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

export default function BillingPage() {
  const [summary, setSummary] = useState<DashboardSummary>(fallback);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiFetch<DashboardSummary>("/analytics/dashboard"), apiFetch<Page<Reservation>>("/reservations")])
      .then(([dashboard, reservationPage]) => {
        setSummary(dashboard);
        setReservations(reservationPage.items);
      })
      .catch((err) => setError(err.message));
  }, []);

  const checkedOutRevenue = reservations
    .filter((reservation) => reservation.status === "CHECKED_OUT")
    .reduce((total, reservation) => total + Number(reservation.total_amount), 0);
  const openRevenue = reservations
    .filter((reservation) => ["CONFIRMED", "CHECKED_IN"].includes(reservation.status))
    .reduce((total, reservation) => total + Number(reservation.total_amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-ink">Billing and revenue</h1>
        <p className="mt-1 text-sm text-slate-500">Accountant workspace for booking revenue, operational ledger review, and property performance.</p>
      </div>
      {error ? <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Booked revenue" value={`$${Number(summary.revenue_total).toLocaleString()}`} trend={`${reservations.length} bookings`} />
        <MetricCard label="Open stays" value={`$${openRevenue.toLocaleString()}`} trend="Confirmed + in-house" tone="amber" />
        <MetricCard label="Checked-out revenue" value={`$${checkedOutRevenue.toLocaleString()}`} trend="Completed stays" tone="green" />
      </section>
      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-semibold text-ink">Reservation ledger</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Stay dates</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="px-4 py-3 font-medium text-ink">
                  {reservation.guest ? `${reservation.guest.first_name} ${reservation.guest.last_name}` : "Guest"}
                </td>
                <td className="px-4 py-3 text-slate-600">{reservation.status.replaceAll("_", " ")}</td>
                <td className="px-4 py-3 text-slate-600">{reservation.source}</td>
                <td className="px-4 py-3 text-slate-600">{reservation.check_in_date} to {reservation.check_out_date}</td>
                <td className="px-4 py-3 font-semibold text-ink">${Number(reservation.total_amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reservations.length ? <div className="p-6 text-sm text-slate-500">No billable reservations yet.</div> : null}
      </section>
    </div>
  );
}
