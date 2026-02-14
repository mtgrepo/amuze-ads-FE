import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { Textarea } from "../../ui/textarea"
import ImageUpload from "../../Common/image_upload"
import { useAdvertisersQuery } from "../../../Composable/Query/advertiser/useAdvertisersQuery"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import type { AdvertisersResponse } from "../../../dto/response/advertisers/advertisersResponse"
import { CircleCheck, CircleCheckBig, ClockFading, MinusCircle, XCircle } from "lucide-react"
import { usePostCreateCommand } from "../../../Composable/Command/content/posts/usePostCreateCommand"
import { Spinner } from "../../ui/spinner"
import { usePostUpdateCommand } from "../../../Composable/Command/content/posts/usePostUpdateCommand"

// Validation schema
const formSchema = z.object({
    advertiser_id: z.string().min(1, {
        message: "Advertiser is required.",
    }),
    title: z.string().min(10, {
        message: "Title must be at least 10 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    status: z.string().min(1, {
        message: "Status is required.",
    }),
    photo: z.any().optional()
})

interface PostProps {
    mode: "add" | "edit"
    defaultValues?: {
        id?: string
        advertiser_id: string
        title: string
        description: string
        status: string
        photo?: string
    }
    onSuccess?: () => void
}
type Values = z.infer<typeof formSchema>;

export default function PostForm({
    mode,
    defaultValues,
    onSuccess,
}: PostProps) {


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues || {
            advertiser_id: "",
            title: "",
            description: "",
            status: "",
            photo: "",
        },
    })

    //fetch all advertiser to use in dropdown
    const { advertisersList } = useAdvertisersQuery();

    const statusOptions = [
        { value : "approved", label: "Approved", icon: <CircleCheckBig className="text-green-500" />},
        { value: "pending", label: "Pending", icon: <ClockFading className="text-yellow-500" />},
        { value: "active", label: "Active", icon: <CircleCheck className="text-green-500" /> },
        { value: "disabled", label: "Disabled", icon: <MinusCircle className="text-gray-500" /> },
        { value: "rejected", label: "Rejected", icon: <XCircle className="text-red-500" /> },
    ];

    const { createPostCommand, isPending: createPending } = usePostCreateCommand();
    const { updatePostCommand, isPending: updatePending } = usePostUpdateCommand();
    const onSubmit = async (values: Values) => {
        const formData = new FormData();
        const imageFields = ["photo"];

        Object.entries(values).forEach(([key, value]) => {
            if (value === null || value === undefined) return;

            if (imageFields.includes(key)) {
                if (value instanceof File) formData.append(key, value);
                return;
            }

            if (value instanceof File) {
                formData.append(key, value);
            } else if (value instanceof Date) {
                const year = value.getFullYear();
                const month = String(value.getMonth() + 1).padStart(2, "0");
                const day = String(value.getDate()).padStart(2, "0");
                formData.append(key, `${year}-${month}-${day}`);
            } else if (typeof value === "string" && value.trim() !== "") {
                formData.append(key, value);
            }
        });

        if (mode === "add") {
            if (!values.advertiser_id) {
                form.setError("advertiser_id", {
                    message: "Advertiser ID is required",
                })
                return
            }
            // Create new admin user
            await createPostCommand(formData);
            form.reset();
            onSuccess?.()

        } else {
            if (!defaultValues?.id) {
                form.setError("advertiser_id", {
                    message: "Advertiser ID is required",
                })
                return
            }
            await updatePostCommand({ id: defaultValues.id, data: formData });
            form.reset();
            onSuccess?.()
        }
        form.reset();
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="advertiser_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Advertiser</FormLabel>
                            <FormControl>
                                <Select
                                    value={String(field.value || "")}
                                    onValueChange={(val) => field.onChange(String(val))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Advertiser" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {advertisersList
                                            ?.map((ad: AdvertisersResponse) => (
                                                <SelectItem key={ad.id} value={String(ad.id)}>
                                                    {ad.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter title" {...field}
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
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    placeholder="Enter description...."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <Select
                                    value={String(field.value || "")}
                                    onValueChange={(val) => field.onChange(String(val))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions
                                            ?.map((st: any) => (
                                                <SelectItem key={st.value} value={String(st.value)}>
                                                    {st.icon}  {st.label}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    name="photo"
                    render={({ field }) => (
                        <ImageUpload value={field.value} onChange={field.onChange} label="Business Photo" />
                    )}
                />

                <Button type="submit" className="w-full" disabled={createPending || updatePending}>
                    {(createPending || updatePending) && <Spinner />}
                    {mode === "add" ? "Add Post" : "Update Post"}
                </Button>
            </form>
        </Form>
    )
}
