import type { AdvertisersResponse } from "../advertisers/advertisersResponse"

export interface CampaignResponse {
    id: string,
    name: string,
    modelType: string,
    packageId: string,
    packageName: string,
    /** Days and points per unit, as bought. */
    packageDays: number,
    packagePrice: number,
    packageQuantity: number,
    /** packagePrice × packageQuantity */
    planCost: number,
    objectiveCost: number,
    /** planCost + objectiveCost: the amount paid. */
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
