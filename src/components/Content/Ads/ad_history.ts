import { format } from "date-fns";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import type { CampaignExtensionResponse } from "../../../dto/response/campaignExtension/campaignExtensionResponse";
import { parseLocalDate } from "../../Dashboard/admin/dashboard_utils";

export interface HistoryItem {
    text: string;
    when: string;
    /** Dot colour: green for good news, amber for waiting, indigo for going live, grey otherwise. */
    tone: "success" | "warning" | "primary" | "muted";
}

export const HISTORY_DOT: Record<HistoryItem["tone"], string> = {
    success: "bg-success",
    warning: "bg-warning",
    primary: "bg-primary",
    muted: "bg-muted-foreground/50",
};

/** What happened to an ad, newest day first, built from its dates and extensions. */
export function adHistory(ad: AdResponse, extensions: CampaignExtensionResponse[]): HistoryItem[] {
    const c = ad.adSet.campaign;
    const items: HistoryItem[] = [
        ...extensions.map((e): HistoryItem => {
            const added = `+${e.quantity} ${c.packageName} to ${format(parseLocalDate(String(e.newEndDate).slice(0, 10)), "d MMM")}`;
            if (e.status === "approved") return { text: `Extension approved: ${added}`, when: e.reviewedAt ?? e.createdAt, tone: "success" };
            if (e.status === "rejected") return { text: `Extension rejected: ${added}`, when: e.reviewedAt ?? e.createdAt, tone: "muted" };
            return { text: `Extension requested: ${added}`, when: e.createdAt, tone: "warning" };
        }),
        ...(ad.status === "active" || ad.status === "expired" ? [{ text: "Approved and started serving", when: String(c.startDate), tone: "primary" as const }] : []),
        ...(ad.createdAt ? [{ text: "Created as a draft", when: ad.createdAt, tone: "muted" as const }] : []),
    ];
    // Newest day first; items on the same day keep the order above.
    return items.sort((a, b) => b.when.slice(0, 10).localeCompare(a.when.slice(0, 10)));
}

/** "3 Nov" for either a date ("2026-11-03") or a timestamp. */
export const historyDate = (when: string) => format(when.length === 10 ? parseLocalDate(when) : new Date(when), "d MMM");
