import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Calendar } from "../../ui/calendar";
import { cn } from "../../../lib/utils";
import { useActivePackagesQuery } from "../../../Composable/Query/adPackage/useActivePackagesQuery";
import { daysLabel } from "../../../dto/response/adPackage/adPackageResponse";
import { MAX_RUN_DAYS, offeredPackages, summarize, wholeNumber, type PackageChoice, type PackageTerms } from "./package_terms";

interface PackagePickerProps {
    value: PackageChoice;
    onChange: (value: PackageChoice) => void;
    /** A draft's own copy of the package it was created with. */
    current?: PackageTerms;
    /** What the campaign actually holds (e.g. after extensions); shown instead of the worked-out end date and cost. */
    saved?: { endDate: Date; planCost: number };
    disabled?: boolean;
    errors?: { packageId?: string; packageQuantity?: string; startDate?: string };
}

/**
 * Package, how many, and start date; the end date and cost follow from them.
 * Renders form fields straight into the parent's two-column grid.
 */
export function PackagePicker({ value, onChange, current, saved, disabled, errors }: PackagePickerProps) {
    const { packages: onSale, isLoading } = useActivePackagesQuery();
    const packages = offeredPackages(onSale, current);
    const summary = summarize(value, packages);
    const set = (patch: Partial<PackageChoice>) => onChange({ ...value, ...patch });
    const endDate = saved?.endDate ?? summary.endDate;
    const planCost = saved?.planCost ?? summary.planCost;

    return (
        <>
            <div className="grid gap-2">
                <Label className={cn(errors?.packageId && "text-destructive")}>Package</Label>
                <Select value={value.packageId} onValueChange={(packageId) => set({ packageId })} disabled={disabled || isLoading}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading..." : packages.length ? "Select package" : "No packages on sale"} />
                    </SelectTrigger>
                    <SelectContent>
                        {packages.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name} · {p.price.toLocaleString()} pts per {daysLabel(p.durationDays)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {summary.terms?.ownCopy && !disabled && <p className="text-muted-foreground text-sm">Kept at the price shown when this ad was created.</p>}
                {errors?.packageId && <p className="text-destructive text-sm">{errors.packageId}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="package-quantity" className={cn(errors?.packageQuantity && "text-destructive")}>Quantity</Label>
                <Input
                    id="package-quantity"
                    type="number"
                    min={1}
                    disabled={disabled}
                    value={value.packageQuantity || ""}
                    onChange={(e) => set({ packageQuantity: wholeNumber(e.target.value) })}
                />
                {summary.terms && <p className="text-muted-foreground text-sm">{daysLabel(summary.terms.durationDays)} each</p>}
                {errors?.packageQuantity && <p className="text-destructive text-sm">{errors.packageQuantity}</p>}
            </div>

            <div className="grid gap-2">
                <Label className={cn(errors?.startDate && "text-destructive")}>Start Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" disabled={disabled}
                            className={cn("w-full pl-3 text-left font-normal", !value.startDate && "text-muted-foreground")}>
                            {value.startDate ? format(value.startDate, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={value.startDate} onSelect={(d) => set({ startDate: d ?? undefined })} captionLayout="dropdown" />
                    </PopoverContent>
                </Popover>
                {errors?.startDate && <p className="text-destructive text-sm">{errors.startDate}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="package-end-date" className={cn(summary.tooLong && "text-destructive")}>End Date</Label>
                <Input id="package-end-date" disabled value={endDate ? format(endDate, "PPP") : ""} placeholder="Set by package and quantity" />
                {summary.tooLong && <p className="text-destructive text-sm">An ad can run for at most {MAX_RUN_DAYS} days.</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="package-cost">Package Cost</Label>
                <Input id="package-cost" disabled value={planCost ? `${planCost.toLocaleString()} pts` : ""} placeholder="0 pts" />
            </div>
        </>
    );
}
