import { addDays, format } from "date-fns";
import type { EventInput } from "@fullcalendar/core";
import type { AdResponse } from "../../dto/response/content/adResponse";

export const CALENDAR_STATUSES = ["draft", "pending", "active", "paused", "rejected", "expired"];
export const DEFAULT_CALENDAR_STATUSES = CALENDAR_STATUSES.filter((s) => s !== "rejected" && s !== "expired");

export const STATUS_LABELS: Record<string, string> = {
    draft: "Draft",
    pending: "Pending review",
    active: "Active",
    paused: "Paused",
    rejected: "Rejected",
    expired: "Expired",
};

// Colours live in calendar.css as .cal-status-<status> (light and dark variants).
export const statusClass = (status: string) =>
    `cal-status-${CALENDAR_STATUSES.includes(status) ? status : "draft"}`;

// Stored dates are "YYYY-MM-DD"; new Date("YYYY-MM-DD") would be UTC midnight and can land on the previous day locally.
export const parseLocalDate = (value: string | Date) => {
    if (value instanceof Date) return value;
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
};

export interface CalendarEventMeta {
    status: string;
    client?: string;
    dateRange: string;
}

const formatRange = (start: Date, end: Date) =>
    start.getMonth() === end.getMonth()
        ? `${format(start, "MMM d")}–${format(end, "d")}`
        : `${format(start, "MMM d")} – ${format(end, "MMM d")}`;

/** One all-day pill per ad, from the campaign's start date through its end date. */
export const toCalendarEvents = (ads: AdResponse[], statuses: string[], showClient: boolean): EventInput[] =>
    ads
        .filter((ad) => ad.adSet?.campaign?.startDate && ad.adSet.campaign.endDate && statuses.includes(ad.status))
        .map((ad) => {
            const campaign = ad.adSet.campaign;
            const start = parseLocalDate(campaign.startDate);
            const end = parseLocalDate(campaign.endDate);
            const meta: CalendarEventMeta = {
                status: ad.status,
                client: showClient ? campaign.advertiser?.name : undefined,
                dateRange: formatRange(start, end),
            };
            return {
                id: ad.id,
                title: campaign.name,
                start,
                end: addDays(end, 1), // FullCalendar end dates are exclusive
                allDay: true,
                // Colours come from the .cal-status-* classes; don't set backgroundColor/borderColor here,
                // FullCalendar would write them as inline styles that override the stylesheet.
                classNames: ["cal-pill", statusClass(ad.status)],
                extendedProps: meta,
            };
        });
