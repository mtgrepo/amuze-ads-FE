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
    adId: string;
    campaignId: string;
    campaignName: string;
    endDate: string;
    advertiserName: string;
    agencyName: string | null;
    totalImpressions: number;
    totalClicks: number;
    totalEngagements: number;
    totalWatches: number;
}

export interface PlacementBreakdownItem {
    placementKey: string;
    impressions: number;
    clicks: number;
    watches: number;
    engagements: number;
}
