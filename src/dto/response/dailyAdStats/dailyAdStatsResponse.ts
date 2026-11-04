// Engagements are clicks + watches. Reach counts distinct people; over a period it is not the sum of daily reach.
// Completions are video plays that reached the end (VCR = completions / watches).

export interface AdminOverviewResponse {
    totalImpressions: number;
    totalReach: number;
    totalClicks: number;
    totalEngagements: number;
    totalWatches: number;
    totalCompletions: number;
    activeAds: number;
}

export interface AdminTrendItem {
    date: string;
    impressions: number;
    reach: number;
    clicks: number;
    engagements: number;
    watches: number;
    completions: number;
}

export interface TopAdItem {
    adId: string;
    campaignId: string;
    campaignName: string;
    endDate: string;
    advertiserName: string;
    agencyName: string | null;
    placementKey: string;
    /** Campaign status, e.g. active, paused, expired. */
    status: string;
    totalImpressions: number;
    totalReach: number;
    totalClicks: number;
    totalEngagements: number;
    totalWatches: number;
    totalCompletions: number;
}

export interface PlacementBreakdownItem {
    placementKey: string;
    impressions: number;
    reach: number;
    clicks: number;
    watches: number;
    completions: number;
    engagements: number;
}
