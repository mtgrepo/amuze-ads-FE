import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAdvertiserCreateCommand } from "../../Composable/Command/advertiser/useAdvertiserCreateCommand"
import { Spinner } from "../ui/spinner"
import { useAdvertiserUpdateCommand } from "../../Composable/Command/advertiser/useAdvertiserUpdateCommand"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useAdvertisersQuery } from "../../Composable/Query/advertiser/useAdvertisersQuery"
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse"

const NO_AGENCY = "none"

// Validation schema
const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    type: z.enum(["advertiser", "agency"]),
    agencyId: z.string(),
    email: z.union([z.email(), z.literal("")]),
    phone: z.string(),
    status: z.string().min(1, { message: "Status is required." }),
    password: z.string().optional(),
    verified: z.boolean(),
}).superRefine((v, ctx) => {
    const isClient = v.type === "advertiser" && v.agencyId !== NO_AGENCY
    if (!isClient && !v.email) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Email is required." })
    }
    if (!isClient && !v.phone) {
        ctx.addIssue({ code: "custom", path: ["phone"], message: "Phone is required." })
    }
    if (v.password && v.password.length < 6) {
        ctx.addIssue({ code: "custom", path: ["password"], message: "Password must be at least 6 characters." })
    }
})

interface AdvertiserProps {
    mode: "add" | "edit"
    defaultValues?: {
        id?: string
        name: string
        email: string | null
        phone: string
        status: string
        password?: string
        verified: boolean
        agencyId?: string | null
    }
    onSuccess?: () => void
}

export default function AdvertiserForm({
    mode,
    defaultValues,
    onSuccess,
}: AdvertiserProps) {

    const { createAdvertiserCommand, isPending: createPending } = useAdvertiserCreateCommand();
    const { updateAdvertiserCommand, isPending: updatePending } = useAdvertiserUpdateCommand();
    const { advertisersList } = useAdvertisersQuery();
    const agencies: AdvertisersResponse[] = (advertisersList ?? []).filter((a: AdvertisersResponse) => a.type === "agency");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultValues?.name ?? "",
            type: "advertiser",
            agencyId: defaultValues?.agencyId ?? NO_AGENCY,
            email: defaultValues?.email ?? "",
            phone: defaultValues?.phone ?? "",
            status: defaultValues?.status ?? "active",
            password: "",
            verified: defaultValues?.verified ?? true,
        },
    })

    const accountType = form.watch("type");
    const agencyId = form.watch("agencyId");
    const isClient = accountType === "advertiser" && agencyId !== NO_AGENCY;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (mode === "add") {
                if (!isClient && !values.password) {
                    form.setError("password", { message: "Password is required" })
                    return
                }
                await createAdvertiserCommand({
                    name: values.name,
                    type: values.type,
                    ...(isClient && { agencyId: values.agencyId }),
                    ...(values.email && { email: values.email }),
                    ...(values.phone && { phone: values.phone }),
                    status: values.status,
                    verified: values.verified,
                    ...(!isClient && { password: values.password }),
                })
            } else {
                if (!defaultValues?.id) {
                    toast.error("Advertiser ID is missing.")
                    return
                }
                await updateAdvertiserCommand({
                    id: defaultValues.id,
                    data: {
                        name: values.name,
                        email: values.email || undefined,
                        phone: values.phone,
                        status: values.status,
                        verified: values.verified,
                    },
                })
            }
            form.reset();
            onSuccess?.()
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong!")
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {mode === "add" && (
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={(v) => {
                                        field.onChange(v)
                                        if (v === "agency") form.setValue("agencyId", NO_AGENCY)
                                    }}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="advertiser">Advertiser</SelectItem>
                                            <SelectItem value="agency">Agency</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {mode === "add" && accountType === "advertiser" && (
                    <FormField
                        control={form.control}
                        name="agencyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agency</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NO_AGENCY}>None (standalone advertiser)</SelectItem>
                                            {agencies.map((a) => (
                                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter Name" {...field}
                                    value={field.value}
                                    onChange={(e) =>
                                        field.onChange(e.target.value)
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isClient ? "Email (optional)" : "Email"}</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Enter Email" {...field}
                                    value={field.value}
                                    onChange={(e) =>
                                        field.onChange(e.target.value)
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isClient ? "Phone (optional)" : "Phone"}</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter Phone" {...field}
                                    value={field.value}
                                    onChange={(e) =>
                                        field.onChange(e.target.value)
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Status */}
                {/* <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex gap-4 bg-[#141416] border border-primary-muted-foreground rounded-md p-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="active" id="active" />
                                        <label htmlFor="active">Active</label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="inactive" id="inactive" />
                                        <label htmlFor="inactive">Inactive</label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}

                {/* Verified */}
                {/* <FormField
                    control={form.control}
                    name="verified"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Verified</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(val) => field.onChange(val === "true")}
                                    defaultValue={String(field.value)}
                                    className="flex gap-4 bg-[#141416] border border-primary-muted-foreground rounded-md p-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="true" id="yes" />
                                        <label htmlFor="yes">Yes</label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="false" id="no" />
                                        <label htmlFor="no">No</label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}

                {mode === "add" && !isClient && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Enter Password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" className="w-full" disabled={createPending || updatePending}>
                    {(createPending || updatePending) && <Spinner />}
                    {mode === "add" ? (accountType === "agency" ? "Add Agency" : isClient ? "Add Client" : "Add Advertiser") : "Update Account"}
                </Button>
            </form>
        </Form>
    )
}
