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
import { Textarea } from "@/components/ui/textarea"
import { useSystemConfigCreateCommand } from "../../../Composable/Command/system/useSystemConfigCreateCommand"
import { Spinner } from "../../ui/spinner"
import { useSystemConfigUpdateCommand } from "../../../Composable/Command/system/useSystemConfigUpdateCommand"

const formSchema = z.object({
    category: z.string().min(1, {
        message: "Category is required.",
    }),
    configKey: z.string().min(1, {
        message: "Config key is required.",
    }),
    configValue: z.string().min(1, {
        message: "Config value is required.",
    }).refine((val) => {
        try {
            JSON.parse(val);
            return true;
        } catch {
            return false;
        }
    }, { message: "Config value must be valid JSON." }),
    description: z.string().optional(),
})

interface SystemConfigFormProps {
    mode: "add" | "edit"
    defaultValues?: {
        id?: string
        category: string
        configKey: string
        configValue: string
        description?: string
    }
    onSuccess?: () => void
}

export default function SystemConfigForm({
    mode,
    defaultValues,
    onSuccess,
}: SystemConfigFormProps) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues || {
            category: "",
            configKey: "",
            configValue: "",
            description: "",
        },
    })
    const { createSystemConfigCommand, isPending: createPending } = useSystemConfigCreateCommand();
    const { updateSystemConfigCommand, isPending: updatePending } = useSystemConfigUpdateCommand();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const data = {
                category: values.category,
                configKey: values.configKey,
                configValue: JSON.parse(values.configValue),
                description: values.description,
            }

            if (mode === "add") {
                await createSystemConfigCommand(data);
                form.reset();
                onSuccess?.()
            } else {
                if (!defaultValues?.id) {
                    toast.error("Config ID is missing.")
                    return
                }
                await updateSystemConfigCommand({ id: defaultValues.id, data })
                form.reset();
                onSuccess?.()
            }
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong!")
        } finally {
            form.reset()
            onSuccess?.()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter category" {...field}
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
                    name="configKey"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Config Key</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter config key" {...field}
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
                    name="configValue"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Config Value (JSON)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder='{"key": "value"}'
                                    className="font-mono text-sm"
                                    rows={5}
                                    {...field}
                                />
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
                                <Input type="text" placeholder="Enter description" {...field}
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

                <Button type="submit" className="w-full" disabled={createPending || updatePending}>
                    {(createPending || updatePending) && <Spinner />}
                    {mode === "add" ? "Add System Config" : "Update System Config"}
                </Button>
            </form>
        </Form>
    )
}
