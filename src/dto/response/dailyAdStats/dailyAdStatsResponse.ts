export interface AdminOverviewResponse {
    totalImpressions: number;
    totalClicks: number;
    totalEngagements: number;
    totalWatches: number;
    activeAds: number;
}

export interface AdminTrendItem {
    date: string;
    impressions: number;
    clicks: number;
    engagements: number;
    watches: number;
}

export interface TopAdItem {
    campaignName: string;
    totalImpressions: number;
    totalClicks: number;
    totalEngagements: number;
    totalWatches: number;
}
