import { compactNumber } from "../Dashboard/admin/dashboard_utils";
import type { PeriodTotals } from "./performance_types";

const pct = (part: number, base: number) => (base ? `${((part / base) * 100).toFixed(1)}%` : "—");

/** Impressions → reach → clicks / watches → completions, each step as a share of the one it follows. */
export function FunnelCard({ totals, isLoading }: { totals?: PeriodTotals; isLoading: boolean }) {
    const t = totals;
    const rows: { label: string; value: number; base: number | null }[] = t ? [
        { label: "Impressions", value: t.totalImpressions, base: null },
        { label: "Reach (people)", value: t.totalReach, base: t.totalImpressions },
        { label: "Clicks", value: t.totalClicks, base: t.totalReach },
        { label: "Watches (video starts)", value: t.totalWatches, base: t.totalReach },
        { label: "Completed videos", value: t.totalCompletions, base: t.totalWatches },
    ] : [];
    const top = t?.totalImpressions ?? 0;

    return (
        <section aria-labelledby="funnel" className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5 rounded-2xl border bg-card px-5 py-[18px]">
            <div className="flex flex-col gap-0.5">
                <h2 id="funnel" className="text-[15px] font-semibold">From seen to acted</h2>
                <span className="text-[13px] text-muted-foreground">Each step as a share of the one above it</span>
            </div>
            {isLoading ? (
                <div className="h-48 animate-pulse rounded-lg bg-muted" />
            ) : !top ? (
                <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">No impressions in this period</div>
            ) : rows.map((r) => (
                <div key={r.label} className="flex flex-col gap-[5px]">
                    <div className="flex justify-between gap-2.5 text-[13px]">
                        <span>{r.label}</span>
                        <span>
                            <span className="font-mono font-medium tabular-nums">{compactNumber(r.value)}</span>{" "}
                            {r.base !== null && <span className="font-mono tabular-nums text-muted-foreground">{pct(r.value, r.base)}</span>}
                        </span>
                    </div>
                    <div className="h-[22px] rounded-md bg-muted">
                        <div
                            className="h-[22px] rounded-md bg-primary"
                            style={{ opacity: r.base === null ? 1 : 0.75, width: `${Math.max(1.5, Math.min(100, Math.sqrt(r.value / top) * 100)).toFixed(1)}%` }}
                        />
                    </div>
                </div>
            ))}
        </section>
    );
}
