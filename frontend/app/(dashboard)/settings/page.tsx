"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Tenant } from "@/lib/types";

export default function SettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Tenant>("/tenants/current")
      .then(setTenant)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-normal text-ink">Tenant settings</h1>
      <p className="mt-1 text-sm text-slate-500">Organization profile and workspace identity.</p>
      {error ? <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div> : null}
      {tenant ? (
        <div className="mt-6 rounded-lg border border-line bg-white p-5 shadow-soft">
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Name", tenant.name],
              ["Slug", tenant.slug],
              ["Business type", tenant.business_type.replaceAll("_", " ")],
              ["Property category", tenant.property_category ?? "Not set"],
              ["Location", [tenant.city, tenant.country].filter(Boolean).join(", ") || "Not set"],
              ["Timezone", tenant.timezone],
              ["Currency", tenant.preferred_currency],
              ["Email", tenant.email ?? "Not set"],
              ["Phone", tenant.phone ?? "Not set"]
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
