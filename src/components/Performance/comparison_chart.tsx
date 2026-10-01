import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { compactNumber, parseLocalDate } from "../Dashboard/admin/dashboard_utils";
import { METRIC_LABELS, type DayTotals, type Metric } from "./performance_types";

interface Point {
    date: string;
    prevDate: string;
    value: number;
    prev: number;
}

function ChartTooltip({ active, payload, metric }: { active?: boolean; payload?: { payload: Point }[]; metric: Metric }) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
            <div className="mb-1 font-medium">{METRIC_LABELS[metric]}</div>
            <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 tabular-nums">
                <span>{format(parseLocalDate(p.date), "EEE, d MMM")}</span><span className="text-right">{p.value.toLocaleString()}</span>
                <span className="text-muted-foreground">{format(parseLocalDate(p.prevDate), "EEE, d MMM")}</span>
                <span className="text-right text-muted-foreground">{p.prev.toLocaleString()}</span>
            </div>
        </div>
    );
}

/** The selected metric per day, against the same days of the previous period (dashed). */
export function ComparisonChart({ metric, current, previous, rangeLabel, previousLabel }: {
    metric: Metric;
    current: DayTotals[];
    previous: DayTotals[];
    rangeLabel: string;
    previousLabel: string;
}) {
    // Both periods have the same number of days, so day i lines up with day i.
    const data: Point[] = current.map((day, i) => ({
        date: day.date,
        prevDate: previous[i]?.date ?? day.date,
        value: day[metric],
        prev: previous[i]?.[metric] ?? 0,
    }));
    const hasData = data.some((p) => p.value > 0 || p.prev > 0);

    return (
        <div className="px-4 pb-3 pt-3.5">
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-primary" />{METRIC_LABELS[metric]}, {rangeLabel}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 border-t-[1.5px] border-dashed border-muted-foreground/60" />{previousLabel}</span>
            </div>
            <div className="relative mt-3 h-64">
                {!hasData && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground">
                        No {METRIC_LABELS[metric].toLowerCase()} in these periods yet
                    </div>
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
                            tickFormatter={(v: number) => compactNumber(v)}
                            allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip metric={metric} />} cursor={{ stroke: "var(--border)" }} />
                        <Line hide={!hasData} type="monotone" dataKey="prev" stroke="var(--muted-foreground)" strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={false} />
                        <Line
                            hide={!hasData}
                            type="monotone"
                            dataKey="value"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            // Dots show the actual days; skip them when there are too many to read.
                            dot={data.length <= 31 ? { r: 2.5, fill: "var(--primary)", strokeWidth: 0 } : false}
                            activeDot={{ r: 3.5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
