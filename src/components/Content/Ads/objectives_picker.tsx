import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "../../../lib/utils";
import { useObjectivePricesQuery } from "../../../Composable/Query/campaignObjective/useObjectivePricesQuery";
import { OBJECTIVE_LABELS, type ObjectiveInput, type ObjectiveType } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";
import { objectiveCost, objectiveFitsAsset, objectivesTotal, priceText } from "./objective_terms";

interface ObjectivesPickerProps {
    value: ObjectiveInput[];
    onChange: (value: ObjectiveInput[]) => void;
    assetType?: string;
    /** The package price, for the running total. */
    planCost: number;
    disabled?: boolean;
}

/**
 * Optional results to buy on top of the package: how many impressions, clicks or watches.
 * Only the checked rows are bought; the server prices them again at save.
 */
export function ObjectivesPicker({ value, onChange, assetType, planCost, disabled }: ObjectivesPickerProps) {
    const { prices, isLoading } = useObjectivePricesQuery();
    if (isLoading) return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
    if (prices.length === 0) return null;

    const picked = (type: ObjectiveType) => value.find((o) => o.objectiveType === type);
    const toggle = (type: ObjectiveType, on: boolean) =>
        onChange(on ? [...value.filter((o) => o.objectiveType !== type), { objectiveType: type, targetCount: picked(type)?.targetCount || 0 }]
            : value.filter((o) => o.objectiveType !== type));
    const setCount = (type: ObjectiveType, count: number) =>
        onChange(value.map((o) => (o.objectiveType === type ? { ...o, targetCount: count } : o)));

    const objectives = objectivesTotal(value, prices, assetType);

    return (
        <div className="space-y-3">
            <div className="divide-y rounded-xl border">
                {prices.map((price) => {
                    const type = price.objectiveType;
                    const fits = objectiveFitsAsset(type, assetType);
                    const row = picked(type);
                    const checked = !!row && fits;
                    const cost = checked ? objectiveCost(row.targetCount, price) : 0;
                    return (
                        <div key={type} className={cn("flex flex-wrap items-center gap-3 p-3", !fits && "opacity-60")}>
                            <label className="flex min-w-48 flex-1 cursor-pointer items-center gap-3">
                                <Checkbox
                                    checked={checked}
                                    disabled={disabled || !fits}
                                    onCheckedChange={(on) => toggle(type, on === true)}
                                    aria-label={OBJECTIVE_LABELS[type]}
                                />
                                <span>
                                    <span className="block font-medium">{OBJECTIVE_LABELS[type]}</span>
                                    <span className="block text-xs text-muted-foreground">
                                        {fits ? priceText(price) : "Needs a video ad"}
                                    </span>
                                </span>
                            </label>
                            {checked && (
                                <>
                                    <Input
                                        inputMode="numeric"
                                        aria-label={`How many ${OBJECTIVE_LABELS[type].toLowerCase()}`}
                                        placeholder="How many"
                                        className="w-32 tabular-nums"
                                        disabled={disabled}
                                        value={row.targetCount || ""}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, "");
                                            setCount(type, digits === "" ? 0 : Number(digits));
                                        }}
                                    />
                                    <span className="w-28 text-right text-sm font-medium tabular-nums">{cost.toLocaleString()} pts</span>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Package</span>
                <span className="tabular-nums">{planCost.toLocaleString()} pts</span>
                <span className="text-muted-foreground">+ Objectives</span>
                <span className="tabular-nums">{objectives.toLocaleString()} pts</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-base font-semibold tabular-nums">Total {(planCost + objectives).toLocaleString()} pts</span>
            </div>
            <p className="text-xs text-muted-foreground">
                Objectives are optional. Ads behind on a target are shown more often, but results aren't guaranteed and the ad stops at its end date.
            </p>
        </div>
    );
}
