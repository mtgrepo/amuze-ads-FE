import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Spinner } from "../ui/spinner"
import { useCreatePackageCommand } from "../../Composable/Command/adPackage/useCreatePackageCommand"
import { useUpdatePackageCommand } from "../../Composable/Command/adPackage/useUpdatePackageCommand"
import type { AdPackageResponse } from "../../dto/response/adPackage/adPackageResponse"

const wholeNumber = (label: string, min: number, max?: number) =>
    z.string().trim().refine((v) => /^\d+$/.test(v) && Number(v) >= min && (max === undefined || Number(v) <= max), {
        message: max === undefined ? `${label} must be a whole number of at least ${min}.` : `${label} must be a whole number from ${min} to ${max}.`,
    })

const formSchema = z.object({
    name: z.string().trim().min(1, {
        message: "Name is required.",
    }).max(100),
    durationDays: wholeNumber("Days per unit", 1, 366),
    price: wholeNumber("Price per unit", 1),
    description: z.string().optional(),
    sortOrder: z.string().trim().refine((v) => v === "" || /^-?\d+$/.test(v), {
        message: "Order must be a whole number.",
    }),
})

interface PackageFormProps {
    mode: "add" | "edit"
    pkg?: AdPackageResponse
    onSuccess?: () => void
}

// Editing a package never changes campaigns already bought with it; they keep their own copy.
export default function PackageForm({
    mode,
    pkg,
    onSuccess,
}: PackageFormProps) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: pkg?.name ?? "",
            durationDays: pkg ? String(pkg.durationDays) : "",
            price: pkg ? String(pkg.price) : "",
            description: pkg?.description ?? "",
            sortOrder: pkg ? String(pkg.sortOrder) : "0",
        },
    })
    const { createPackageCommand, isPending: createPending } = useCreatePackageCommand();
    const { updatePackageCommand, isPending: updatePending } = useUpdatePackageCommand();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const data = {
            name: values.name.trim(),
            durationDays: Number(values.durationDays),
            price: Number(values.price),
            description: values.description?.trim() || null,
            sortOrder: values.sortOrder === "" ? 0 : Number(values.sortOrder),
        }
        try {
            if (mode === "edit" && pkg) {
                await updatePackageCommand({ id: pkg.id, data })
            } else {
                await createPackageCommand(data)
                form.reset()
            }
            onSuccess?.()
        } catch {
            // The command already shows why; keep the form open so it can be fixed.
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="e.g. Daily, Monthly" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Days Per Unit</FormLabel>
                            <FormControl>
                                <Input type="number" min={1} placeholder="Enter days" {...field} />
                            </FormControl>
                            <FormDescription>How long one unit runs. Customers choose how many units to buy.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price Per Unit (pts)</FormLabel>
                            <FormControl>
                                <Input type="number" min={1} placeholder="Enter price" {...field} />
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea rows={3} placeholder="Shown to customers when they pick a package" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Order</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormDescription>Lower numbers are listed first.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={createPending || updatePending}>
                    {(createPending || updatePending) && <Spinner />}
                    {mode === "add" ? "Add Package" : "Update Package"}
                </Button>
            </form>
        </Form>
    )
}
