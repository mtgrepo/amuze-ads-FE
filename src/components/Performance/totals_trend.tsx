import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { compactNumber, parseLocalDate, rate } from "../Dashboard/admin/dashboard_utils";
import { METRIC_LABELS, signedChange, TOTAL_KEY, type DayTotals, type Metric, type PeriodTotals } from "./performance_types";

const METRICS: Metric[] = ["impressions", "reach", "clicks", "watches", "engagements"];

// The note after the change on each tile.
function tileNote(metric: Metric, t?: PeriodTotals): string {
    if (!t) return "";
    switch (metric) {
        case "impressions": return "vs previous";
        case "reach": return t.totalReach ? `${(t.totalImpressions / t.totalReach).toFixed(1)} views each` : "views each —";
        case "clicks": return `${rate(t.totalClicks, t.totalImpressions)} CTR`;
        case "watches": return `${rate(t.totalCompletions, t.totalWatches)} VCR`;
        case "engagements": return "clicks + watches";
    }
}

const W = 640;
const H = 200;

function toPoints(values: number[], max: number): string {
    const n = values.length;
    return values
        .map((v, i) => `${(n > 1 ? (i * W) / (n - 1) : W / 2).toFixed(1)},${(194 - (v / max) * 188).toFixed(1)}`)
        .join(" ");
}

/** Metric tiles that pick what the chart shows, and the chart for the picked metric (optionally against the previous period). */
export function TotalsTrend({ current, previous, metric, onMetric, days, prevDays, compare, rangeLabel, isLoading }: {
    current?: PeriodTotals;
    previous?: PeriodTotals;
    metric: Metric;
    onMetric: (metric: Metric) => void;
    days: DayTotals[];
    prevDays: DayTotals[];
    compare: boolean;
    rangeLabel: string;
    isLoading: boolean;
}) {
    const series = days.map((d) => d[metric]);
    const prev = days.map((_, i) => prevDays[i]?.[metric] ?? 0);
    const max = Math.max(...series, ...(compare ? prev : []), 1) * 1.12;
    const line = toPoints(series, max);
    const hasData = series.some((v) => v > 0) || (compare && prev.some((v) => v > 0));
    const label = METRIC_LABELS[metric];
    const ticks = days.length ? [days[0], days[Math.floor((days.length - 1) / 2)], days[days.length - 1]] : [];

    return (
        <section aria-label="Totals and trend" className="overflow-hidden rounded-2xl border bg-card">
            <div className="grid border-b [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                {METRICS.map((m) => {
                    const value = current?.[TOTAL_KEY[m]] ?? 0;
                    const change = signedChange(value, previous?.[TOTAL_KEY[m]] ?? 0);
                    const on = m === metric;
                    return (
                        <button
                            key={m}
                            type="button"
                            aria-pressed={on}
                            onClick={() => onMetric(m)}
                            className={cn(
                                "relative flex flex-col gap-1.5 border-r px-4 py-3.5 text-left transition-colors hover:bg-muted/50",
                                on && "bg-primary/[0.04] shadow-[inset_0_-2px_0_var(--primary)]",
                            )}
                        >
                            <span className="text-[13px] text-muted-foreground">{METRIC_LABELS[m]}</span>
                            <span className="font-mono text-2xl font-medium tracking-tight tabular-nums">
                                {isLoading ? <span className="text-muted-foreground">…</span> : compactNumber(value)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {change ? (
                                    <span className={cn("font-mono tabular-nums", change.up ? "text-success" : "text-destructive")}>{change.text}</span>
                                ) : (
                                    <span className="font-mono">—</span>
                                )}{" "}
                                {tileNote(m, current)}
                            </span>
                        </button>
                    );
                })}
            </div>
            <div className="flex flex-col gap-2.5 px-5 pb-3.5 pt-[18px]">
                <div className="flex flex-wrap gap-4 text-xs text-foreground/80">
                    <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-3.5 rounded-sm bg-primary" />{label}, {rangeLabel}</span>
                    {compare && (
                        <span className="inline-flex items-center gap-1.5"><span className="w-3.5 border-t-2 border-dashed border-muted-foreground/60" />Previous period</span>
                    )}
                </div>
                <div className="relative">
                    {!hasData && (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                            No {label.toLowerCase()} in this period yet
                        </div>
                    )}
                    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${label} per day, ${rangeLabel}`} className="block h-60 w-full">
                        {[50, 100, 150].map((y) => <line key={y} x1="0" y1={y} x2={W} y2={y} className="stroke-border" />)}
                        {hasData && (
                            <>
                                <polygon points={`0,${H} ${line} ${W},${H}`} className="fill-primary" fillOpacity={0.08} />
                                {compare && (
                                    <polyline points={toPoints(prev, max)} fill="none" className="stroke-muted-foreground/70" strokeWidth={1.5} strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
                                )}
                                <polyline points={line} fill="none" className="stroke-primary" strokeWidth={2.25} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                            </>
                        )}
                    </svg>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                    {ticks.map((d, i) => <span key={i}>{format(parseLocalDate(d.date), "d MMM")}</span>)}
                </div>
            </div>
        </section>
    );
}
