export interface CampaignResponse {
    id: string,
    name: string,
    objective: string,
    dailyBudget: number,
    totalBudget: number,
    spentAmount: number,
    startDate: Date,
    endDate: Date,
    status: string,
    created_at: string,
    updated_at: string,
    advertiser: {
        name: string
    },
    createdAt: Date,
    advertiserId: string,
    postId: string,
    post: {
        title: string,
        status: string,
        photo: string
    }
}