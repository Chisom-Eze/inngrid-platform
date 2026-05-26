"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerTenant } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    organization_name: "Eko Harbor Suites",
    slug: "eko-harbor-suites",
    business_type: "HOTEL",
    contact_phone: "+234 800 000 0101",
    timezone: "Africa/Lagos",
    property_category: "Full service hotel",
    city: "Lagos",
    country: "Nigeria",
    preferred_currency: "NGN",
    admin_full_name: "Ada Johnson",
    admin_email: "admin@demoinngrid.com",
    admin_password: "Password123!"
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await registerTenant(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create tenant");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-4 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-2xl rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="mb-6">
          <div className="text-sm font-semibold text-brand-700">InnGrid</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-ink">Create your hospitality workspace</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["organization_name", "Organization"],
            ["slug", "Tenant slug"],
            ["contact_phone", "Contact phone"],
            ["timezone", "Timezone"],
            ["property_category", "Property category"],
            ["city", "City"],
            ["country", "Country"],
            ["preferred_currency", "Currency"],
            ["admin_full_name", "Admin name"],
            ["admin_email", "Admin email"],
            ["admin_password", "Password"]
          ].map(([key, label]) => (
            <label key={key} className="block text-sm font-medium text-slate-700">
              {label}
              <input
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                type={key.includes("password") ? "password" : key.includes("email") ? "email" : "text"}
                className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
              />
            </label>
          ))}
          <label className="block text-sm font-medium text-slate-700">
            Business type
            <select
              value={form.business_type}
              onChange={(event) => setForm((current) => ({ ...current, business_type: event.target.value }))}
              className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            >
              <option value="HOTEL">Hotel</option>
              <option value="RESORT">Resort</option>
              <option value="AIRBNB_OPERATOR">Airbnb Operator</option>
              <option value="AIRPORT_LOUNGE">Airport Lounge</option>
              <option value="HOSPITALITY_GROUP">Hospitality Group</option>
            </select>
          </label>
        </div>
        {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        <button className="mt-6 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Create workspace</button>
      </form>
    </main>
  );
}
