import { useAdminOverviewQuery } from "../../../Composable/Query/dailyAdStats/useDailyAdStatsQuery";
import { Panel, PanelLoading } from "./panel";
import { compactNumber, percentChange, priorRange, type DateRange } from "./dashboard_utils";

function Change({ value }: { value: number | null }) {
    if (value === null) return null;
    return (
        <span className={`text-xs tabular-nums ${value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {value >= 0 ? "+" : ""}{value}%
        </span>
    );
}

export function HeadlinePanel({ range, rangeLabel }: { range: DateRange; rangeLabel: string }) {
    const prior = priorRange(range);
    const { overviewData, isLoading } = useAdminOverviewQuery(range.from, range.to);
    const { overviewData: priorData } = useAdminOverviewQuery(prior.from, prior.to);

    const clicks = overviewData?.totalClicks ?? 0;
    const watches = overviewData?.totalWatches ?? 0;

    return (
        <Panel className="flex flex-col justify-between">
            <div>
                <div className="text-xs text-muted-foreground">Clicks, {rangeLabel}</div>
                {isLoading ? (
                    <PanelLoading rows={1} />
                ) : (
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-4xl font-medium tracking-tight tabular-nums">{compactNumber(clicks)}</span>
                        {percentChange(clicks, priorData?.totalClicks ?? 0) !== null && (
                            <span className="text-xs text-muted-foreground">
                                <Change value={percentChange(clicks, priorData?.totalClicks ?? 0)} /> vs previous period
                            </span>
                        )}
                    </div>
                )}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                    <dt className="text-xs text-muted-foreground">Watches</dt>
                    <dd className="mt-0.5 flex items-baseline gap-2 text-base font-medium tabular-nums">
                        {watches.toLocaleString()}
                        <Change value={percentChange(watches, priorData?.totalWatches ?? 0)} />
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">Live ads</dt>
                    <dd className="mt-0.5 text-base font-medium tabular-nums">{overviewData?.activeAds ?? 0}</dd>
                </div>
            </dl>
        </Panel>
    );
}
