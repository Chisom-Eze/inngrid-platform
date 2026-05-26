"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Guest, Page } from "@/lib/types";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    document_number: "",
    notes: ""
  });

  async function load() {
    const page = await apiFetch<Page<Guest>>("/reservations/guests");
    setGuests(page.items);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch<Guest>("/reservations/guests", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          email: form.email || null,
          phone: form.phone || null,
          document_number: form.document_number || null,
          notes: form.notes || null
        })
      });
      setForm({ first_name: "", last_name: "", email: "", phone: "", document_number: "", notes: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create guest");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-ink">Guests</h1>
        <p className="mt-1 text-sm text-slate-500">Guest profiles, contact details, identity references, and stay history foundation.</p>
        {error ? <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div> : null}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {guests.map((guest) => (
            <div key={guest.id} className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <div className="font-semibold text-ink">{guest.first_name} {guest.last_name}</div>
              <div className="mt-1 text-sm text-slate-500">{guest.email || "No email"}</div>
              <div className="mt-1 text-sm text-slate-500">{guest.phone || "No phone"}</div>
              {guest.document_number ? <div className="mt-3 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{guest.document_number}</div> : null}
            </div>
          ))}
        </div>
        {!guests.length ? <div className="mt-6 rounded-lg border border-dashed border-line bg-white p-6 text-sm text-slate-500">No guests yet. Add a guest or create a reservation to begin building history.</div> : null}
      </section>
      <form onSubmit={create} className="h-fit rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink">Add guest</h2>
        <div className="mt-4 space-y-3">
          {[
            ["first_name", "First name"],
            ["last_name", "Last name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["document_number", "Document number"]
          ].map(([key, label]) => (
            <label key={key} className="block text-sm font-medium text-slate-700">
              {label}
              <input
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                type={key === "email" ? "email" : "text"}
                className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
              />
            </label>
          ))}
          <label className="block text-sm font-medium text-slate-700">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            />
          </label>
        </div>
        <button className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Create guest</button>
      </form>
    </div>
  );
}
