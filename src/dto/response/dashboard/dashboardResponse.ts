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
}

export interface PointsSummaryResponse {
    fromDate: string;
    toDate: string;
    purchased: number;
    bonus: number;
    spent: number;
    refunded: number;
}
