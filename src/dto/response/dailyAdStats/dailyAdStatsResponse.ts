export interface AdminOverviewResponse {
    totalImpressions: number;
    totalClicks: number;
    totalEngagements: number;
    activeAds: number;
}

export interface AdminTrendItem {
    date: string;
    impressions: number;
    clicks: number;
    engagements: number;
}

export interface PricingDistributionItem {
    pricingMode: string;
    count: number;
}

export interface TopAdItem {
    campaignName: string;
    totalImpressions: number;
    totalClicks: number;
    totalEngagements: number;
}
