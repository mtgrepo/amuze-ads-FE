import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useNotificationsQuery } from "../../../Composable/Query/notifications/useNotificationsQuery";
import type { NotificationsResponse } from "../../../dto/response/notifications/notificationsResponse";
import { Panel, PanelHeader, PanelLoading } from "./panel";

/** The latest messages sent to advertisers: payments, approvals, extensions. */
export function ActivityPanel() {
    const { notificationsData, isLoading } = useNotificationsQuery();
    const latest = [...((notificationsData ?? []) as NotificationsResponse[])]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5);

    return (
        <Panel>
            <PanelHeader title="Recent activity" meta={<Link to="/notifications" className="text-primary hover:underline">All →</Link>} />
            {isLoading ? (
                <PanelLoading rows={4} />
            ) : latest.length === 0 ? (
                <div className="flex min-h-28 items-center justify-center text-sm text-muted-foreground">Nothing yet</div>
            ) : (
                <ul className="mt-3">
                    {latest.map((n) => (
                        <li key={n.id} className="flex gap-3 border-t py-2.5 first:border-t-0">
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                            <div className="min-w-0">
                                <div className="truncate text-sm">{n.title}</div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {n.advertiser?.name ? `${n.advertiser.name} · ` : ""}{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}
