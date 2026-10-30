import { format } from "date-fns";
import { CalendarIcon, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Calendar } from "../../ui/calendar";
import { cn } from "../../../lib/utils";
import { useActivePackagesQuery } from "../../../Composable/Query/adPackage/useActivePackagesQuery";
import { daysLabel } from "../../../dto/response/adPackage/adPackageResponse";
import { MAX_RUN_DAYS, offeredPackages, summarize, type PackageChoice, type PackageTerms } from "./package_terms";

interface PackagePickerProps {
    value: PackageChoice;
    onChange: (value: PackageChoice) => void;
    /** A draft's own copy of the package it was created with. */
    current?: PackageTerms;
    disabled?: boolean;
    errors?: { packageId?: string; packageQuantity?: string; startDate?: string };
}

/** Pick a package, how many units, and the start date; the end date and price follow from them. */
export function PackagePicker({ value, onChange, current, disabled, errors }: PackagePickerProps) {
    const { packages: onSale, isLoading } = useActivePackagesQuery();
    const packages = offeredPackages(onSale, current);
    const summary = summarize(value, packages);
    const set = (patch: Partial<PackageChoice>) => onChange({ ...value, ...patch });

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <p className="text-sm font-medium">Package</p>
                {isLoading ? (
                    <div className="h-20 animate-pulse rounded-xl bg-muted" />
                ) : packages.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">No packages are on sale right now.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Package">
                        {packages.map((p) => {
                            const selected = p.id === value.packageId;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    disabled={disabled}
                                    onClick={() => set({ packageId: p.id })}
                                    className={cn(
                                        "relative rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70",
                                        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50",
                                    )}
                                >
                                    {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                                    <div className="font-medium">{p.name}</div>
                                    <div className="mt-0.5 text-sm tabular-nums">
                                        {p.price.toLocaleString()} pts <span className="text-muted-foreground">per {daysLabel(p.durationDays)}</span>
                                    </div>
                                    {p.description && <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</div>}
                                    {p.ownCopy && <div className="mt-1 text-xs text-amber-700 dark:text-amber-400">Kept at the price you saw</div>}
                                </button>
                            );
                        })}
                    </div>
                )}
                {errors?.packageId && <p className="text-sm text-destructive">{errors.packageId}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="package-quantity" className="text-sm font-medium">
                        How many {summary.terms ? `× ${summary.terms.name}` : "units"}
                    </label>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" aria-label="One less" disabled={disabled || value.packageQuantity <= 1}
                            onClick={() => set({ packageQuantity: Math.max(1, value.packageQuantity - 1) })}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                            id="package-quantity"
                            inputMode="numeric"
                            className="w-24 text-center tabular-nums"
                            disabled={disabled}
                            value={value.packageQuantity || ""}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "");
                                set({ packageQuantity: digits === "" ? 0 : Number(digits) });
                            }}
                        />
                        <Button type="button" variant="outline" size="icon" aria-label="One more" disabled={disabled}
                            onClick={() => set({ packageQuantity: (value.packageQuantity || 0) + 1 })}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {errors?.packageQuantity && <p className="text-sm text-destructive">{errors.packageQuantity}</p>}
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">Start date</p>
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
                    {errors?.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                </div>
            </div>

            <div className={cn("flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm", summary.tooLong ? "bg-destructive/10" : "bg-muted/60")}>
                {summary.terms && summary.runDays > 0 ? (
                    <>
                        <span>
                            <span className="font-medium">{value.packageQuantity} × {summary.terms.name}</span>
                            <span className="text-muted-foreground">
                                {" · "}{daysLabel(summary.runDays)}
                                {summary.endDate && value.startDate && ` · ${format(value.startDate, "d MMM")} – ${format(summary.endDate, "d MMM yyyy")}`}
                            </span>
                        </span>
                        <span className="font-semibold tabular-nums">{summary.planCost.toLocaleString()} pts</span>
                    </>
                ) : (
                    <span className="text-muted-foreground">Pick a package and how many to see the run and price.</span>
                )}
                {summary.tooLong && <p className="w-full text-destructive">An ad can run for at most {MAX_RUN_DAYS} days.</p>}
            </div>
        </div>
    );
}
