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
import { useAdvertisersQuery } from "../../Composable/Query/advertiser/useAdvertisersQuery"
import { useAdvertiserProfileCreateCommand } from "../../Composable/Command/advertiser-profile/useAdvertiserProfileCreateCommand"
import { useAdvertiserProfileUpdateCommand } from "../../Composable/Command/advertiser-profile/useAdvertiserProfileUpdateCommand"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse"
import { Textarea } from "../ui/textarea"
import ImageUpload from "../Common/image_upload"
import { Spinner } from "../ui/spinner"

// Validation schema
const formSchema = z.object({
    advertiser_id: z.string().min(1, {
        message: "Advertiser is required.",
    }),
    business_name: z.string().min(2),
    business_no: z.string().min(2),
    business_type: z.string().min(2),
    dica_number: z.string().min(2),
    website: z.string().optional(),
    address: z.string().min(3),
    photo: z.any().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
})

interface PostProps {
    mode: "add" | "edit"
    defaultValues?: {
        id?: string
        advertiser_id: string
        business_name: string
        business_no: string
        business_type: string
        dica_number: string
        website: string
        address: string
        country: string
        timezone: string
        photo: string
    }
    onSuccess?: () => void
}
type Values = z.infer<typeof formSchema>;

export default function ProfileForm({
    mode,
    defaultValues,
    onSuccess,
}: PostProps) {


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues || {
            advertiser_id: "",
            business_name: "",
            business_no: "",
            business_type: "",
            dica_number: "",
            website: "",
            address: "",
            country: "",
            timezone: "",
            photo: "",
        },
    })

    //fetch all advertiser to use in dropdown
    const { advertisersList } = useAdvertisersQuery();

    const countries = ["United States", "United Kingdom", "Myanmar"];
    const timezones = ["UTC", "Asia/Yangon"];

    const { createAdvertiserProfileCommand, isPending: createPending } = useAdvertiserProfileCreateCommand();
    const { updateAdvertiserProfileCommand, isPending: updatePending } = useAdvertiserProfileUpdateCommand();

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
            await createAdvertiserProfileCommand(formData);
            form.reset();
            onSuccess?.()

        } else {
            if (!defaultValues?.id) {
                form.setError("advertiser_id", {
                    message: "Advertiser ID is required",
                })
                return
            }
            await updateAdvertiserProfileCommand({ id: defaultValues.id, data: formData });
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
                                    onValueChange={(val: any) => field.onChange(String(val))}
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
                    name="business_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter business name"
                                    {...field}
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
                    name="business_no"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business No</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter business no"
                                    {...field}
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
                    name="business_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business Type</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter business type"
                                    {...field}
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
                    name="dica_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dica Nubmer</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter dica number"
                                    {...field}
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
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter website"
                                    {...field}
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
                <div className="grid grid-cols-2 gap-3">
                    <SelectField name="country" label="Country" options={countries} />
                    <SelectField name="timezone" label="Timezone" options={timezones} />
                </div>
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value}
                                    onChange={(e: any) => field.onChange(e.target.value)}
                                    placeholder="Enter address...."
                                />
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
                    {mode === "add" ? "Add Profile" : "Update Profile"}
                </Button>
            </form>
        </Form>
    )
}

function SelectField({ name, label, options, disabled }: any) {
    return (
        <FormField
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Select disabled={disabled} onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={`Select ${label}`} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((o: string) => (
                                <SelectItem key={o} value={o}>
                                    {o}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    );
}
