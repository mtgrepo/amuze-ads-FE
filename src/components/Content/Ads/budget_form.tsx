import { useState } from "react"
import { EditIcon, Lock, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "../../ui/spinner"
import { useUpdateCampaignBudgetCommand } from "../../../Composable/Command/content/campaign/useUpdateCampaignBudgetCommand"
import { useActivePackagesQuery } from "../../../Composable/Query/adPackage/useActivePackagesQuery"
import { PackagePicker } from "./package_picker"
import { offeredPackages, summarize, type PackageChoice, type PackageTerms } from "./package_terms"
import { ObjectivesPicker } from "./objectives_picker"
import { billableObjectives, sameObjectives } from "./objective_terms"
import { useCampaignObjectivesQuery } from "../../../Composable/Query/campaignObjective/useCampaignObjectivesQuery"
import { useObjectivePricesQuery } from "../../../Composable/Query/campaignObjective/useObjectivePricesQuery"
import { useSaveCampaignObjectivesCommand } from "../../../Composable/Command/campaignObjective/useSaveCampaignObjectivesCommand"
import type { ObjectiveInput } from "../../../dto/response/campaignObjective/campaignObjectiveResponse"

interface BudgetFormProps {
    campaign: {
        id: string
        status: string
        packageId: string
        packageName: string
        packageDays: number
        packagePrice: number
        packageQuantity: number
        planCost: number
        objectiveCost: number
        totalBudget: number
        startDate: string | Date
        endDate: string | Date
    }
    /** The creative's asset type; watch objectives need a video. */
    assetType?: string
    /** Render just the form, already editing (e.g. inside a dialog). */
    embedded?: boolean
    /** Called after Save succeeds or Cancel is pressed. */
    onDone?: () => void
}

const toDateOnly = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Stored dates arrive as "YYYY-MM-DD"; read them as local calendar days (new Date("YYYY-MM-DD") is UTC midnight),
// matching the local-midnight dates the calendar picker produces.
const parseLocalDate = (value: string | Date) => {
    if (value instanceof Date) return value;
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
}

// The package and start date set the amount paid, so they can change only while the ad is a draft.
export default function BudgetForm({ campaign, assetType, embedded = false, onDone }: BudgetFormProps) {
    const [editing, setEditing] = useState(embedded);
    const isDraft = campaign.status === "draft";
    const { updateCampaignBudgetCommand, isPending } = useUpdateCampaignBudgetCommand();
    const { packages: onSale } = useActivePackagesQuery();
    const { objectives: savedObjectives, isLoading: objectivesLoading } = useCampaignObjectivesQuery(campaign.id);
    const { prices: objectivePrices } = useObjectivePricesQuery();
    const { saveCampaignObjectivesCommand, isPending: savingObjectives } = useSaveCampaignObjectivesCommand();
    const savedPicks: ObjectiveInput[] = savedObjectives
        .filter((o) => o.selected)
        .map((o) => ({ objectiveType: o.objectiveType, targetCount: o.targetCount }));
    // Until the customer touches the objectives, show what's saved (it may load after the form opens),
    // and never re-save it: re-saving would re-price it at today's prices.
    const [editedPicks, setEditedPicks] = useState<ObjectiveInput[] | null>(null);
    const picks = editedPicks ?? savedPicks;

    // The draft's own copy of its package: it keeps the price the customer was shown.
    const current: PackageTerms | undefined = campaign.packageId ? {
        id: campaign.packageId,
        name: campaign.packageName,
        durationDays: Number(campaign.packageDays),
        price: Number(campaign.packagePrice),
    } : undefined;
    const initial = (): PackageChoice => ({
        packageId: campaign.packageId,
        packageQuantity: Number(campaign.packageQuantity),
        startDate: parseLocalDate(campaign.startDate),
    });
    const [choice, setChoice] = useState<PackageChoice>(initial);
    const [error, setError] = useState<string>();
    const summary = summarize(choice, offeredPackages(onSale, current));

    const startEditing = () => {
        setChoice(initial());
        setEditedPicks(null);
        setError(undefined);
        setEditing(true);
    };

    const handleCancel = () => {
        setChoice(initial());
        setEditedPicks(null);
        setError(undefined);
        setEditing(embedded);
        onDone?.();
    };

    const handleSave = async () => {
        if (!choice.packageId || !choice.startDate || !(choice.packageQuantity >= 1)) {
            setError("Pick a package, how many, and a start date.");
            return;
        }
        if (summary.tooLong) return;
        try {
            await updateCampaignBudgetCommand({
                id: campaign.id,
                data: {
                    packageId: choice.packageId,
                    packageQuantity: choice.packageQuantity,
                    startDate: toDateOnly(choice.startDate),
                },
            });
            const billable = billableObjectives(picks, objectivePrices, assetType);
            if (editedPicks !== null && !sameObjectives(billable, savedPicks)) {
                await saveCampaignObjectivesCommand({ campaignId: campaign.id, objectives: billable });
            }
            setEditedPicks(null);
            setEditing(embedded);
            onDone?.();
        } catch {
            // The command already shows why.
        }
    };

    const objectiveCost = Number(campaign.objectiveCost ?? 0);
    const disabled = !editing;

    const formContent = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <PackagePicker
                    value={editing ? choice : initial()}
                    onChange={setChoice}
                    current={current}
                    // Outside editing, show what the campaign holds; extensions move its end date and cost.
                    saved={editing ? undefined : { endDate: parseLocalDate(campaign.endDate), planCost: Number(campaign.planCost) }}
                    disabled={disabled}
                />
                <div className="max-md:hidden" />
            </div>
            <div className="space-y-4">
                <h4 className="text-sm font-semibold">Objectives <span className="font-normal text-muted-foreground">(optional)</span></h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <ObjectivesPicker
                        value={picks}
                        onChange={setEditedPicks}
                        assetType={assetType}
                        planCost={editing ? summary.planCost : Number(campaign.planCost)}
                        // Untouched picks keep the price they were saved at; that's what Pay will charge.
                        objectivesCost={editedPicks === null ? objectiveCost : undefined}
                        // Wait for the saved objectives, so an early edit can't drop them.
                        disabled={disabled || objectivesLoading}
                    />
                </div>
            </div>
            {editing && (
                <>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending || savingObjectives}>Cancel</Button>
                        <Button type="button" onClick={handleSave} disabled={isPending || savingObjectives || summary.tooLong}>
                            {(isPending || savingObjectives) && <Spinner />}
                            Save
                        </Button>
                    </div>
                </>
            )}
        </div>
    );

    if (embedded) return formContent;

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex justify-between items-center">
                <CardTitle className="flex flex-row gap-3 items-center">
                    <Wallet size={20} className="text-primary" /> Budget
                </CardTitle>
                {isDraft && !editing && (
                    <Button type="button" size="sm" variant="outline" onClick={startEditing}>
                        <EditIcon size={16} /> Edit
                    </Button>
                )}
                {!isDraft && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock size={14} /> Budget is locked after payment. Extend to add time.
                    </span>
                )}
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    )
}
