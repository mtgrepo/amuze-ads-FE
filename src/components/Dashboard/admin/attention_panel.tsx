import { Link } from "react-router-dom";
import { ArrowRight, CircleCheck } from "lucide-react";
import { useAttentionQuery } from "../../../Composable/Query/dashboard/useDashboardQuery";
import { Panel, PanelHeader, PanelLoading } from "./panel";
import { compactNumber, daysUntil, endsInLabel, placementLabel, waitingLabel } from "./dashboard_utils";

function AttentionRow({ tone, title, detail, to, action }: {
    tone: "warning" | "danger" | "neutral";
    title: string;
    detail: string;
    to: string;
    action: string;
}) {
    const dot = { warning: "bg-amber-500", danger: "bg-red-500", neutral: "bg-muted-foreground/40" }[tone];
    return (
        <Link to={to} className="group flex items-center gap-3 border-t py-3 text-sm first:border-t-0">
            <span className={`size-1.5 shrink-0 rounded-full ${dot}`} />
            <div className="min-w-0 flex-1">
                <div className="truncate">{title}</div>
                <div className="truncate text-xs text-muted-foreground">{detail}</div>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs text-primary opacity-80 group-hover:opacity-100">
                {action} <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
        </Link>
    );
}

export function AttentionPanel() {
    const { attention, isLoading } = useAttentionQuery();
    const total = (attention?.pendingCount ?? 0) + (attention?.endingSoon.length ?? 0);

    return (
        <Panel>
            <PanelHeader title="Needs you" meta={attention && total > 0 ? `${total} ${total === 1 ? "item" : "items"}` : undefined} />
            {isLoading ? (
                <PanelLoading />
            ) : !attention || total === 0 ? (
                <div className="flex h-[calc(100%-1.5rem)] min-h-28 flex-col items-center justify-center gap-2 text-center">
                    <CircleCheck className="size-5 text-muted-foreground" />
                    <div className="text-sm">You're all caught up</div>
                    <div className="text-xs text-muted-foreground">
                        Campaigns waiting for approval and ones ending soon will show up here.
                    </div>
                </div>
            ) : (
                <div className="mt-2">
                    {attention.pendingCount > 0 && (
                        <AttentionRow
                            tone="warning"
                            title={`${attention.pendingCount} ${attention.pendingCount === 1 ? "campaign" : "campaigns"} waiting for approval`}
                            detail={`Oldest: ${attention.pending[0].campaignName} · ${attention.pending[0].advertiserName}, ${waitingLabel(attention.pending[0].waitingSince)}`}
                            to={attention.pendingCount === 1 ? `/ads/${attention.pending[0].adId}` : "/ads?status=pending"}
                            action="Review"
                        />
                    )}
                    {attention.endingSoon.map((item) => (
                        <AttentionRow
                            key={item.campaignId}
                            tone={daysUntil(item.endDate) <= 1 ? "danger" : "neutral"}
                            title={`${item.campaignName} ends ${endsInLabel(item.endDate).toLowerCase().replace(/^(\d)/, "in $1")}`}
                            detail={`${item.advertiserName} · ${placementLabel(item.placementKey)} · ${compactNumber(item.totalClicks)} clicks · ${compactNumber(item.totalWatches)} watches`}
                            to={`/ads/${item.adId}`}
                            action="Open"
                        />
                    ))}
                </div>
            )}
        </Panel>
    );
}
