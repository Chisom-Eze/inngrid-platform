"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Page, UserRole } from "@/lib/types";
import { roleLabel } from "@/lib/rbac";

type TeamUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
};

export default function TeamPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "RECEPTIONIST" as UserRole,
    temporary_password: "Password123!"
  });

  async function load() {
    const page = await apiFetch<Page<TeamUser>>("/tenants/current/users");
    setUsers(page.items);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch<TeamUser>("/tenants/current/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ full_name: "", email: "", role: "RECEPTIONIST", temporary_password: "Password123!" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to invite user");
    }
  }

  async function updateRole(user: TeamUser, role: UserRole) {
    setError("");
    try {
      await apiFetch<TeamUser>(`/tenants/current/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ role }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update role");
    }
  }

  async function setActive(user: TeamUser, is_active: boolean) {
    setError("");
    try {
      await apiFetch<TeamUser>(`/tenants/current/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ is_active }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update staff status");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section>
        <h1 className="text-2xl font-semibold tracking-normal text-ink">Team and access</h1>
        <p className="mt-1 text-sm text-slate-500">Invite team members and assign operational roles for this tenant.</p>
        {error ? <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div> : null}
        <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Staff member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{user.full_name}</div>
                    <div className="text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{roleLabel(user.role)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.is_active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={user.role}
                        onChange={(event) => updateRole(user, event.target.value as UserRole)}
                        className="rounded-md border border-line px-2 py-1 text-xs outline-none focus:border-brand-600"
                      >
                        <option value="RECEPTIONIST">Receptionist</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        <option value="OPERATIONS_STAFF">Operations</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                      <button onClick={() => setActive(user, !user.is_active)} className="rounded border border-line px-2 py-1 text-xs">
                        {user.is_active ? "Deactivate" : "Reactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!users.length ? <div className="mt-6 rounded-lg border border-line bg-white p-6 text-sm text-slate-500">No team members yet.</div> : null}
      </section>
      <form onSubmit={invite} className="h-fit rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink">Invite team member</h2>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              value={form.full_name}
              onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
              className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              type="email"
              className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Role
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
              className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            >
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="OPERATIONS_STAFF">Operations</option>
              <option value="MANAGER">Manager</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Temporary password
            <input
              value={form.temporary_password}
              onChange={(event) => setForm((current) => ({ ...current, temporary_password: event.target.value }))}
              type="password"
              className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
            />
          </label>
        </div>
        <button className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Create user</button>
      </form>
    </div>
  );
}
