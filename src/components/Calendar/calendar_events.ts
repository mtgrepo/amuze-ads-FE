import { addDays } from "date-fns";
import type { EventInput } from "@fullcalendar/core";
import type { AdResponse } from "../../dto/response/content/adResponse";

// Same colours as the status icons on the list pages.
export const STATUS_COLORS: Record<string, string> = {
    draft: "#9ca3af",
    pending: "#eab308",
    active: "#16a34a",
    paused: "#f97316",
    rejected: "#dc2626",
    expired: "#6b7280",
    completed: "#6b7280",
};

export const CALENDAR_STATUSES = ["draft", "pending", "active", "paused", "rejected", "expired"];
export const DEFAULT_CALENDAR_STATUSES = CALENDAR_STATUSES.filter((s) => s !== "rejected" && s !== "expired");

// Stored dates are "YYYY-MM-DD"; new Date("YYYY-MM-DD") would be UTC midnight and can land on the previous day locally.
export const parseLocalDate = (value: string | Date) => {
    if (value instanceof Date) return value;
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
};

/** One all-day bar per ad, from the campaign's start date through its end date. */
export const toCalendarEvents = (ads: AdResponse[], statuses: string[], showClient: boolean): EventInput[] =>
    ads
        .filter((ad) => ad.adSet?.campaign?.startDate && ad.adSet.campaign.endDate && statuses.includes(ad.status))
        .map((ad) => {
            const campaign = ad.adSet.campaign;
            const client = showClient ? campaign.advertiser?.name : undefined;
            const color = STATUS_COLORS[ad.status] ?? STATUS_COLORS.draft;
            return {
                id: ad.id,
                title: client ? `${campaign.name} · ${client}` : campaign.name,
                start: parseLocalDate(campaign.startDate),
                end: addDays(parseLocalDate(campaign.endDate), 1), // FullCalendar end dates are exclusive
                allDay: true,
                backgroundColor: color,
                borderColor: color,
                extendedProps: { status: ad.status },
            };
        });
