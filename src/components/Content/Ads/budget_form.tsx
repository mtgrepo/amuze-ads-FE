import { useState } from "react"
import { format } from "date-fns"
import { EditIcon, Lock, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "../../ui/spinner"
import { useUpdateCampaignBudgetCommand } from "../../../Composable/Command/content/campaign/useUpdateCampaignBudgetCommand"
import { useActivePackagesQuery } from "../../../Composable/Query/adPackage/useActivePackagesQuery"
import { daysLabel } from "../../../dto/response/adPackage/adPackageResponse"
import { PackagePicker } from "./package_picker"
import { offeredPackages, summarize, type PackageChoice, type PackageTerms } from "./package_terms"

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
export default function BudgetForm({ campaign, embedded = false, onDone }: BudgetFormProps) {
    const [editing, setEditing] = useState(embedded);
    const isDraft = campaign.status === "draft";
    const { updateCampaignBudgetCommand, isPending } = useUpdateCampaignBudgetCommand();
    const { packages: onSale } = useActivePackagesQuery();

    // The draft's own copy of its package: it keeps the price the customer was shown.
    const current: PackageTerms = {
        id: campaign.packageId,
        name: campaign.packageName,
        durationDays: Number(campaign.packageDays),
        price: Number(campaign.packagePrice),
    };
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
        setError(undefined);
        setEditing(true);
    };

    const handleCancel = () => {
        setChoice(initial());
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
            setEditing(embedded);
            onDone?.();
        } catch {
            // The command already shows why.
        }
    };

    const objectiveCost = Number(campaign.objectiveCost ?? 0);

    const formContent = (
        <div className="space-y-4">
            <PackagePicker value={choice} onChange={setChoice} current={current} />
            {objectiveCost > 0 && (
                <p className="text-sm text-muted-foreground">
                    Objectives add {objectiveCost.toLocaleString()} pts, so the total will be{" "}
                    <span className="font-medium text-foreground">{(summary.planCost + objectiveCost).toLocaleString()} pts</span>.
                </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>Cancel</Button>
                <Button type="button" onClick={handleSave} disabled={isPending || summary.tooLong}>
                    {isPending && <Spinner />}
                    Save
                </Button>
            </div>
        </div>
    );

    if (embedded) return formContent;

    const start = parseLocalDate(campaign.startDate);
    const end = parseLocalDate(campaign.endDate);

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex justify-between items-center">
                <CardTitle className="flex flex-row gap-3 items-center">
                    <Wallet size={20} className="text-primary" /> Package
                </CardTitle>
                {isDraft && !editing && (
                    <Button type="button" size="sm" variant="outline" onClick={startEditing}>
                        <EditIcon size={16} /> Edit
                    </Button>
                )}
                {!isDraft && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock size={14} /> Locked after payment. Extend to add time.
                    </span>
                )}
            </CardHeader>
            <CardContent>
                {editing ? formContent : (
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm md:grid-cols-4">
                        <div>
                            <dt className="text-muted-foreground">Package</dt>
                            <dd className="mt-1 font-medium">{campaign.packageQuantity} × {campaign.packageName}</dd>
                            <dd className="text-xs text-muted-foreground">{Number(campaign.packagePrice).toLocaleString()} pts per {daysLabel(Number(campaign.packageDays))}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Runs</dt>
                            <dd className="mt-1 font-medium">{format(start, "d MMM")} – {format(end, "d MMM yyyy")}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Package cost</dt>
                            <dd className="mt-1 font-medium tabular-nums">{Number(campaign.planCost).toLocaleString()} pts</dd>
                            {objectiveCost > 0 && <dd className="text-xs text-muted-foreground">+ {objectiveCost.toLocaleString()} pts objectives</dd>}
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Total</dt>
                            <dd className="mt-1 text-lg font-semibold tabular-nums">{Number(campaign.totalBudget).toLocaleString()} pts</dd>
                        </div>
                    </dl>
                )}
            </CardContent>
        </Card>
    )
}
