"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@demoinngrid.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-600 font-bold text-white">IG</div>
            <div>
              <div className="font-semibold text-ink">InnGrid</div>
              <div className="text-sm text-slate-500">Operations control for hospitality teams</div>
            </div>
          </div>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage properties, reservations, rooms, and tenant analytics.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
                type="email"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-md border border-line px-3 py-2 outline-none focus:border-brand-600"
                type="password"
              />
            </label>
            {error ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
            <button className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Sign in</button>
          </form>
          <p className="mt-6 text-sm text-slate-500">
            New organization?{" "}
            <Link href="/register" className="font-semibold text-brand-700">
              Create tenant
            </Link>
          </p>
        </div>
      </section>
      <section className="hidden bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center lg:block" />
    </main>
  );
}
