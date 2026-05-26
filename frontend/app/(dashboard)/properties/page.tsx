"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Page, Property } from "@/lib/types";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", code: "", city: "", country: "" });

  async function load() {
    const page = await apiFetch<Page<Property>>("/properties");
    setProperties(page.items);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch<Property>("/properties", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", code: "", city: "", country: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create property");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-ink">Properties</h1>
        <p className="mt-1 text-sm text-slate-500">Manage hotels, resorts, apartments, and lounges inside the tenant workspace.</p>
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {properties.map((property) => (
                <tr key={property.id}>
                  <td className="px-4 py-3 font-medium text-ink">{property.name}</td>
                  <td className="px-4 py-3 text-slate-600">{property.code}</td>
                  <td className="px-4 py-3 text-slate-600">{[property.city, property.country].filter(Boolean).join(", ") || "Not set"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                      {property.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!properties.length ? <div className="p-6 text-sm text-slate-500">No properties yet.</div> : null}
        </div>
      </section>
      <form onSubmit={create} className="h-fit rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink">Add property</h2>
        <div className="mt-4 space-y-3">
          {[
            ["name", "Name"],
            ["code", "Code"],
            ["city", "City"],
            ["country", "Country"]
          ].map(([key, label]) => (
            <label key={key} className="block text-sm font-medium text-slate-700">
              {label}
              <input
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
              />
            </label>
          ))}
        </div>
        {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        <button className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Create property</button>
      </form>
    </div>
  );
}
