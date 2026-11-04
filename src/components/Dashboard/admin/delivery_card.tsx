import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAdminTrendQuery } from "../../../Composable/Query/dailyAdStats/useAdminTrendQuery";
import type { AdminTrendItem } from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";
import { compactNumber, eachDay, parseLocalDate, percentChange, priorRange, type DateRange } from "./dashboard_utils";

type Metric = "impressions" | "clicks" | "watches";
const METRICS: { key: Metric; label: string }[] = [
    { key: "impressions", label: "Impressions" },
    { key: "clicks", label: "Clicks" },
    { key: "watches", label: "Watches" },
];

const W = 640, H = 200;
const points = (values: number[], max: number) =>
    values.map((v, i) => `${(values.length > 1 ? (i * W) / (values.length - 1) : 0).toFixed(1)},${(H - 6 - (v / max) * (H - 12)).toFixed(1)}`).join(" ");

/** One metric per day against the same days of the period before (dashed). */
export function DeliveryCard({ range, rangeLabel }: { range: DateRange; rangeLabel: string }) {
    const [metric, setMetric] = useState<Metric>("impressions");
    const prior = priorRange(range);
    const { trendData } = useAdminTrendQuery(range.from, range.to);
    const { trendData: priorTrend } = useAdminTrendQuery(prior.from, prior.to);

    const fill = (days: string[], trend: AdminTrendItem[] | undefined) => {
        const byDate = new Map((trend ?? []).map((d) => [d.date.slice(0, 10), d]));
        return days.map((day) => Number(byDate.get(day)?.[metric] ?? 0));
    };
    const days = eachDay(range);
    const current = fill(days, trendData);
    const previous = fill(eachDay(prior), priorTrend);
    const max = Math.max(...current, ...previous, 1) * 1.12;
    const line = points(current, max);
    const total = current.reduce((a, b) => a + b, 0);
    const change = percentChange(total, previous.reduce((a, b) => a + b, 0));
    const axis = [days[0], days[Math.floor(days.length / 2)], days[days.length - 1]].map((d) => format(parseLocalDate(d), "EEE d MMM"));

    return (
        <section aria-labelledby="delivery" className="flex min-w-0 flex-col gap-3.5 rounded-xl border bg-card px-5 py-[18px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <h2 id="delivery" className="text-[15px] font-semibold">Delivery</h2>
                    <span className="text-[13px] text-muted-foreground">{rangeLabel} against the period before (dashed)</span>
                </div>
                <div role="group" aria-label="Chart metric" className="flex gap-0.5 rounded-[9px] bg-muted p-[3px]">
                    {METRICS.map((m) => (
                        <button
                            key={m.key}
                            type="button"
                            aria-pressed={m.key === metric}
                            onClick={() => setMetric(m.key)}
                            className={cn("h-[30px] rounded-[7px] px-3 text-[13px] font-medium text-muted-foreground", m.key === metric && "bg-card text-foreground shadow-sm ring-1 ring-border")}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-3xl font-medium tracking-tight tabular-nums">{compactNumber(total)}</span>
                {change !== null && <span className={cn("font-mono", change >= 0 ? "text-success" : "text-destructive")}>{change >= 0 ? "+" : "−"}{Math.abs(change)}%</span>}
                <span className="text-[13px] text-muted-foreground">vs previous period</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${metric} per day, ${rangeLabel.toLowerCase()}, total ${total}`} className="block h-[220px] w-full">
                {[50, 100, 150].map((y) => <line key={y} x1="0" y1={y} x2={W} y2={y} className="stroke-border" strokeWidth="1" />)}
                <polygon points={`0,${H} ${line} ${W},${H}`} className="fill-primary" fillOpacity="0.08" />
                <polyline points={points(previous, max)} fill="none" className="stroke-muted-foreground" strokeWidth="1.5" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
                <polyline points={line} fill="none" className="stroke-primary" strokeWidth="2.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="flex justify-between text-xs text-muted-foreground">
                {axis.map((a, i) => <span key={i}>{a}</span>)}
            </div>
        </section>
    );
}
