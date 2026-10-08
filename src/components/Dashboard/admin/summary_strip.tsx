import { Link } from "react-router-dom";
import { useDashboardSummaryQuery } from "../../../Composable/Query/dashboard/useDashboardQuery";
import type { RevenueFigure } from "../../../dto/response/dashboard/dashboardResponse";
import type { DateRange } from "./dashboard_utils";

function CountCell({ label, value, note, to, isLoading }: {
    label: string;
    value: number;
    note: string;
    to: string;
    isLoading: boolean;
}) {
    return (
        <Link to={to} className="group border-b px-4 py-3.5 transition-colors hover:bg-muted/50 sm:border-r lg:border-b-0">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-0.5 text-2xl font-medium tracking-tight tabular-nums">
                {isLoading ? <span className="text-muted-foreground">…</span> : value.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground group-hover:text-foreground">{note}</div>
        </Link>
    );
}

function RevenueFigureBlock({ label, figure, unit, rangeLabel, hint }: {
    label: string;
    figure?: RevenueFigure;
    /** "pts" for points, "MMK" for money, so the two figures can't be mistaken for each other. */
    unit: "pts" | "MMK";
    rangeLabel: string;
    hint: string;
}) {
    return (
        <div title={hint}>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-0.5 text-2xl font-medium tracking-tight tabular-nums">
                {figure ? figure.allTime.toLocaleString() : <span className="text-muted-foreground">…</span>}
                <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">
                {figure ? `${figure.inRange.toLocaleString()} ${unit}` : "—"} {rangeLabel}
            </div>
        </div>
    );
}

/**
 * Campaign counts as they stand right now, and revenue all-time with the selected range underneath.
 * Revenue shows points spent on ads (pts) and the real money paid for points (MMK); bought points may not be spent yet.
 */
export function SummaryStrip({ range, rangeLabel }: { range: DateRange; rangeLabel: string }) {
    const { summary, isLoading } = useDashboardSummaryQuery(range.from, range.to);
    const campaigns = summary?.campaigns;

    return (
        <section className="grid grid-cols-1 overflow-hidden rounded-xl border bg-card sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_2fr]">
            <CountCell
                label="Total campaigns"
                value={campaigns?.total ?? 0}
                note={campaigns?.drafts ? `incl. ${campaigns.drafts} unpaid ${campaigns.drafts === 1 ? "draft" : "drafts"}` : "All time"}
                to="/campaigns"
                isLoading={isLoading}
            />
            <CountCell
                label="Pending campaigns"
                value={campaigns?.pending ?? 0}
                note="Under review"
                to="/ads?status=pending"
                isLoading={isLoading}
            />
            <CountCell
                label="Active campaigns"
                value={campaigns?.active ?? 0}
                note="Running now"
                to="/ads?status=active"
                isLoading={isLoading}
            />
            <div className="grid grid-cols-2 gap-4 px-4 py-3.5 sm:col-span-3 lg:col-span-1">
                <RevenueFigureBlock
                    label="Points spent on ads"
                    figure={summary?.revenue.earned}
                    unit="pts"
                    rangeLabel={rangeLabel}
                    hint="Points customers spent on ads, minus points refunded for rejected ads."
                />
                <RevenueFigureBlock
                    label="Point sales"
                    figure={summary?.revenue.received}
                    unit="MMK"
                    rangeLabel={rangeLabel}
                    hint="Real money customers paid for points: KBZPay purchases plus top-ups paid to an admin. Bought points may not be spent yet."
                />
            </div>
        </section>
    );
}
