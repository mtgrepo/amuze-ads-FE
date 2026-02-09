export interface AdSetResponse {
    id: string;
    campaignId: string;
    ageMin: number;
    ageMax: number;
    gender: string;
    location: string;
    category: string;
    created_at: string;
    updated_at: string;
    campaign: {
        name: string    }
}