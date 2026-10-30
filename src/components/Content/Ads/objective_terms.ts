// Objective pricing shared by the objectives picker, the create form and the draft budget form.
import type { ObjectiveInput, ObjectivePrice, ObjectiveType } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";

/** Watches only make sense for a video; impressions and clicks fit every ad. */
export const objectiveFitsAsset = (type: ObjectiveType, assetType?: string) => type !== "watch" || assetType === "video";

/** Points for a target at a price: whole blocks of `pricePer`, rounded up. */
export const objectiveCost = (targetCount: number, price: ObjectivePrice) =>
    targetCount >= 1 ? Math.ceil(targetCount / price.pricePer) * price.price : 0;

/** The picked objectives that will actually be bought: priced, fitting the asset, with a target of at least 1. */
export function billableObjectives(picked: ObjectiveInput[], prices: ObjectivePrice[], assetType?: string): ObjectiveInput[] {
    return picked.filter((o) =>
        o.targetCount >= 1 && objectiveFitsAsset(o.objectiveType, assetType) && prices.some((p) => p.objectiveType === o.objectiveType));
}

export function objectivesTotal(picked: ObjectiveInput[], prices: ObjectivePrice[], assetType?: string): number {
    return billableObjectives(picked, prices, assetType).reduce((sum, o) => {
        const price = prices.find((p) => p.objectiveType === o.objectiveType)!;
        return sum + objectiveCost(o.targetCount, price);
    }, 0);
}

/** "2 pts per click", "500 pts per 1,000 impressions" */
export function priceText(price: ObjectivePrice): string {
    const unit = price.pricePer === 1 ? price.label : `${price.pricePer.toLocaleString()} ${price.label}s`;
    return `${price.price.toLocaleString()} pts per ${unit}`;
}

/** Same picks, ignoring order. */
export function sameObjectives(a: ObjectiveInput[], b: ObjectiveInput[]): boolean {
    const key = (list: ObjectiveInput[]) => list.map((o) => `${o.objectiveType}:${o.targetCount}`).sort().join("|");
    return key(a) === key(b);
}
