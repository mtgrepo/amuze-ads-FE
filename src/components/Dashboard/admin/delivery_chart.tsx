import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { useAdminTrendQuery } from "../../../Composable/Query/dailyAdStats/useDailyAdStatsQuery";
import { Panel, PanelHeader, PanelLoading } from "./panel";
import { compactNumber, eachDay, parseLocalDate, type DateRange } from "./dashboard_utils";

function Legend() {
    return (
        <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-primary" />Clicks</span>
            <span className="flex items-center gap-1.5"><span className="w-3 border-t-[1.5px] border-dashed border-muted-foreground" />Watches</span>
        </div>
    );
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: { date: string; clicks: number; watches: number } }[] }) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
            <div className="mb-1 font-medium">{format(parseLocalDate(point.date), "EEE, d MMM")}</div>
            <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 tabular-nums">
                <span className="text-muted-foreground">Clicks</span><span className="text-right">{point.clicks.toLocaleString()}</span>
                <span className="text-muted-foreground">Watches</span><span className="text-right">{point.watches.toLocaleString()}</span>
            </div>
        </div>
    );
}

export function DeliveryChart({ range }: { range: DateRange }) {
    const { trendData, isLoading } = useAdminTrendQuery(range.from, range.to);

    const byDate = new Map(trendData.map((d) => [d.date.slice(0, 10), d]));
    const points = eachDay(range).map((date) => ({
        date,
        clicks: byDate.get(date)?.clicks ?? 0,
        watches: byDate.get(date)?.watches ?? 0,
    }));
    const hasData = points.some((p) => p.clicks > 0 || p.watches > 0);

    return (
        <Panel>
            <PanelHeader title="Delivery" meta={<Legend />} />
            {isLoading ? (
                <PanelLoading rows={4} />
            ) : (
                <div className="relative mt-4 h-56">
                    {!hasData && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground">
                            No clicks or watches in this period yet
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
                                width={40}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                                tickFormatter={(v: number) => compactNumber(v)}
                                allowDecimals={false}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
                            <Line hide={!hasData} type="monotone" dataKey="clicks" stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
                            <Line hide={!hasData} type="monotone" dataKey="watches" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Panel>
    );
}
