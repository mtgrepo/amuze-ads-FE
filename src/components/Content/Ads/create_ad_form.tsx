import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Calendar } from "../../ui/calendar"
import ImageUpload from "../../Common/image_upload"
import { Spinner } from "../../ui/spinner"
import { useAdvertisersQuery } from "../../../Composable/Query/advertiser/useAdvertisersQuery"
import { useCreateFullCampaignCommand } from "../../../Composable/Command/content/campaign/useCreateFullCampaignCommand"
import type { AdvertisersResponse } from "../../../dto/response/advertisers/advertisersResponse"
import { cn } from "../../../lib/utils"

const formSchema = z.object({
    advertiserId: z.string().min(1, { message: "Advertiser is required." }),
    name: z.string().min(1, { message: "Campaign name is required." }),
    objective: z.string().min(1, { message: "Objective is required." }),
    dailyBudget: z.number().min(1, { message: "Daily budget is required." }),
    totalBudget: z.number().min(1, { message: "Total budget is required." }),
    startDate: z.date({ message: "Start date is required." }),
    paymentMethod: z.string().min(1, { message: "Payment method is required." }),
    creativeName: z.string().min(1, { message: "Creative name is required." }),
    assetType: z.string().min(1, { message: "Asset type is required." }),
    destinationLink: z.string().min(1, { message: "Destination link is required." }),
    asset: z.any().refine((v) => v instanceof File, { message: "An image or video is required." }),
    ageMin: z.number().min(1, { message: "Age min is required." }),
    ageMax: z.number().min(1, { message: "Age max is required." }),
    gender: z.string().min(1, { message: "Gender is required." }),
    location: z.string().min(1, { message: "Location is required." }),
    category: z.string().min(1, { message: "Category is required." }),
    adType: z.string().min(1, { message: "Ad type is required." }),
    placementKey: z.string().min(1, { message: "Placement is required." }),
})

type Values = z.infer<typeof formSchema>;

export default function CreateAdForm({ onSuccess }: { onSuccess?: () => void }) {
    const form = useForm<Values>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            advertiserId: "",
            name: "",
            objective: "",
            dailyBudget: 1,
            totalBudget: 1,
            startDate: undefined,
            paymentMethod: "",
            creativeName: "",
            assetType: "",
            destinationLink: "",
            asset: undefined,
            ageMin: 1,
            ageMax: 1,
            gender: "",
            location: "",
            category: "",
            adType: "",
            placementKey: "",
        },
    })

    const { advertisersList } = useAdvertisersQuery();
    const { createFullCampaignCommand, isPending } = useCreateFullCampaignCommand();

    const onSubmit = async (values: Values) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            if (value instanceof File) {
                formData.append(key, value);
            } else if (value instanceof Date) {
                const year = value.getFullYear();
                const month = String(value.getMonth() + 1).padStart(2, "0");
                const day = String(value.getDate()).padStart(2, "0");
                formData.append(key, `${year}-${month}-${day}`);
            } else {
                formData.append(key, String(value));
            }
        });

        await createFullCampaignCommand(formData);
        form.reset();
        onSuccess?.();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Create Ad</h1>
                    <p className="text-muted-foreground mt-1">
                        Set up the campaign, creative, and targeting in one step. It goes live as soon as you submit.
                    </p>
                </div>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Advertiser</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="advertiserId"
                            render={({ field }) => (
                                <FormItem className="max-w-sm">
                                    <FormLabel>Advertiser</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Advertiser" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {advertisersList?.map((a: AdvertisersResponse) => (
                                                    <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Campaign</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Campaign Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="objective" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Objective</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Select objective" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="reach">Reach</SelectItem>
                                            <SelectItem value="traffic">Traffic</SelectItem>
                                            <SelectItem value="engagement">Engagement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="dailyBudget" render={({ field }) => (
                            <FormItem><FormLabel>Daily Budget</FormLabel><FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="totalBudget" render={({ field }) => (
                            <FormItem><FormLabel>Total Budget</FormLabel><FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="startDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            captionLayout="dropdown"
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                            <FormItem><FormLabel>Payment Method</FormLabel><FormControl><Input {...field} placeholder="manual, kbzpay, wave..." /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Creative</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <FormField control={form.control} name="creativeName" render={({ field }) => (
                                <FormItem><FormLabel>Creative Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="assetType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asset Type</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full"><SelectValue placeholder="Select asset type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="image">Image</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="destinationLink" render={({ field }) => (
                                <FormItem><FormLabel>Destination Link</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField name="asset" render={({ field }) => (
                            <ImageUpload value={field.value} onChange={field.onChange} label="Creative Asset" accept="image/*,video/*" size="large" />
                        )} />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Targeting</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <FormField control={form.control} name="ageMin" render={({ field }) => (
                            <FormItem><FormLabel>Age Min</FormLabel><FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="ageMax" render={({ field }) => (
                            <FormItem><FormLabel>Age Max</FormLabel><FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="all">All</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Ad Type &amp; Placement</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <FormField control={form.control} name="adType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ad Type</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Select ad type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="banner">Banner</SelectItem>
                                            <SelectItem value="interstitial">Interstitial</SelectItem>
                                            <SelectItem value="reward_video">Reward Video</SelectItem>
                                            <SelectItem value="native">Native</SelectItem>
                                            <SelectItem value="splash">Splash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="placementKey" render={({ field }) => (
                            <FormItem><FormLabel>Placement</FormLabel><FormControl><Input {...field} placeholder="home_page, comic, novel..." /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isPending}>
                        {isPending && <Spinner />}
                        Create Ad
                    </Button>
                </div>
            </form>
        </Form>
    )
}
