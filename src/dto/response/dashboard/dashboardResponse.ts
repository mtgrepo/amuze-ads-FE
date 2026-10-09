export interface AttentionItem {
    campaignId: string;
    campaignName: string;
    advertiserName: string;
    agencyName: string | null;
    adId: string;
    placementKey: string;
    totalClicks: number;
    totalWatches: number;
}

export interface AttentionResponse {
    pendingCount: number;
    pending: (AttentionItem & { waitingSince: string })[];
    endingSoon: (AttentionItem & { endDate: string })[];
    endingSoonDays: number;
    /** Paid campaign extensions waiting for approval, oldest first. */
    pendingExtensionCount: number;
    pendingExtensions: (AttentionItem & { extensionId: string; amount: number; days: number; newEndDate: string; waitingSince: string })[];
}

export interface PointsSummaryResponse {
    fromDate: string;
    toDate: string;
    purchased: number;
    bonus: number;
    spent: number;
    refunded: number;
}

/** All-time figure plus the selected range's share. 1 point = 1 MMK. */
export interface RevenueFigure {
    allTime: number;
    inRange: number;
}

export interface DashboardSummaryResponse {
    /** Current counts, not limited to the date range. */
    campaigns: { total: number; drafts: number; pending: number; active: number };
    revenue: {
        /** Points spent on ads minus refunds. */
        earned: RevenueFigure;
        /** Points bought online plus top-ups paid to an admin. */
        received: RevenueFigure;
    };
}
