import { usePlacementBreakdownQuery } from "../../../Composable/Query/dailyAdStats/usePlacementBreakdownQuery";
import { placementLabel, rate, type DateRange } from "./dashboard_utils";

/** Each placement's share of all clicks in the range, with its CTR. */
export function PlacementsCard({ range }: { range: DateRange }) {
    const { placementData, isLoading } = usePlacementBreakdownQuery(range.from, range.to);
    const totalClicks = placementData.reduce((sum, p) => sum + p.clicks, 0);
    const rows = placementData.map((p) => ({ ...p, share: totalClicks ? (p.clicks / totalClicks) * 100 : 0 }));
    const top = Math.max(...rows.map((r) => r.share), 1);

    return (
        <section aria-labelledby="placements" className="flex min-w-0 flex-col gap-3.5 rounded-xl border bg-card px-5 py-[18px]">
            <div className="flex items-baseline justify-between gap-3">
                <h2 id="placements" className="text-[15px] font-semibold">Where clicks come from</h2>
                <span className="text-xs text-muted-foreground">Share of clicks · CTR</span>
            </div>
            {isLoading ? (
                <div className="h-24 animate-pulse rounded-lg bg-muted" />
            ) : rows.length === 0 ? (
                <div className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">No placements served in this period</div>
            ) : rows.map((p) => (
                <div key={p.placementKey} className="flex flex-col gap-1.5">
                    <div className="flex justify-between gap-2.5">
                        <span>{placementLabel(p.placementKey)}</span>
                        <span className="font-mono text-muted-foreground">{Math.round(p.share)}% · {rate(p.clicks, p.impressions)} CTR</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${(p.share / top) * 100}%` }} />
                    </div>
                </div>
            ))}
        </section>
    );
}
