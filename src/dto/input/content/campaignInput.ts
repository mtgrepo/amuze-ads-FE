export interface CampaignInput {
    advertiserId: string,
    postId: string,
    name: string,
    objective: string,
    dailyBudget: number,
    totalBudget: number,
    spentAmount: number,
    startDate: Date,
    endDate: Date,
    status: string
}