import { useAdminOverviewQuery } from "../../../Composable/Query/dailyAdStats/useDailyAdStatsQuery";
import { Panel, PanelLoading } from "./panel";
import { compactNumber, percentChange, priorRange, rate, type DateRange } from "./dashboard_utils";

function Change({ value }: { value: number | null }) {
    if (value === null) return null;
    return (
        <span className={`text-xs font-normal tabular-nums ${value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {value >= 0 ? "+" : ""}{value}%
        </span>
    );
}

function SubMetric({ label, value, change, rateLabel }: { label: string; value: string; change?: number | null; rateLabel?: string }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 flex items-baseline gap-2 text-base font-medium tabular-nums">
                {value}
                {change !== undefined && <Change value={change} />}
            </dd>
            {rateLabel && <dd className="text-xs text-muted-foreground tabular-nums">{rateLabel}</dd>}
        </div>
    );
}

export function HeadlinePanel({ range, rangeLabel }: { range: DateRange; rangeLabel: string }) {
    const prior = priorRange(range);
    const { overviewData, isLoading } = useAdminOverviewQuery(range.from, range.to);
    const { overviewData: priorData } = useAdminOverviewQuery(prior.from, prior.to);

    const impressions = overviewData?.totalImpressions ?? 0;
    const clicks = overviewData?.totalClicks ?? 0;
    const watches = overviewData?.totalWatches ?? 0;
    const engagements = overviewData?.totalEngagements ?? 0;
    const clicksChange = percentChange(clicks, priorData?.totalClicks ?? 0);

    return (
        <Panel className="flex flex-col justify-between">
            <div>
                <div className="text-xs text-muted-foreground">Clicks, {rangeLabel}</div>
                {isLoading ? (
                    <PanelLoading rows={1} />
                ) : (
                    <>
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-4xl font-medium tracking-tight tabular-nums">{compactNumber(clicks)}</span>
                            {clicksChange !== null && (
                                <span className="text-xs text-muted-foreground"><Change value={clicksChange} /> vs previous period</span>
                            )}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                            <span className="text-foreground">{rate(clicks, impressions)}</span> CTR
                        </div>
                    </>
                )}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
                <SubMetric label="Impressions" value={compactNumber(impressions)} change={percentChange(impressions, priorData?.totalImpressions ?? 0)} />
                <SubMetric label="Watches" value={compactNumber(watches)} rateLabel={`${rate(watches, impressions)} view rate`} />
                <SubMetric label="Engagements" value={compactNumber(engagements)} rateLabel={`${rate(engagements, impressions)} eng. rate`} />
                <SubMetric label="Live ads" value={String(overviewData?.activeAds ?? 0)} />
            </dl>
        </Panel>
    );
}
