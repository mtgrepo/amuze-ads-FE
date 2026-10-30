export interface FullCampaignInput {
    advertiserId?: string;
    name: string;
    packageId: string;
    packageQuantity: number;
    startDate: string;
    /** JSON list of { objectiveType, targetCount }. */
    objectives?: string;
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
