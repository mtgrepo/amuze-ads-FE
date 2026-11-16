import { cn } from "@/lib/utils";
import { rate } from "../Dashboard/admin/dashboard_utils";
import { TD, TH, groupLabel } from "./performance_types";
import type { DemographicRow } from "../../dto/response/dailyAdStats/dailyAdStatsResponse";


const count = (n: number) => (n ? n.toLocaleString() : "—");

function BreakdownCard({ id, title, target, rows, isLoading }: {
    id: string;
    title: string;
    /** What the selected ad is set to reach, e.g. "Men" or "18–35". */
    target?: string;
    rows: DemographicRow[];
    isLoading: boolean;
}) {
    const total = rows.reduce((sum, r) => sum + r.impressions, 0);
    return (
        <section aria-labelledby={id} className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5 rounded-2xl border bg-card px-5 py-[18px]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={id} className="text-[15px] font-semibold">{title}</h2>
                {target && <span className="text-xs text-muted-foreground">This ad targets <span className="font-medium text-foreground">{target}</span></span>}
            </div>
            {isLoading ? (
                <div className="h-32 animate-pulse rounded-lg bg-muted" />
            ) : total === 0 && rows.every((r) => !r.clicks) ? (
                <div className="flex min-h-32 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    No audience data in this period. It's counted from when the app sends age and gender.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] border-collapse text-[13px]">
                        <thead>
                            <tr>
                                <th className={`${TH} text-left`}>{title.replace("By ", "").replace(/^./, (c) => c.toUpperCase())}</th>
                                <th className={`${TH} w-[32%] text-left`}>Share of views</th>
                                <th className={TH}>Impr.</th>
                                <th className={TH}>Clicks</th>
                                <th className={TH}>CTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => {
                                const share = total ? r.impressions / total : 0;
                                return (
                                    <tr key={r.group}>
                                        <td className={cn(`${TD} text-left`, r.group === "unknown" && "text-muted-foreground")}>{groupLabel(r.group)}</td>
                                        <td className={`${TD} text-left`}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 flex-1 rounded-full bg-muted">
                                                    <div className={cn("h-1.5 rounded-full", r.group === "unknown" ? "bg-muted-foreground/40" : "bg-primary")} style={{ width: `${share * 100}%` }} />
                                                </div>
                                                <span className="w-10 text-right font-mono tabular-nums text-muted-foreground">{total ? `${Math.round(share * 100)}%` : "—"}</span>
                                            </div>
                                        </td>
                                        <td className={`${TD} font-mono tabular-nums`}>{count(r.impressions)}</td>
                                        <td className={`${TD} font-mono tabular-nums`}>{count(r.clicks)}</td>
                                        <td className={`${TD} font-mono tabular-nums text-foreground/80`}>{rate(r.clicks, r.impressions)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

/** Who saw the ads, by age group and gender, from what the app reports with each event. */
export function AudienceCards({ byAge, byGender, isLoading, targetAge, targetGender }: {
    byAge: DemographicRow[];
    byGender: DemographicRow[];
    isLoading: boolean;
    targetAge?: string;
    targetGender?: string;
}) {
    return (
        <div className="flex flex-wrap items-stretch gap-4">
            <BreakdownCard id="by-age" title="By age" target={targetAge} rows={byAge} isLoading={isLoading} />
            <BreakdownCard id="by-gender" title="By gender" target={targetGender} rows={byGender} isLoading={isLoading} />
        </div>
    );
}
