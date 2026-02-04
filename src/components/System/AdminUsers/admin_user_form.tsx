import {  z } from "zod"
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
import { useAdminUserCreateCommand } from "../../../Composable/Command/system/useAdminUserCreateCommand"
import { Spinner } from "../../ui/spinner"
import { useAdminUserUpdateCommand } from "../../../Composable/Command/system/useAdminUserUpdateCommand"

// Validation schema
const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required.",
    }),
    email: z.email().min(1, {
        message: "Email is required.",
    }),
    password: z.string().min(6).optional(),

})

interface AdminProps {
    mode: "add" | "edit"
    defaultValues?: {
        id?: string
        name: string
        email: string
        password?: string
    }
    onSuccess?: () => void
}

export default function AdminUserForm({
    mode,
    defaultValues,
    onSuccess,
}: AdminProps) {


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues || {
            name: "",
            email: "",
            password: "",
        },
    })
    const { createAdminUserCommand, isPending: createPending } = useAdminUserCreateCommand();
    const { updateAdminUserCommand, isPending: updatePending } = useAdminUserUpdateCommand();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {

            const data = {
                name: values.name,
                email: values.email,
                password: values.password
            }

            if (mode === "add") {
                if (!values.password) {
                    form.setError("password", {
                        message: "Password is required",
                    })
                    return
                }
                // Create new admin user
                await createAdminUserCommand(data);
                form.reset();
                onSuccess?.()

            } else {
               if (!defaultValues?.id) {
                    toast.error("Admin ID is missing.")
                    return
                }
                await updateAdminUserCommand({id: defaultValues.id, data})
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
                    {mode === "add" ? "Add Admin User" : "Update Admin User"}
                </Button>
            </form>
        </Form>
    )
}
