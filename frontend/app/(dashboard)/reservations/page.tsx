"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Page, Property, Reservation, Room } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";

const statusTone: Record<Reservation["status"], string> = {
  PENDING: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  CHECKED_IN: "bg-brand-50 text-brand-700",
  CHECKED_OUT: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-700",
  NO_SHOW: "bg-amber-50 text-amber-700"
};

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    property_id: "",
    room_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    source: "direct",
    check_in_date: "",
    check_out_date: "",
    adults: 1,
    children: 0,
    total_amount: 0
  });
  const canManageReservations = user ? !["ACCOUNTANT"].includes(user.role) : false;

  async function load() {
    const [reservationPage, propertyPage, roomPage] = await Promise.all([
      apiFetch<Page<Reservation>>("/reservations"),
      apiFetch<Page<Property>>("/properties"),
      apiFetch<Page<Room>>("/properties/rooms")
    ]);
    setReservations(reservationPage.items);
    setProperties(propertyPage.items);
    setRooms(roomPage.items);
    if (!form.property_id && propertyPage.items[0]) {
      setForm((current) => ({ ...current, property_id: propertyPage.items[0].id }));
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function transition(id: string, action: "check-in" | "check-out") {
    if (!canManageReservations) return;
    await apiFetch<Reservation>(`/reservations/${id}/${action}`, { method: "POST" });
    await load();
  }

  async function cancel(id: string) {
    if (!canManageReservations) return;
    await apiFetch<Reservation>(`/reservations/${id}/cancel`, { method: "POST" });
    await load();
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch<Reservation>("/reservations", {
        method: "POST",
        body: JSON.stringify({
          property_id: form.property_id,
          room_id: form.room_id || null,
          guest: { first_name: form.first_name, last_name: form.last_name, email: form.email || null, phone: form.phone || null },
          source: form.source,
          check_in_date: form.check_in_date,
          check_out_date: form.check_out_date,
          adults: form.adults,
          children: form.children,
          total_amount: form.total_amount
        })
      });
      setForm((current) => ({ ...current, room_id: "", first_name: "", last_name: "", email: "", phone: "", total_amount: 0 }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create reservation");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-ink">Reservations</h1>
        <p className="mt-1 text-sm text-slate-500">Track bookings, arrivals, departures, cancellations, and front desk workflows.</p>
        {error ? <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div> : null}
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            ["Guest inquiry", "Capture guest details"],
            ["Reservation", "Assign stay dates"],
            ["Check-in", "Set room occupied"],
            ["Check-out", "Release to housekeeping"]
          ].map(([title, body], index) => (
            <div key={title} className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-50 text-sm font-semibold text-brand-700">{index + 1}</div>
              <div className="mt-3 font-semibold text-ink">{title}</div>
              <div className="mt-1 text-sm text-slate-500">{body}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Stay dates</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-4 py-3 text-ink">
                    {reservation.guest ? `${reservation.guest.first_name} ${reservation.guest.last_name}` : "Guest"}
                  </td>
                  <td className="px-4 py-3 text-ink">{reservation.check_in_date} to {reservation.check_out_date}</td>
                  <td className="px-4 py-3 text-slate-600">{reservation.source}</td>
                  <td className="px-4 py-3 font-medium text-ink">${Number(reservation.total_amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${statusTone[reservation.status]}`}>
                      {reservation.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {canManageReservations ? (
                    <div className="flex flex-wrap gap-2">
                      <button disabled={reservation.status !== "CONFIRMED"} onClick={() => transition(reservation.id, "check-in")} className="rounded border border-line px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40">
                        Check in
                      </button>
                      <button disabled={reservation.status !== "CHECKED_IN"} onClick={() => transition(reservation.id, "check-out")} className="rounded border border-line px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40">
                        Check out
                      </button>
                      <button disabled={["CHECKED_OUT", "CANCELLED"].includes(reservation.status)} onClick={() => cancel(reservation.id)} className="rounded border border-line px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40">
                        Cancel
                      </button>
                    </div>
                    ) : (
                      <span className="text-xs text-slate-500">Read only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reservations.length ? <div className="p-6 text-sm text-slate-500">No reservations yet. Create the first booking from the form.</div> : null}
        </div>
      </section>
      {canManageReservations ? (
      <form onSubmit={create} className="h-fit rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink">New reservation</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <label className="block text-sm font-medium text-slate-700">
            Property
            <select value={form.property_id} onChange={(event) => setForm((current) => ({ ...current, property_id: event.target.value }))} className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600">
              <option value="">Select property</option>
              {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Room
            <select value={form.room_id} onChange={(event) => setForm((current) => ({ ...current, room_id: event.target.value }))} className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600">
              <option value="">Unassigned</option>
              {rooms.filter((room) => room.status === "AVAILABLE").map((room) => <option key={room.id} value={room.id}>Room {room.number}</option>)}
            </select>
          </label>
          {[
            ["first_name", "First name"],
            ["last_name", "Last name"],
            ["email", "Guest email"],
            ["phone", "Guest phone"],
            ["source", "Booking source"],
            ["check_in_date", "Check-in date"],
            ["check_out_date", "Check-out date"]
          ].map(([key, label]) => (
            <label key={key} className="block text-sm font-medium text-slate-700">
              {label}
              <input
                value={form[key as keyof typeof form] as string}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                type={key.includes("date") ? "date" : key === "email" ? "email" : "text"}
                className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
              />
            </label>
          ))}
          <label className="block text-sm font-medium text-slate-700">
            Total amount
            <input value={form.total_amount} onChange={(event) => setForm((current) => ({ ...current, total_amount: Number(event.target.value) }))} type="number" min={0} className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600" />
          </label>
        </div>
        <button className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Create reservation</button>
      </form>
      ) : (
        <aside className="h-fit rounded-lg border border-line bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-ink">Revenue review mode</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Accountant access can review reservation totals and lifecycle state without changing front desk operations.</p>
        </aside>
      )}
    </div>
  );
}
