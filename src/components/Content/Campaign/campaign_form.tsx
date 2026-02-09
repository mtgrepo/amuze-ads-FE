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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { CalendarIcon } from "lucide-react"
import { usePostListQuery } from "../../../Composable/Query/content/usePostListQuery"
import type { PostResponse } from "../../../dto/response/content/postResponse"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { cn } from "../../../lib/utils"
import { format } from 'date-fns'
import { Calendar } from "../../ui/calendar"
import { useAdvertisersQuery } from "../../../Composable/Query/advertiser/useAdvertisersQuery"
import type { AdvertisersResponse } from "../../../dto/response/advertisers/advertisersResponse"

// Validation schema
const formSchema = z.object({
    advertiserId: z.string().min(1, {
        message: "Campaign is required.",
    }),
    postId: z.string().min(10, {
        message: "Post is required.",
    }),
    name: z.string().min(10, {
        message: "Name must be at least 10 characters.",
    }),
    objective: z.string().min(1, {
        message: "Objective is required.",
    }),
    dailyBudget: z.number().min(1, {
        message: "Daily budget is required.",
    }),
    totalBudget: z.number().min(1, {
        message: "Total budget is required.",
    }),
    spentAmount: z.number().min(1, {
        message: "Spent amount is required.",
    }),
    startDate: z.date().min(1, {
        message: "Start date is required.",
    }),
    endDate: z.date().min(1, {
        message: "End date is required.",
    }),
    status: z.string().min(1, {
        message: "Status is required.",
    }),
})

interface CampaignProps {
    mode: "add" | "edit"
    defaultValues?: {
        id: string
        advertiserId: string
        postId: string
        name: string
        objective: string
        dailyBudget: number
        totalBudget: number
        spentAmount: number
        startDate: Date
        endDate: Date
        status: string
    }
    onSuccess?: () => void
}
type Values = z.infer<typeof formSchema>;

export default function CampaignForm({
    mode,
    defaultValues,
    onSuccess,
}: CampaignProps) {


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues || {
            advertiserId: "",
            postId: "",
            name: "",
            objective: "",
            dailyBudget: 0,
            totalBudget: 0,
            spentAmount: 0,
            startDate: new Date(),
            endDate: new Date(),
            status: "",
        },
    })

    //fetch all required data to use in dropdown
    const { advertisersList } = useAdvertisersQuery();
    const { postListData, isLoading: postLoading } = usePostListQuery();

    const statusOptions = [
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active"},
        { value: "pending", label: "Pending" },
        { value: "paused", label: "Paused"},
        { value: "completed", label: "Completed"},
        { value: "rejected", label: "Rejected"},
    ];

    const onSubmit = async (values: Values) => {


        if (mode === "add") {
            if (!values.advertiserId) {
                form.setError("advertiserId", {
                    message: "Advertiser ID is required",
                })
                return
            }
            if (!values.postId) {
                form.setError("postId", {
                    message: "Post ID is required",
                })
                return
            }
            // Create new admin user
            // await createPostCommand(values);
            console.log("add submit values", values)
            form.reset();
            onSuccess?.()

        } else {
            if (!values.advertiserId) {
                form.setError("advertiserId", {
                    message: "Advertiser ID is required",
                })
                return
            }
            if (!values.postId) {
                form.setError("postId", {
                    message: "Post ID is required",
                })
                return
            }
            // await updatePostCommand({ id: defaultValues.id, data: formData });
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
                    name="advertiserId"
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
                    name="postId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Post</FormLabel>
                            <FormControl>
                                <Select
                                    value={String(field.value || "")}
                                    onValueChange={(val) => field.onChange(String(val))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Advertiser" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {postListData
                                            ?.map((ad: PostResponse) => (
                                                <SelectItem key={ad.id} value={String(ad.id)}>
                                                    {ad.title}
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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter name" {...field}
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
                    name="objective"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Objective</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter objective" {...field}
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
                    name="dailyBudget"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Daily Budget</FormLabel>
                            <FormControl>
                                <Input type="number"
                                    {...field}
                                    value={field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="totalBudget"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Budget</FormLabel>
                            <FormControl>
                                <Input type="number"
                                    {...field}
                                    value={field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="spentAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Spent Amount</FormLabel>
                            <FormControl>
                                <Input type="number"
                                    {...field}
                                    value={field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date To</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
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

                <Button type="submit" className="w-full" >
                    {/* {(createPending || updatePending) && <Spinner />} */}
                    {mode === "add" ? "Add Campaign" : "Update Campaign"}
                </Button>
            </form>
        </Form>
    )
}
