import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { compactNumber, rate, parseLocalDate } from "./dashboard_utils";

export interface DayTotals {
    date: string;
    impressions: number;
    clicks: number;
    watches: number;
    engagements: number;
}

type View = "clicksWatches" | "impressions" | "engagements" | "rates";

const VIEWS: { value: View; label: string }[] = [
    { value: "clicksWatches", label: "Clicks and watches" },
    { value: "impressions", label: "Impressions" },
    { value: "engagements", label: "Engagements" },
    { value: "rates", label: "Rates" },
];

interface Series {
    key: string;
    label: string;
    stroke: string;
    dashed?: boolean;
}

// Impressions and engagements are on very different scales from clicks, so each gets its own view.
const SERIES: Record<View, Series[]> = {
    clicksWatches: [
        { key: "clicks", label: "Clicks", stroke: "var(--primary)" },
        { key: "watches", label: "Watches", stroke: "var(--muted-foreground)", dashed: true },
    ],
    impressions: [{ key: "impressions", label: "Impressions", stroke: "var(--primary)" }],
    engagements: [{ key: "engagements", label: "Engagements", stroke: "var(--primary)" }],
    rates: [
        { key: "ctr", label: "CTR", stroke: "var(--primary)" },
        { key: "viewRate", label: "View rate", stroke: "var(--muted-foreground)", dashed: true },
        { key: "engagementRate", label: "Engagement rate", stroke: "color-mix(in oklch, var(--primary) 40%, transparent)" },
    ],
};

/** Percent of impressions, or null (a gap in the line) on days without impressions. */
const pctOf = (part: number, base: number) => (base ? (part / base) * 100 : null);

function Swatch({ series }: { series: Series }) {
    return series.dashed ? (
        <span className="w-3 border-t-[1.5px] border-dashed" style={{ borderColor: series.stroke }} />
    ) : (
        <span className="h-0.5 w-3 rounded" style={{ background: series.stroke }} />
    );
}

function ChartTooltip({ active, payload, view }: { active?: boolean; payload?: { payload: DayTotals }[]; view: View }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const rows: [string, string][] = view === "rates"
        ? [["CTR", rate(d.clicks, d.impressions)], ["View rate", rate(d.watches, d.impressions)], ["Engagement rate", rate(d.engagements, d.impressions)]]
        : [["Impressions", d.impressions.toLocaleString()], ["Clicks", d.clicks.toLocaleString()], ["Watches", d.watches.toLocaleString()], ["Engagements", d.engagements.toLocaleString()]];
    return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
            <div className="mb-1 font-medium">{format(parseLocalDate(d.date), "EEE, d MMM")}</div>
            <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 tabular-nums">
                {rows.map(([label, value]) => (
                    <span key={label} className="contents">
                        <span className="text-muted-foreground">{label}</span><span className="text-right">{value}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

/** Daily delivery with a tab per view: counts that share a scale, or the three rates. */
export function MetricChart({ points }: { points: DayTotals[] }) {
    const [view, setView] = useState<View>("clicksWatches");
    const series = SERIES[view];

    const data = points.map((p) => ({
        ...p,
        ctr: pctOf(p.clicks, p.impressions),
        viewRate: pctOf(p.watches, p.impressions),
        engagementRate: pctOf(p.engagements, p.impressions),
    }));
    const hasData = data.some((p) => series.some((s) => Number((p as Record<string, unknown>)[s.key] ?? 0) > 0));
    const emptyText = view === "rates" ? "Rates need impressions. None in this period yet" : "Nothing in this period yet";

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-4 text-xs text-muted-foreground">
                    {series.map((s) => (
                        <span key={s.key} className="flex items-center gap-1.5"><Swatch series={s} />{s.label}</span>
                    ))}
                </div>
                <div role="tablist" aria-label="Chart metric" className="flex rounded-lg border p-0.5">
                    {VIEWS.map((v) => (
                        <button
                            key={v.value}
                            role="tab"
                            aria-selected={view === v.value}
                            onClick={() => setView(v.value)}
                            className={cn(
                                "rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
                                view === v.value && "bg-muted text-foreground"
                            )}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="relative mt-4 h-56">
                {!hasData && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground">{emptyText}</div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid vertical={false} stroke="var(--border)" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                            tickFormatter={(d: string) => format(parseLocalDate(d), "d MMM")}
                        />
                        <YAxis
                            width={44}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                            tickFormatter={(v: number) => (view === "rates" ? `${Number(v.toFixed(2))}%` : compactNumber(v))}
                            allowDecimals={view === "rates"}
                        />
                        <Tooltip content={<ChartTooltip view={view} />} cursor={{ stroke: "var(--border)" }} />
                        {series.map((s, i) => (
                            <Line
                                key={s.key}
                                hide={!hasData}
                                type="monotone"
                                dataKey={s.key}
                                stroke={s.stroke}
                                strokeWidth={i === 0 ? 2 : 1.5}
                                strokeDasharray={s.dashed ? "4 4" : undefined}
                                // Rates skip days without impressions, so a day can stand alone; dots keep it visible.
                                dot={view === "rates" ? { r: 2.5, fill: s.stroke, strokeWidth: 0 } : false}
                                activeDot={{ r: 3 }}
                                connectNulls={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
