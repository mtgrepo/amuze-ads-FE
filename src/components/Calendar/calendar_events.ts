import type { AdResponse } from "../../dto/response/content/adResponse";
import { tileColor } from "../Content/Ads/column";

// Paid and approved, so it is (or was) actually served. Drafts aren't paid and pending ads aren't approved yet.
const LIVE = ["active", "paused", "expired"];
// Rejected ads never run, so they don't belong on the calendar.
const HIDDEN = ["rejected"];

// Stored dates are "YYYY-MM-DD"; new Date("YYYY-MM-DD") would be UTC midnight and can land on the previous day locally.
export const parseLocalDate = (value: string | Date) => {
    if (value instanceof Date) return value;
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
};

export interface CalendarCampaign {
    id: string;
    name: string;
    start: Date;
    end: Date;
    /** False for drafts (not paid) and pending ads (not approved): shown faded. */
    live: boolean;
    color: string;
}

/** One entry per ad, from its campaign's start date through its end date (both inclusive). */
export const toCampaigns = (ads: AdResponse[]): CalendarCampaign[] =>
    ads
        .filter((ad) => ad.adSet?.campaign?.startDate && ad.adSet.campaign.endDate && !HIDDEN.includes(ad.status))
        .map((ad) => ({
            id: ad.id,
            name: ad.adSet.campaign.name,
            start: parseLocalDate(ad.adSet.campaign.startDate),
            end: parseLocalDate(ad.adSet.campaign.endDate),
            live: LIVE.includes(ad.status),
            color: tileColor(ad.id),
        }))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

export const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const runsOn = (c: CalendarCampaign, day: Date) => c.start <= day && day <= c.end;

/** The first two words, for the small start/end chips. */
export const shortName = (name: string) => name.split(/\s+/).slice(0, 2).join(" ");
