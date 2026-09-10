import type { CampaignResponse } from "./campaignResponse";

export interface AdSetResponse {
    id: string;
    campaignId: string;
    ageMin: number;
    ageMax: number;
    gender: string;
    created_at: string;
    updated_at: string;
    campaign: CampaignResponse
}