import { cn } from "@/lib/utils";
import { useAdminOverviewQuery } from "../../../Composable/Query/dailyAdStats/useAdminOverviewQuery";
import { useAdminTrendQuery } from "../../../Composable/Query/dailyAdStats/useAdminTrendQuery";
import { useDashboardSummaryQuery } from "../../../Composable/Query/dashboard/useDashboardSummaryQuery";
import type { AdminTrendItem } from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";
import { compactNumber, eachDay, percentChange, priorRange, rate, type DateRange } from "./dashboard_utils";

/** A small trend line; nothing when there's no daily series. */
function Sparkline({ values }: { values: number[] }) {
    if (values.length < 2) return null;
    const max = Math.max(...values, 1) * 1.15;
    const points = values.map((v, i) => `${((i / (values.length - 1)) * 96).toFixed(1)},${(26 - (v / max) * 24).toFixed(1)}`).join(" ");
    return (
        <svg width="72" height="24" viewBox="0 0 96 28" preserveAspectRatio="none" aria-hidden="true" className="shrink-0 text-primary">
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

/** The period's headline numbers, each with its change from the period before. */
export function MetricTiles({ range, previousLabel }: { range: DateRange; previousLabel: string }) {
    const prior = priorRange(range);
    const { overviewData: now, isLoading } = useAdminOverviewQuery(range.from, range.to);
    const { overviewData: before } = useAdminOverviewQuery(prior.from, prior.to);
    const { trendData } = useAdminTrendQuery(range.from, range.to);
    const { summary } = useDashboardSummaryQuery(range.from, range.to);
    const { summary: priorSummary } = useDashboardSummaryQuery(prior.from, prior.to);

    const byDate = new Map(((trendData ?? []) as AdminTrendItem[]).map((d) => [d.date.slice(0, 10), d]));
    const days = eachDay(range);
    const series = (pick: (d: AdminTrendItem) => number) => days.map((day) => { const d = byDate.get(day); return d ? pick(d) : 0; });
    const v = (n?: number) => Number(n ?? 0);

    const tiles = [
        { label: "Impressions", value: v(now?.totalImpressions), prev: v(before?.totalImpressions), sub: previousLabel, spark: series((d) => d.impressions) },
        { label: "Reach", value: v(now?.totalReach), prev: v(before?.totalReach), sub: "people", spark: series((d) => d.reach) },
        { label: "Clicks", value: v(now?.totalClicks), prev: v(before?.totalClicks), sub: `${rate(v(now?.totalClicks), v(now?.totalImpressions))} CTR`, spark: series((d) => d.clicks) },
        { label: "Watches", value: v(now?.totalWatches), prev: v(before?.totalWatches), sub: `${rate(v(now?.totalCompletions), v(now?.totalWatches))} VCR`, spark: series((d) => d.watches) },
        { label: "Engagements", value: v(now?.totalEngagements), prev: v(before?.totalEngagements), sub: "clicks + watches", spark: series((d) => d.engagements) },
        { label: "Points spent", value: v(summary?.revenue.earned.inRange), prev: v(priorSummary?.revenue.earned.inRange), sub: "pts", spark: [] as number[] },
    ];

    return (
        <section aria-label="Key numbers" className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
            {tiles.map((t) => {
                const change = percentChange(t.value, t.prev);
                return (
                    <div key={t.label} className="flex flex-col gap-1.5 rounded-xl border bg-card px-4 py-3.5">
                        <span className="text-[13px] text-muted-foreground">{t.label}</span>
                        <span className="font-mono text-2xl font-medium tracking-tight tabular-nums">
                            {isLoading ? <span className="text-muted-foreground">…</span> : compactNumber(t.value)}
                        </span>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                                {change !== null && <span className={cn("font-mono", change >= 0 ? "text-success" : "text-destructive")}>{change >= 0 ? "+" : "−"}{Math.abs(change)}%</span>} {t.sub}
                            </span>
                            <Sparkline values={t.spark} />
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
