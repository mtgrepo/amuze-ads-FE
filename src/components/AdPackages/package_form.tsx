import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Spinner } from "../ui/spinner"
import { safeString, usePreventScriptTag } from "@/lib/scriptTag"
import { useCreatePackageCommand } from "../../Composable/Command/adPackage/useCreatePackageCommand"
import { useUpdatePackageCommand } from "../../Composable/Command/adPackage/useUpdatePackageCommand"
import type { AdPackageResponse } from "../../dto/response/adPackage/adPackageResponse"
import { perDays, pts } from "./package_format"

const wholeNumber = (label: string, min: number, max?: number) =>
    z.string().trim().refine((v) => /^\d+$/.test(v) && Number(v) >= min && (max === undefined || Number(v) <= max), {
        message: max === undefined ? `${label} must be a whole number of at least ${min}.` : `${label} must be a whole number from ${min} to ${max}.`,
    })

const formSchema = z.object({
    name: safeString(z.string().trim().min(1, {
        message: "Name is required.",
    }).max(100)),
    durationDays: wholeNumber("Days per unit", 1, 366),
    price: wholeNumber("Price per unit", 1),
    description: safeString(z.string()).optional(),
    sortOrder: z.string().trim().refine((v) => v === "" || /^-?\d+$/.test(v), {
        message: "Order must be a whole number.",
    }),
})

const LEGEND = "mb-3 p-0 text-xs font-semibold tracking-[0.02em] text-foreground/80"
const FIELD_LABEL = "text-[13px] font-medium"

interface PackageDrawerProps {
    /** null = add a new package. */
    pkg: AdPackageResponse | null
    /** List order offered for a new package. */
    nextOrder: number
    onClose: () => void
}

// Editing a package never changes campaigns already bought with it; they keep their own copy.
export default function PackageDrawer({ pkg, nextOrder, onClose }: PackageDrawerProps) {
    const isNew = !pkg
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: pkg?.name ?? "",
            durationDays: pkg ? String(pkg.durationDays) : "",
            price: pkg ? String(pkg.price) : "",
            description: pkg?.description ?? "",
            sortOrder: pkg ? String(pkg.sortOrder) : String(nextOrder),
        },
    })
    usePreventScriptTag(form)

    const { createPackageCommand, isPending: createPending } = useCreatePackageCommand();
    const { updatePackageCommand, isPending: updatePending } = useUpdatePackageCommand();
    const pending = createPending || updatePending

    const [name, days, price] = useWatch({ control: form.control, name: ["name", "durationDays", "price"] })
    const dayCount = Number(days) || 0
    const priceCount = Number(price) || 0

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const data = {
            name: values.name.trim(),
            durationDays: Number(values.durationDays),
            price: Number(values.price),
            description: values.description?.trim() || null,
            sortOrder: values.sortOrder === "" ? 0 : Number(values.sortOrder),
        }
        try {
            if (pkg) {
                await updatePackageCommand({ id: pkg.id, data })
            } else {
                await createPackageCommand(data)
            }
            onClose()
        } catch {
            // The command already shows why; keep the drawer open so it can be fixed.
        }
    }

    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" showCloseButton={false} className="flex w-full flex-col gap-0 bg-card p-0 sm:max-w-[480px]">
                <div className="flex items-start gap-3 border-b px-[22px] py-5">
                    <div className="flex flex-1 flex-col gap-1">
                        <SheetTitle className="text-[19px] font-semibold">{isNew ? "Add package" : `Edit ${pkg.name}`}</SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            {isNew ? "Advertisers can pick it as soon as you save." : "Changes apply to new purchases only."}
                        </SheetDescription>
                    </div>
                    <Button type="button" variant="outline" size="icon" className="size-9 bg-card" aria-label="Close" onClick={onClose}>✕</Button>
                </div>

                <Form {...form}>
                    <form id="package-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6 overflow-y-auto p-[22px]">
                        <fieldset className="flex flex-col gap-4">
                            <legend className={LEGEND}>BASICS</legend>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={FIELD_LABEL}>Name</FormLabel>
                                        <FormControl>
                                            <Input type="text" className="h-10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={FIELD_LABEL}>
                                            Description <span className="font-normal text-muted-foreground">(optional)</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea rows={3} {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">Shown to advertisers when they pick a package. No HTML or scripts.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </fieldset>

                        <fieldset className="flex flex-col gap-4">
                            <legend className={LEGEND}>PRICING</legend>
                            <div className="grid grid-cols-2 gap-3.5">
                                <FormField
                                    control={form.control}
                                    name="durationDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={FIELD_LABEL}>Days per unit</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} max={366} className="h-10 font-mono tabular-nums" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={FIELD_LABEL}>Price per unit (pts)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} className="h-10 font-mono tabular-nums" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="sortOrder"
                                render={({ field }) => (
                                    <FormItem className="max-w-[160px]">
                                        <FormLabel className={FIELD_LABEL}>List order</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="h-10 font-mono tabular-nums" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">Lower comes first.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </fieldset>

                        <div className="flex flex-col gap-2.5">
                            <span className="text-xs font-semibold tracking-[0.02em] text-foreground/80">ADVERTISERS WILL SEE</span>
                            <div className="flex flex-col gap-1 rounded-xl border border-primary bg-primary/5 p-3.5 ring-1 ring-primary">
                                <span className="font-semibold">{name || " "}</span>
                                <span className="font-mono text-lg tabular-nums">{pts(priceCount)}</span>
                                <span className="text-[13px] text-foreground/80">{perDays(dayCount)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Example: 3 × {name || "this package"} = <span className="font-mono tabular-nums">{(3 * dayCount).toLocaleString("en-US")}</span> days for <span className="font-mono tabular-nums">{pts(3 * priceCount)}</span>.
                            </span>
                        </div>
                    </form>
                </Form>

                <div className="flex justify-end gap-2.5 border-t px-[22px] py-3.5">
                    <Button type="button" variant="outline" className="bg-card" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="package-form" disabled={pending}>
                        {pending && <Spinner />}
                        {isNew ? "Add package" : "Save changes"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
