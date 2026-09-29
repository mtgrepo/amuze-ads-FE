import type { EventContentArg } from "@fullcalendar/core";
import { STATUS_LABELS, type CalendarEventMeta } from "./calendar_events";

// Pill body: status dot, campaign name, then client and dates in a lighter tone.
export function renderCalendarPill(arg: EventContentArg) {
    const meta = arg.event.extendedProps as CalendarEventMeta;
    const secondary = [meta.client, meta.status === "draft" || meta.status === "pending" ? STATUS_LABELS[meta.status] : meta.dateRange]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="cal-pill-content" title={`${arg.event.title} · ${STATUS_LABELS[meta.status] ?? meta.status} · ${meta.dateRange}`}>
            <span className="cal-pill-dot" />
            <span className="cal-pill-title">{arg.event.title}</span>
            {secondary && <span className="cal-pill-meta">{secondary}</span>}
        </div>
    );
}
