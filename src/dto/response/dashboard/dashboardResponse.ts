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

/** One period's money. All amounts are MMK (1 point = 1 MMK). */
export interface IncomePeriod {
    /** Money customers paid for points: KBZPay purchases plus top-ups paid to an admin. */
    received: { total: number; kbzpay: number; offline: number };
    /** Points spent on ads minus refunds for ads that never ran (total = packages + objectives + extensions − refunded). */
    earned: { total: number; packages: number; objectives: number; extensions: number; refunded: number };
    /** Free points given. A cost, not income. */
    bonus: number;
}

export interface IncomeCustomer {
    advertiserId: string;
    name: string;
    type: "agency" | "advertiser";
    earned: number;
    received: number;
}

export interface IncomePackage {
    packageName: string;
    earned: number;
    ads: number;
}

export interface IncomeResponse {
    fromDate: string;
    toDate: string;
    current: IncomePeriod;
    /** The same-length period just before. */
    previous: IncomePeriod;
    /** Held in wallets right now, not limited to the range. */
    unspent: { points: number; wallets: number };
    /** Every day in the range, zeros included. */
    daily: { date: string; received: number; earned: number }[];
    /** Top 10 by earned. */
    topCustomers: IncomeCustomer[];
    byPackage: IncomePackage[];
}
