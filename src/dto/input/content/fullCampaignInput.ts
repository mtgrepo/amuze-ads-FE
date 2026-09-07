export interface FullCampaignInput {
    advertiserId?: string;
    name: string;
    objective: string;
    dailyBudget: number;
    totalBudget: number;
    startDate: string;
    paymentMethod: string;
    creativeName: string;
    assetType: string;
    destinationLink: string;
    asset: File;
    ageMin: number;
    ageMax: number;
    gender: string;
    location: string;
    category: string;
    adType: string;
    placementKey: string;
}
