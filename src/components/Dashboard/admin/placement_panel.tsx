import { usePlacementBreakdownQuery } from "../../../Composable/Query/dailyAdStats/useDailyAdStatsQuery";
import { Panel, PanelHeader, PanelLoading } from "./panel";
import { compactNumber, placementLabel, rate, type DateRange } from "./dashboard_utils";

export function PlacementPanel({ range }: { range: DateRange }) {
    const { placementData, isLoading } = usePlacementBreakdownQuery(range.from, range.to);
    const max = Math.max(...placementData.map((p) => p.clicks), 0);

    return (
        <Panel>
            <PanelHeader title="By placement" meta="Clicks · CTR · view rate" />
            {isLoading ? (
                <PanelLoading rows={3} />
            ) : placementData.length === 0 ? (
                <div className="flex min-h-28 items-center justify-center text-sm text-muted-foreground">
                    No placements served in this period
                </div>
            ) : (
                <div className="mt-4 space-y-4">
                    {placementData.map((p) => (
                        <div key={p.placementKey}>
                            <div className="mb-1.5 flex justify-between text-sm">
                                <span>{placementLabel(p.placementKey)}</span>
                                <span className="tabular-nums text-muted-foreground">
                                    <span className="text-foreground">{compactNumber(p.clicks)}</span> · {rate(p.clicks, p.impressions)} · {rate(p.watches, p.impressions)}
                                </span>
                            </div>
                            <div className="h-1 rounded-full bg-muted">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${max ? (p.clicks / max) * 100 : 0}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
}
