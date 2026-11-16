import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "../../dto/response/activity/activityResponse";
import { activityBy, activityChanges, activityDot, activityNotes, activityReason, activityWhen } from "../../lib/activity";

/** What changed and why, under a row's title. Shared by the history lists and the Activity log table. */
export function ActivityDetail({ log }: { log: ActivityLog }) {
    const lines = [...activityChanges(log), ...activityNotes(log)];
    const reason = activityReason(log);
    if (!lines.length && !reason) return null;
    return (
        <div className="mt-1 flex flex-col gap-0.5 text-xs text-foreground/80">
            {lines.map((line, i) => <span key={i} className="break-words">{line}</span>)}
            {reason && <span className="break-words"><span className="text-muted-foreground">Reason:</span> {reason}</span>}
        </div>
    );
}

/** A timeline of activity rows: dot, title, who, when, changes and reason. `adHref` turns a row's title into a link. */
export function ActivityList({ items, adHref, className }: {
    items: ActivityLog[];
    adHref?: (log: ActivityLog) => string | undefined;
    className?: string;
}) {
    return (
        <ol className={cn("flex flex-col gap-3", className)}>
            {items.map((log) => {
                const href = adHref?.(log);
                return (
                    <li key={log.id} className="flex gap-2.5 text-[13px]">
                        <span className={cn("mt-1.5 size-[7px] shrink-0 rounded-full", activityDot(log))} aria-hidden="true" />
                        <div className="min-w-0 flex-1 leading-snug">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-2.5">
                                {href
                                    ? <Link to={href} className="font-medium text-primary hover:underline">{log.summary}</Link>
                                    : <span className="font-medium">{log.summary}</span>}
                                <span className="whitespace-nowrap text-xs text-muted-foreground">{activityWhen(log.createdAt)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{activityBy(log)}</span>
                            <ActivityDetail log={log} />
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

/** Loading rows for a history list. */
export function ActivityListLoading({ rows = 3 }: { rows?: number }) {
    return (
        <div role="status" aria-label="Loading history" className="flex flex-col gap-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-2.5">
                    <div className="mt-1.5 size-[7px] shrink-0 rounded-full bg-muted" />
                    <div className="h-3 flex-1 animate-pulse rounded bg-muted" style={{ maxWidth: `${80 - i * 12}%` }} />
                </div>
            ))}
        </div>
    );
}
