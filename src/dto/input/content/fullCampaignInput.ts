export interface FullCampaignInput {
    advertiserId?: string;
    name: string;
    budgetPlan: string;
    dailyBudget: number;
    totalBudget: number;
    startDate: string;
    endDate: string;
    paymentMethod: string;
    creativeName: string;
    assetType: string;
    destinationLink: string;
    asset: File;
    ageMin: number;
    ageMax: number;
    gender: string;
    adType: string;
    placementKey: string;
}
