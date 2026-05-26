import clsx from "clsx";

export function MetricCard({
  label,
  value,
  trend,
  tone = "default"
}: {
  label: string;
  value: string;
  trend?: string;
  tone?: "default" | "green" | "amber";
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-2xl font-semibold tracking-normal text-ink">{value}</div>
        {trend ? (
          <div
            className={clsx(
              "rounded px-2 py-1 text-xs font-semibold",
              tone === "green" && "bg-brand-50 text-brand-700",
              tone === "amber" && "bg-amber-50 text-amber-700",
              tone === "default" && "bg-slate-100 text-slate-600"
            )}
          >
            {trend}
          </div>
        ) : null}
      </div>
    </div>
  );
}
