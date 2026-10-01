import { usePointsSummaryQuery } from "../../../Composable/Query/dashboard/useDashboardQuery";
import { Panel, PanelHeader, PanelLoading } from "./panel";
import type { DateRange } from "./dashboard_utils";

function Row({ swatch, label, value, muted }: { swatch?: string; label: string; value: number; muted?: boolean }) {
    return (
        <div className={`flex items-center justify-between text-sm ${muted ? "text-muted-foreground" : ""}`}>
            <span className="flex items-center gap-2">
                <span className={`size-2 rounded-sm ${swatch ?? "invisible"}`} />
                {label}
            </span>
            <span className="tabular-nums">{value.toLocaleString()}</span>
        </div>
    );
}

export function PointsPanel({ range, rangeLabel }: { range: DateRange; rangeLabel: string }) {
    const { pointsSummary, isLoading } = usePointsSummaryQuery(range.from, range.to);
    const issued = (pointsSummary?.purchased ?? 0) + (pointsSummary?.bonus ?? 0);
    const purchasedPct = issued ? (pointsSummary!.purchased / issued) * 100 : 0;
    const bonusPct = issued ? (pointsSummary!.bonus / issued) * 100 : 0;

    return (
        <Panel>
            <PanelHeader title={`Points, ${rangeLabel}`} meta="1 point = 1 MMK" />
            {isLoading || !pointsSummary ? (
                <PanelLoading rows={4} />
            ) : (
                <>
                    <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
                        <div className="bg-primary" style={{ width: `${purchasedPct}%` }} />
                        <div className="bg-primary/35" style={{ width: `${bonusPct}%` }} />
                    </div>
                    <div className="mt-4 space-y-2">
                        <Row swatch="bg-primary" label="Purchased" value={pointsSummary.purchased} />
                        <Row swatch="bg-primary/35" label="Bonus given" value={pointsSummary.bonus} />
                        <div className="my-2 border-t" />
                        <Row label="Spent on ads" value={pointsSummary.spent} muted />
                        <Row label="Refunded" value={pointsSummary.refunded} muted />
                    </div>
                </>
            )}
        </Panel>
    );
}
