import { cn } from "@/lib/utils";
import { useAdminOverviewQuery } from "../../../Composable/Query/dailyAdStats/useAdminOverviewQuery";
import { useAdminTrendQuery } from "../../../Composable/Query/dailyAdStats/useAdminTrendQuery";
import { useDashboardSummaryQuery } from "../../../Composable/Query/dashboard/useDashboardSummaryQuery";
import { compactNumber, eachDay, percentChange, priorRange, rate, type DateRange } from "./dashboard_utils";

/** A small trend line; nothing when there's no daily series. */
function Sparkline({ values }: { values: number[] }) {
    if (values.length < 2 || values.every((v) => v === 0)) return null;
    const max = Math.max(...values) * 1.15 || 1;
    const points = values.map((v, i) => `${((i / (values.length - 1)) * 96).toFixed(1)},${(26 - (v / max) * 24).toFixed(1)}`).join(" ");
    return (
        <svg width="72" height="24" viewBox="0 0 96 28" preserveAspectRatio="none" aria-hidden="true" className="text-primary">
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

function Change({ value }: { value: number | null }) {
    if (value === null) return null;
    return <span className={cn("font-mono", value >= 0 ? "text-success" : "text-destructive")}>{value >= 0 ? "+" : ""}{value}%</span>;
}

interface Tile {
    label: string;
    value: string;
    unit?: string;
    change: number | null;
    sub: string;
    spark: number[];
}

/** The range's headline numbers, each against the period before. */
export function MetricTiles({ range }: { range: DateRange }) {
    const prior = priorRange(range);
    const { overviewData: now, isLoading } = useAdminOverviewQuery(range.from, range.to);
    const { overviewData: before } = useAdminOverviewQuery(prior.from, prior.to);
    const { trendData } = useAdminTrendQuery(range.from, range.to);
    const { summary } = useDashboardSummaryQuery(range.from, range.to);
    const { summary: priorSummary } = useDashboardSummaryQuery(prior.from, prior.to);

    const byDate = new Map((trendData ?? []).map((d) => [d.date.slice(0, 10), d]));
    const days = eachDay(range);
    const series = (pick: (d: NonNullable<ReturnType<typeof byDate.get>>) => number) => days.map((day) => { const d = byDate.get(day); return d ? pick(d) : 0; });

    const v = (n?: number) => n ?? 0;
    const tiles: Tile[] = [
        { label: "Impressions", value: compactNumber(v(now?.totalImpressions)), change: percentChange(v(now?.totalImpressions), v(before?.totalImpressions)), sub: "vs previous", spark: series((d) => d.impressions) },
        { label: "Reach", value: compactNumber(v(now?.totalReach)), change: percentChange(v(now?.totalReach), v(before?.totalReach)), sub: "people", spark: series((d) => d.reach) },
        { label: "Clicks", value: compactNumber(v(now?.totalClicks)), change: percentChange(v(now?.totalClicks), v(before?.totalClicks)), sub: `${rate(v(now?.totalClicks), v(now?.totalImpressions))} CTR`, spark: series((d) => d.clicks) },
        { label: "Watches", value: compactNumber(v(now?.totalWatches)), change: percentChange(v(now?.totalWatches), v(before?.totalWatches)), sub: `${rate(v(now?.totalCompletions), v(now?.totalWatches))} VCR`, spark: series((d) => d.watches) },
        { label: "Engagements", value: compactNumber(v(now?.totalEngagements)), change: percentChange(v(now?.totalEngagements), v(before?.totalEngagements)), sub: "clicks + watches", spark: series((d) => d.engagements) },
        { label: "Points spent", value: compactNumber(v(summary?.revenue.earned.inRange)), unit: "pts", change: percentChange(v(summary?.revenue.earned.inRange), v(priorSummary?.revenue.earned.inRange)), sub: "on ads, after refunds", spark: [] },
        { label: "Point sales", value: compactNumber(v(summary?.revenue.received.inRange)), unit: "MMK", change: percentChange(v(summary?.revenue.received.inRange), v(priorSummary?.revenue.received.inRange)), sub: "money paid for points", spark: [] },
    ];

    return (
        <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7">
            {tiles.map((t) => (
                <div key={t.label} className="flex flex-col gap-1.5 rounded-xl border bg-card px-4 py-3.5">
                    <span className="text-xs text-muted-foreground">{t.label}</span>
                    <span className="font-mono text-2xl font-medium tracking-tight tabular-nums">
                        {isLoading ? <span className="text-muted-foreground">…</span> : t.value}
                        {t.unit && <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">{t.unit}</span>}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground"><Change value={t.change} /> {t.sub}</span>
                        <Sparkline values={t.spark} />
                    </div>
                </div>
            ))}
        </section>
    );
}
