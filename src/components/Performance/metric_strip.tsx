import { cn } from "@/lib/utils";
import { compactNumber, percentChange, rate } from "../Dashboard/admin/dashboard_utils";
import { METRIC_LABELS, TOTAL_KEY, type Metric, type PeriodTotals } from "./performance_types";

function Change({ value }: { value: number | null }) {
    if (value === null) return null;
    return (
        <span className={value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
            {value >= 0 ? "+" : ""}{value}%
        </span>
    );
}

// The rate under a count: CTR = clicks / impressions, VCR = completions / watches, engagement rate = engagements / impressions.
const RATE: Partial<Record<Metric, { label: string; part: (t: PeriodTotals) => number; base: (t: PeriodTotals) => number }>> = {
    clicks: { label: "CTR", part: (t) => t.totalClicks, base: (t) => t.totalImpressions },
    watches: { label: "VCR", part: (t) => t.totalCompletions, base: (t) => t.totalWatches },
    engagements: { label: "eng.", part: (t) => t.totalEngagements, base: (t) => t.totalImpressions },
};

/** The five metrics plus active ads. Each metric cell also picks what the chart shows. */
export function MetricStrip({ current, previous, selected, onSelect, activeAdsNote, lastCell, isLoading }: {
    current?: PeriodTotals;
    previous?: PeriodTotals;
    selected: Metric;
    onSelect: (metric: Metric) => void;
    activeAdsNote: string;
    /** Replaces the active-ads cell, e.g. a single ad's spend. */
    lastCell?: { label: string; value: string; note: string };
    isLoading: boolean;
}) {
    const metrics: Metric[] = ["impressions", "reach", "clicks", "watches", "engagements"];

    return (
        <div className="grid grid-cols-2 border-b sm:grid-cols-3 lg:grid-cols-6">
            {metrics.map((metric) => {
                const value = current?.[TOTAL_KEY[metric]] ?? 0;
                const change = percentChange(value, previous?.[TOTAL_KEY[metric]] ?? 0);
                const rateOf = RATE[metric];
                return (
                    <button
                        key={metric}
                        type="button"
                        aria-pressed={selected === metric}
                        onClick={() => onSelect(metric)}
                        className={cn(
                            "relative border-r px-4 py-3.5 text-left transition-colors hover:bg-muted/50",
                            selected === metric && "after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-primary"
                        )}
                    >
                        <div className="text-xs text-muted-foreground">{METRIC_LABELS[metric]}</div>
                        <div className="mt-0.5 text-2xl font-medium tracking-tight tabular-nums">
                            {isLoading ? <span className="text-muted-foreground">…</span> : compactNumber(value)}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                            {rateOf ? (
                                <>{current ? rate(rateOf.part(current), rateOf.base(current)) : "—"} {rateOf.label}{change !== null && <> · <Change value={change} /></>}</>
                            ) : change !== null ? (
                                <><Change value={change} /> vs previous</>
                            ) : (
                                "vs previous —"
                            )}
                        </div>
                    </button>
                );
            })}
            <div className="px-4 py-3.5">
                <div className="text-xs text-muted-foreground">{lastCell?.label ?? "Active ads"}</div>
                <div className="mt-0.5 text-2xl font-medium tracking-tight tabular-nums">{lastCell?.value ?? current?.activeAds ?? 0}</div>
                <div className="text-xs text-muted-foreground">{lastCell?.note ?? activeAdsNote}</div>
            </div>
        </div>
    );
}
