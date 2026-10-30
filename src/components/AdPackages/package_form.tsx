import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "../ui/spinner"
import { useCreatePackageCommand } from "../../Composable/Command/adPackage/useCreatePackageCommand"
import { useUpdatePackageCommand } from "../../Composable/Command/adPackage/useUpdatePackageCommand"
import { daysLabel, type AdPackageResponse } from "../../dto/response/adPackage/adPackageResponse"

const wholeNumber = (label: string, min: number, max?: number) =>
    z.string().trim().refine((v) => /^\d+$/.test(v) && Number(v) >= min && (max === undefined || Number(v) <= max), {
        message: max === undefined ? `${label} must be a whole number of at least ${min}.` : `${label} must be a whole number from ${min} to ${max}.`,
    })

const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Name is required." }).max(100),
    durationDays: wholeNumber("Days per unit", 1, 366),
    price: wholeNumber("Price per unit", 1),
    description: z.string().optional(),
    sortOrder: z.string().trim().refine((v) => v === "" || /^-?\d+$/.test(v), { message: "Order must be a whole number." }),
})

type Values = z.infer<typeof formSchema>

/** Create or edit a package. Editing never changes campaigns already bought with it. */
export default function PackageForm({ pkg, onDone }: { pkg?: AdPackageResponse; onDone: () => void }) {
    const form = useForm<Values>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: pkg?.name ?? "",
            durationDays: pkg ? String(pkg.durationDays) : "",
            price: pkg ? String(pkg.price) : "",
            description: pkg?.description ?? "",
            sortOrder: pkg ? String(pkg.sortOrder) : "0",
        },
    })
    const { createPackageCommand, isPending: creating } = useCreatePackageCommand()
    const { updatePackageCommand, isPending: updating } = useUpdatePackageCommand()
    const saving = creating || updating

    const days = Number(form.watch("durationDays")) || 0
    const price = Number(form.watch("price")) || 0

    const onSubmit = async (values: Values) => {
        const data = {
            name: values.name.trim(),
            durationDays: Number(values.durationDays),
            price: Number(values.price),
            description: values.description?.trim() || null,
            sortOrder: values.sortOrder === "" ? 0 : Number(values.sortOrder),
        }
        try {
            if (pkg) await updatePackageCommand({ id: pkg.id, data })
            else await createPackageCommand(data)
            onDone()
        } catch {
            // The command already shows why.
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Daily, Weekly, Monthly" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="durationDays" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Days per unit</FormLabel>
                            <FormControl><Input inputMode="numeric" placeholder="1" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price per unit (pts)</FormLabel>
                            <FormControl><Input inputMode="numeric" placeholder="1000" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description <span className="font-normal text-muted-foreground">(optional)</span></FormLabel>
                        <FormControl><Textarea rows={2} placeholder="Shown to customers when they pick a package" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="sortOrder" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Order</FormLabel>
                        <FormControl><Input inputMode="numeric" className="w-28" {...field} /></FormControl>
                        <FormDescription>Lower numbers are listed first.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                    Customers buy this package in whole units; each unit runs for{" "}
                    <span className="font-medium text-foreground">{days ? daysLabel(days) : "…"}</span> and costs{" "}
                    <span className="font-medium text-foreground">{price ? `${price.toLocaleString()} pts` : "…"}</span>.
                    {pkg && " Changes apply to new purchases only; ads already bought keep their price."}
                </p>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onDone} disabled={saving}>Cancel</Button>
                    <Button type="submit" disabled={saving}>
                        {saving && <Spinner />}
                        {pkg ? "Save changes" : "Add package"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
