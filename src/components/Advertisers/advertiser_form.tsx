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

// Validation schema
const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required.",
    }),
    email: z.email().min(1, {
        message: "Email is required.",
    }),
    phone: z.string().min(1, {
        message: "Phone is required.",
    }),
    status: z.string().min(1, {
        message: "Status is required.",
    }),
    password: z.string().min(6).optional(),
    verified: z.boolean(),
})

interface AdvertiserProps {
    mode: "add" | "edit"
    defaultValues?: {
        id?: string
        name: string
        email: string
        phone: string
        status: string
        password?: string
        verified: boolean
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues || {
            name: "",
            email: "",
            phone: "",
            status: "active",
            password: "",
            verified: true,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (mode === "add") {
                if (!values.password) {
                    form.setError("password", {
                        message: "Password is required",
                    })
                    return
                }

                await createAdvertiserCommand({
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                    status: values.status,
                    verified: values.verified,
                    password: values.password, 
                })
            } else {
                if (!defaultValues?.id) {
                    toast.error("Advertiser ID is missing.")
                    return
                }
                await updateAdvertiserCommand({id: defaultValues.id, data: values})
                form.reset();
                onSuccess?.()
            }
            onSuccess?.()
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong!")
        } finally {
            form.reset()
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
                            <FormLabel>Email</FormLabel>
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
                            <FormLabel>Phone</FormLabel>
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

                {mode === "add" && (
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
                    {mode === "add" ? "Add Advertiser" : "Update Advertiser"}
                </Button>
            </form>
        </Form>
    )
}
