"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Page, Property, Room } from "@/lib/types";

const statusTone: Record<Room["status"], string> = {
  AVAILABLE: "bg-brand-50 text-brand-700",
  OCCUPIED: "bg-blue-50 text-blue-700",
  MAINTENANCE: "bg-amber-50 text-amber-700",
  OUT_OF_SERVICE: "bg-red-50 text-red-700"
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    property_id: "",
    number: "",
    floor: "",
    capacity: 2,
    status: "AVAILABLE" as Room["status"]
  });

  async function load() {
    const [roomPage, propertyPage] = await Promise.all([apiFetch<Page<Room>>("/properties/rooms"), apiFetch<Page<Property>>("/properties")]);
    setRooms(roomPage.items);
    setProperties(propertyPage.items);
    if (!form.property_id && propertyPage.items[0]) {
      setForm((current) => ({ ...current, property_id: propertyPage.items[0].id }));
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch<Room>("/properties/rooms", { method: "POST", body: JSON.stringify(form) });
      setForm((current) => ({ ...current, number: "", floor: "", capacity: 2, status: "AVAILABLE" }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create room");
    }
  }

  async function updateStatus(room: Room, status: Room["status"]) {
    await apiFetch<Room>(`/properties/rooms/${room.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await load();
  }

  const available = rooms.filter((room) => room.status === "AVAILABLE").length;
  const occupied = rooms.filter((room) => room.status === "OCCUPIED").length;
  const housekeeping = rooms.filter((room) => room.status === "MAINTENANCE").length;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-ink">Rooms and suites</h1>
        <p className="mt-1 text-sm text-slate-500">Manage availability, occupancy, and maintenance status.</p>
        {error ? <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div> : null}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <div className="text-xs font-semibold uppercase text-slate-500">Ready to sell</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{available}</div>
          </div>
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <div className="text-xs font-semibold uppercase text-slate-500">Occupied</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{occupied}</div>
          </div>
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <div className="text-xs font-semibold uppercase text-slate-500">Housekeeping queue</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{housekeeping}</div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-ink">Room {room.number}</div>
                  <div className="text-sm text-slate-500">Floor {room.floor || "N/A"} - {room.capacity} guests</div>
                </div>
                <span className={`rounded px-2 py-1 text-xs font-semibold ${statusTone[room.status]}`}>{room.status.replaceAll("_", " ")}</span>
              </div>
              <select
                value={room.status}
                onChange={(event) => updateStatus(room, event.target.value as Room["status"])}
                className="mt-4 w-full rounded-md border border-line px-2 py-2 text-sm outline-none focus:border-brand-600"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OUT_OF_SERVICE">Out of service</option>
              </select>
              {room.status === "MAINTENANCE" ? (
                <button onClick={() => updateStatus(room, "AVAILABLE")} className="mt-3 w-full rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white">
                  Reset available
                </button>
              ) : null}
              {room.status === "OCCUPIED" ? (
                <button onClick={() => updateStatus(room, "MAINTENANCE")} className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm font-semibold text-slate-700">
                  Send to housekeeping
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {!rooms.length ? (
          <div className="mt-6 rounded-lg border border-dashed border-line bg-white p-6 text-sm text-slate-500">
            Add your first room or suite after creating a property.
          </div>
        ) : null}
      </section>
      <form onSubmit={create} className="h-fit rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink">Add room</h2>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Property
            <select
              value={form.property_id}
              onChange={(event) => setForm((current) => ({ ...current, property_id: event.target.value }))}
              className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            >
              <option value="">Select property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Room number
            <input
              value={form.number}
              onChange={(event) => setForm((current) => ({ ...current, number: event.target.value }))}
              className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Floor
            <input
              value={form.floor}
              onChange={(event) => setForm((current) => ({ ...current, floor: event.target.value }))}
              className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Capacity
            <input
              value={form.capacity}
              onChange={(event) => setForm((current) => ({ ...current, capacity: Number(event.target.value) }))}
              type="number"
              min={1}
              className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            />
          </label>
        </div>
        <button className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Create room</button>
      </form>
    </div>
  );
}
