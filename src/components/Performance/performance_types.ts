import type { DayTotals } from "../Dashboard/admin/metric_chart";
import { toLocalDateString, type DateRange } from "../Dashboard/admin/dashboard_utils";

export type { DayTotals };

export type Metric = "impressions" | "clicks" | "watches" | "engagements";

export const METRIC_LABELS: Record<Metric, string> = {
    impressions: "Impressions",
    clicks: "Clicks",
    watches: "Watches",
    engagements: "Engagements",
};

/** Totals for a period, as returned by the overview endpoint. */
export interface PeriodTotals {
    totalImpressions: number;
    totalClicks: number;
    totalWatches: number;
    totalEngagements: number;
    activeAds: number;
}

export const TOTAL_KEY: Record<Metric, keyof PeriodTotals> = {
    impressions: "totalImpressions",
    clicks: "totalClicks",
    watches: "totalWatches",
    engagements: "totalEngagements",
};

/** Fills every day of the range, including days without stats. */
export function toDayTotals(days: string[], trend: { date: string; impressions: number; clicks: number; watches: number; engagements: number }[]): DayTotals[] {
    const byDate = new Map(trend.map((d) => [d.date.slice(0, 10), d]));
    return days.map((date) => ({
        date,
        impressions: byDate.get(date)?.impressions ?? 0,
        clicks: byDate.get(date)?.clicks ?? 0,
        watches: byDate.get(date)?.watches ?? 0,
        engagements: byDate.get(date)?.engagements ?? 0,
    }));
}

/** The last `days` days, ending today. */
export function rangeForDays(days: number): DateRange {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    return { from: toLocalDateString(from), to: toLocalDateString(to) };
}
