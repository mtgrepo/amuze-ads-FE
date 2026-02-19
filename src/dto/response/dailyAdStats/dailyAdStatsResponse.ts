export interface AdminOverviewResponse {
    totalImpressions: number;
    totalClicks: number;
    totalSpent: number;
    totalEngagements: number;
    totalBudget: number;
    activeAds: number;
}

export interface AdminTrendItem {
    date: string;
    impressions: number;
    clicks: number;
    spent: number;
    engagements: number;
    budget: number;
}

export interface PricingDistributionItem {
    pricingMode: string;
    count: number;
}

export interface TopAdItem {
    adId: string;
    totalImpressions: number;
    totalClicks: number;
    totalSpent: number;
    totalEngagements: number;
}
