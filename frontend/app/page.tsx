import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-white text-ink">
      <section className="relative min-h-[92vh] overflow-hidden bg-[url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-ink/58" />
        <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-600 text-sm font-bold">IG</div>
            <div>
              <div className="font-semibold">InnGrid</div>
              <div className="text-xs text-white/75">Hospitality operations SaaS</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Sign in
            </Link>
            <Link href="/register" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-100">
              Start workspace
            </Link>
          </div>
        </header>
        <div className="relative z-10 flex min-h-[72vh] items-center px-5 md:px-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-normal text-white md:text-7xl">InnGrid</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/86">
              Tenant-aware operations, reservations, rooms, and analytics for hotels, resorts, serviced apartments, Airbnb
              operators, airport lounges, and hospitality groups.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
                Create workspace
              </Link>
              <Link href="/login" className="rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                View dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="-mt-10 grid gap-4 px-5 pb-10 md:grid-cols-3 md:px-10">
        {[
          ["Tenant isolation", "Shared infrastructure with strict tenant-scoped operational data."],
          ["Hospitality workflows", "Properties, rooms, reservations, guests, check-ins, and check-outs."],
          ["Executive analytics", "Occupancy, revenue, reservation lifecycle, and property performance."],
        ].map(([title, body]) => (
          <div key={title} className="relative rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
