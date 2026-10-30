import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useObjectivePricesQuery } from "../../../Composable/Query/campaignObjective/useObjectivePricesQuery";
import { OBJECTIVE_LABELS, type ObjectiveInput, type ObjectiveType } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";
import { objectiveFitsAsset, objectivesTotal, priceText } from "./objective_terms";
import { wholeNumber } from "./package_terms";

interface ObjectivesPickerProps {
    value: ObjectiveInput[];
    onChange: (value: ObjectiveInput[]) => void;
    assetType?: string;
    /** The package price, for the total. */
    planCost: number;
    /** What the objectives already cost when unchanged (saved prices); otherwise priced at today's prices. */
    objectivesCost?: number;
    disabled?: boolean;
}

/**
 * Optional results to buy on top of the package: how many impressions, clicks or watches.
 * A blank field isn't bought; the server prices them again at save.
 * Renders form fields straight into the parent's two-column grid.
 */
export function ObjectivesPicker({ value, onChange, assetType, planCost, objectivesCost, disabled }: ObjectivesPickerProps) {
    const { prices } = useObjectivePricesQuery();

    const setCount = (type: ObjectiveType, count: number) => {
        const rest = value.filter((o) => o.objectiveType !== type);
        onChange(count >= 1 ? [...rest, { objectiveType: type, targetCount: count }] : rest);
    };

    const objectives = objectivesCost ?? objectivesTotal(value, prices, assetType);

    return (
        <>
            {prices.map((price) => {
                const type = price.objectiveType;
                const fits = objectiveFitsAsset(type, assetType);
                const count = fits ? value.find((o) => o.objectiveType === type)?.targetCount : undefined;
                return (
                    <div key={type} className="grid gap-2">
                        <Label htmlFor={`objective-${type}`}>{OBJECTIVE_LABELS[type]}</Label>
                        <Input
                            id={`objective-${type}`}
                            type="number"
                            min={0}
                            placeholder="0"
                            disabled={disabled || !fits}
                            value={count || ""}
                            onChange={(e) => setCount(type, wholeNumber(e.target.value))}
                        />
                        <p className="text-muted-foreground text-sm">{fits ? priceText(price) : "Needs a video ad"}</p>
                    </div>
                );
            })}
            {prices.length % 2 === 1 && <div className="max-md:hidden" />}

            <div className="grid gap-2">
                <Label htmlFor="objectives-cost">Objectives Cost</Label>
                <Input id="objectives-cost" disabled value={`${objectives.toLocaleString()} pts`} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="total-budget">Total Budget</Label>
                <Input id="total-budget" disabled value={`${(planCost + objectives).toLocaleString()} pts`} />
                <p className="text-muted-foreground text-sm">Package cost + objectives cost.</p>
            </div>
        </>
    );
}
