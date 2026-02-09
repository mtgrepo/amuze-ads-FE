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

import { useCampaignListQuery } from "../../../Composable/Query/content/useCampaignListQuery"
import { Textarea } from "../../ui/textarea"

// Validation schema
const formSchema = z.object({
    campaignId: z.string().min(1, {
        message: "Camapign is required.",
    }),
    ageMin: z.number().min(1, {
        message: "Age is required.",
    }),
    ageMax: z.number().min(1, {
        message: "Age is required.",
    }),
    gender: z.string().min(1, {
        message: "Gender is required.",
    }),
    location: z.string().min(1, {
        message: "Location is required.",
    }),
    category: z.string().min(1, {
        message: "Category is required.",
    }),

})

interface AdSetProps {
    mode: "add" | "edit"
    defaultValues?: {
        id?: string
        campaignId: string
        ageMin: number
        ageMax: number
        gender: string
        location: string
        category: string
    }
    onSuccess?: () => void
}
type Values = z.infer<typeof formSchema>;

export default function AdSetForm({
    mode,
    defaultValues,
    onSuccess,
}: AdSetProps) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues || {
            campaignId: "",
            ageMin: 1,
            ageMax: 1,
            gender: "",
            location: "",
            category: "",
        },
    })

    //fetch all campaign to use in dropdown
    const { campaignList } = useCampaignListQuery();

    const onSubmit = async (values: Values) => {
        alert("enter on submit")
        if (mode === "add") {
            if (!values.campaignId) {
                form.setError("campaignId", {
                    message: "Advertiser ID is required",
                })
                return
            }

            // Create new admin user
            // await createPostCommand(values);
            console.log("add submit values", values)
            form.reset();
            onSuccess?.()

        } else {
            if (!values.campaignId) {
                form.setError("campaignId", {
                    message: "Advertiser ID is required",
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
                    name="campaignId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Campaign</FormLabel>
                            <FormControl>
                                <Select
                                    value={String(field.value || "")}
                                    onValueChange={(val) => field.onChange(String(val))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Advertiser" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {campaignList
                                            ?.map((ad: any) => (
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
                    name="ageMin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Age Min</FormLabel>
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
                    name="ageMax"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Age Max</FormLabel>
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
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            value="male"
                                            checked={field.value === "male"}
                                            onChange={() => field.onChange("male")}
                                            className="form-radio"
                                        />
                                        <span>Male</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            value="female"
                                            checked={field.value === "female"}
                                            onChange={() => field.onChange("female")}
                                            className="form-radio"
                                        />
                                        <span>Female</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            value="all"
                                            checked={field.value === "all"}
                                            onChange={() => field.onChange("all")}
                                            className="form-radio"
                                        />
                                        <span>All</span>
                                    </label>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <Select
                                    value={String(field.value || "")}
                                    onValueChange={(val) => field.onChange(String(val))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tech">Tech</SelectItem>
                                        <SelectItem value="Cosmetic">Cosmetic</SelectItem>
                                        <SelectItem value="fashion">Fashion</SelectItem>
                                        <SelectItem value="food">Food</SelectItem>
                                        <SelectItem value="sports">Sports</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
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

                <Button type="submit" className="w-full" >
                    {/* {(createPending || updatePending) && <Spinner />} */}
                    {mode === "add" ? "Add Post" : "Update Post"}
                </Button>
            </form>
        </Form>
    )
}
