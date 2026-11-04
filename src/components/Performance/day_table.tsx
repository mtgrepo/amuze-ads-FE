import { format } from "date-fns";
import { parseLocalDate, rate } from "../Dashboard/admin/dashboard_utils";
import { TD, TH, type DayTotals } from "./performance_types";

type Shaded = "impressions" | "reach" | "clicks" | "watches";
const SHADED: Shaded[] = ["impressions", "reach", "clicks", "watches"];

/** One row per day, newest first. Count columns are shaded by how busy the day was for that column. */
export function DayTable({ days }: { days: DayTotals[] }) {
    const newestFirst = [...days].reverse();
    const bounds = Object.fromEntries(SHADED.map((k) => {
        const vals = days.map((d) => d[k]);
        return [k, { lo: Math.min(...vals), hi: Math.max(...vals) }];
    })) as Record<Shaded, { lo: number; hi: number }>;
    const heat = (k: Shaded, v: number) => {
        const { lo, hi } = bounds[k];
        if (!hi) return undefined;
        const share = 4 + ((v - lo) / (hi - lo || 1)) * 20;
        return { background: `color-mix(in oklab, var(--primary) ${share.toFixed(1)}%, transparent)` };
    };

    return (
        <section aria-labelledby="daily" className="flex flex-col gap-2.5 rounded-2xl border bg-card px-5 py-[18px]">
            <div className="flex flex-wrap items-baseline justify-between gap-2.5">
                <h2 id="daily" className="text-[15px] font-semibold">Day by day</h2>
                <span className="text-xs text-muted-foreground">Darker cells are a busier day for that column</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-[13px]">
                    <thead>
                        <tr>
                            <th className={`${TH} text-left`}>Date</th>
                            <th className={TH}>Impressions</th>
                            <th className={TH}>Reach</th>
                            <th className={TH}>Clicks</th>
                            <th className={TH}>CTR</th>
                            <th className={TH}>Watches</th>
                            <th className={TH}>VCR</th>
                            <th className={TH}>Engagements</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newestFirst.map((d) => (
                            <tr key={d.date}>
                                <td className={`${TD} whitespace-nowrap text-left`}>{format(parseLocalDate(d.date), "EEE, d MMM")}</td>
                                <td className={`${TD} font-mono tabular-nums`} style={heat("impressions", d.impressions)}>{d.impressions.toLocaleString()}</td>
                                <td className={`${TD} font-mono tabular-nums`} style={heat("reach", d.reach)}>{d.reach.toLocaleString()}</td>
                                <td className={`${TD} font-mono tabular-nums`} style={heat("clicks", d.clicks)}>{d.clicks.toLocaleString()}</td>
                                <td className={`${TD} font-mono tabular-nums`}>{rate(d.clicks, d.impressions)}</td>
                                <td className={`${TD} font-mono tabular-nums`} style={heat("watches", d.watches)}>{d.watches.toLocaleString()}</td>
                                <td className={`${TD} font-mono tabular-nums`}>{rate(d.completions, d.watches)}</td>
                                <td className={`${TD} font-mono tabular-nums`}>{d.engagements.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
