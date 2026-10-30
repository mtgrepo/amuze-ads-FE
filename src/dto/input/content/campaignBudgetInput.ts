/** A draft's package, quantity and start date; the server works out the end date and price. */
export interface CampaignBudgetInput {
    packageId: string;
    packageQuantity: number;
    startDate: string;
}
