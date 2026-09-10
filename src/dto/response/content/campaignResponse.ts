import type { AdvertisersResponse } from "../advertisers/advertisersResponse"

export interface CampaignResponse {
    id: string,
    name: string,
    modelType: string,
    budgetPlan: string,
    dailyBudget: number,
    totalBudget: number,
    spentAmount: number,
    startDate: Date,
    endDate: Date,
    status: string,
    created_at: string,
    updated_at: string,
    advertiser: AdvertisersResponse,
    createdAt: Date,
    advertiserId: string,
}
