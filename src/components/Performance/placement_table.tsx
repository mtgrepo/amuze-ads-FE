import { placementLabel, rate } from "../Dashboard/admin/dashboard_utils";
import { TD, TH } from "./performance_types";
import type { PlacementBreakdownItem } from "../../dto/response/dailyAdStats/dailyAdStatsResponse";


const count = (n: number) => (n ? n.toLocaleString() : "—");

/** Delivery per placement in the range. */
export function PlacementTable({ rows, isLoading }: { rows: PlacementBreakdownItem[]; isLoading: boolean }) {
    return (
        <section aria-labelledby="by-placement" className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5 rounded-2xl border bg-card px-5 py-[18px]">
            <h2 id="by-placement" className="text-[15px] font-semibold">By placement</h2>
            {isLoading ? (
                <div className="h-32 animate-pulse rounded-lg bg-muted" />
            ) : rows.length === 0 ? (
                <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground">No placements served in this period</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[420px] border-collapse text-[13px]">
                        <thead>
                            <tr>
                                <th className={`${TH} text-left`}>Placement</th>
                                <th className={TH}>Impr.</th>
                                <th className={TH}>Reach</th>
                                <th className={TH}>CTR</th>
                                <th className={TH}>VCR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((p) => (
                                <tr key={p.placementKey}>
                                    <td className={`${TD} text-left`}>{placementLabel(p.placementKey)}</td>
                                    <td className={`${TD} font-mono tabular-nums`}>{count(p.impressions)}</td>
                                    <td className={`${TD} font-mono tabular-nums`}>{count(p.reach)}</td>
                                    <td className={`${TD} font-mono tabular-nums`}>{rate(p.clicks, p.impressions)}</td>
                                    <td className={`${TD} font-mono tabular-nums text-foreground/80`}>{rate(p.completions, p.watches)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
