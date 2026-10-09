import { useAdminTrendQuery } from "../../../Composable/Query/dailyAdStats/useAdminTrendQuery";
import { Panel, PanelHeader, PanelLoading } from "./panel";
import { MetricChart } from "./metric_chart";
import { eachDay, type DateRange } from "./dashboard_utils";

export function DeliveryChart({ range }: { range: DateRange }) {
    const { trendData, isLoading } = useAdminTrendQuery(range.from, range.to);

    const byDate = new Map(trendData.map((d) => [d.date.slice(0, 10), d]));
    const points = eachDay(range).map((date) => ({
        date,
        impressions: byDate.get(date)?.impressions ?? 0,
        clicks: byDate.get(date)?.clicks ?? 0,
        watches: byDate.get(date)?.watches ?? 0,
        engagements: byDate.get(date)?.engagements ?? 0,
    }));

    return (
        <Panel>
            <PanelHeader title="Delivery" />
            <div className="mt-3">
                {isLoading ? <PanelLoading rows={4} /> : <MetricChart points={points} />}
            </div>
        </Panel>
    );
}
