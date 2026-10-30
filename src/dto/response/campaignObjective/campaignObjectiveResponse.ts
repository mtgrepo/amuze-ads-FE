export type ObjectiveType = "impression" | "click" | "watch";

/** Today's price for one objective type, set by the business team. */
export interface ObjectivePrice {
    objectiveType: ObjectiveType;
    /** Points for every `pricePer` items. */
    price: number;
    pricePer: number;
    label: string;
}

/** What the customer picks: a type and how many. */
export interface ObjectiveInput {
    objectiveType: ObjectiveType;
    targetCount: number;
}

/** One objective type on a campaign. Always all three types; unpicked ones have `selected: false`. */
export interface ObjectiveProgress {
    objectiveType: ObjectiveType;
    selected: boolean;
    targetCount: number;
    delivered: number;
    price: number | null;
    pricePer: number | null;
    cost: number;
}

export const OBJECTIVE_LABELS: Record<ObjectiveType, string> = {
    impression: "Impressions",
    click: "Clicks",
    watch: "Watches",
};
