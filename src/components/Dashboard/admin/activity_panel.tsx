import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNotificationsQuery } from "../../../Composable/Query/notifications/useNotificationsQuery";
import type { NotificationsResponse } from "../../../dto/response/notifications/notificationsResponse";

/** Colour a message by what it's about: approvals and targets green, extensions indigo, payments amber. */
function dotTone(title: string): string {
    const t = title.toLowerCase();
    if (/approv|live|reached|target/.test(t)) return "bg-success";
    if (/extend|extension/.test(t)) return "bg-primary";
    if (/pay|paid|point|top/.test(t)) return "bg-warning";
    if (/reject/.test(t)) return "bg-destructive";
    return "bg-muted-foreground/50";
}

/** The latest messages sent to advertisers. */
export function ActivityPanel() {
    const { notificationsData, isLoading } = useNotificationsQuery();
    const latest = [...((notificationsData ?? []) as NotificationsResponse[])]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5);

    return (
        <section aria-labelledby="activity" className="flex min-w-0 flex-col gap-1 rounded-xl border bg-card px-5 py-[18px]">
            <div className="mb-2 flex items-center justify-between gap-3">
                <h2 id="activity" className="text-[15px] font-semibold">Recent activity</h2>
                <Link to="/notifications" className="text-[13px] text-primary hover:underline">All notifications →</Link>
            </div>
            {isLoading ? (
                <div className="h-24 animate-pulse rounded-lg bg-muted" />
            ) : latest.length === 0 ? (
                <div className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">Nothing yet</div>
            ) : latest.map((n) => (
                <div key={n.id} className="flex gap-3 border-t py-2.5">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", dotTone(n.title))} aria-hidden="true" />
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="leading-snug">{n.message || n.title}</span>
                        <span className="text-xs text-muted-foreground">
                            {n.advertiser?.name ? `${n.advertiser.name} · ` : ""}{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            ))}
        </section>
    );
}
