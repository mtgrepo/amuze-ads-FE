"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { BriefcaseBusiness, EditIcon } from "lucide-react";
import ImageUpload from "../Common/image_upload";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { useAdvertiserProfileUpdateCommand } from "../../Composable/Command/advertiser-profile/useAdvertiserProfileUpdateCommand";
import { Spinner } from "../ui/spinner";
import type { AdvertiserDetailsResponse } from "../../dto/response/advertisers/advertiserDetailsResponse";
import { useAdvertiserProfileCreateCommand } from "../../Composable/Command/advertiser-profile/useAdvertiserProfileCreateCommand";

const schema = z.object({
    business_name: z.string().min(2),
    business_no: z.string().min(2),
    business_type: z.string().min(2),
    dica_number: z.string().min(2),
    website: z.string().optional(),
    address: z.string().min(3),
    photo: z.any().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
});

type Values = z.infer<typeof schema>;

interface Props {
    profile?: AdvertiserDetailsResponse; // undefined for "Add" mode
    advertiser_id?: string;
}

export default function BusinessForm({ profile, advertiser_id }: Props) {
    const [editing, setEditing] = useState(false);
    const form = useForm<Values>({
        resolver: zodResolver(schema),
    });

    const { updateAdvertiserProfileCommand, isPending } = useAdvertiserProfileUpdateCommand();
    const { createAdvertiserProfileCommand, isPending: isCreating } = useAdvertiserProfileCreateCommand();
    // Reset form values when profile changes
    useEffect(() => {
        form.reset({
            business_name: profile?.business_name ?? "",
            business_no: profile?.business_no ?? "",
            business_type: profile?.business_type ?? "",
            dica_number: profile?.dica_number ?? "",
            website: profile?.website ?? "",
            address: profile?.address ?? "",
            photo: profile?.photo ?? "",
            country: profile?.country ?? "",
            timezone: profile?.timezone ?? "",
        });
    }, [profile, form]);

    const disabled = !editing;

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

        if (profile?.id) {
            formData.append("advertiser_id", profile.advertiser_id);
            await updateAdvertiserProfileCommand({ id: profile.id, data: formData });
        } else {
            formData.append("advertiser_id", advertiser_id!);
            await createAdvertiserProfileCommand(formData);
        }

        form.reset();
        setEditing(false);
    };

    const countries = ["United States", "United Kingdom", "Myanmar"];
    const timezones = ["UTC", "Asia/Yangon"];

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex justify-between">
                <CardTitle className="flex flex-row gap-3 items-center justify-center text-center text-xl">
                    <BriefcaseBusiness size={24} className="text-primary font-bold" /> Business Information
                </CardTitle>
                {!editing && <Button type="button" size="sm" variant="outline" onClick={() => setEditing(!editing)}>
                    <EditIcon size={16} /> {profile ? "Edit" : "Add"}
                </Button>}
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-[7fr_3fr] gap-6">
                            <div className="grid grid-cols-2 gap-4 border border-dashed rounded-xl px-4 py-5">
                                <Field name="business_name" label="Business Name" disabled={disabled} />
                                <Field name="business_no" label="Business No" disabled={disabled} />
                                <Field name="business_type" label="Business Type" disabled={disabled} />
                                <Field name="dica_number" label="Dica No" disabled={disabled} />
                                <Field name="website" label="Website" disabled={disabled} />
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField name="country" label="Country" options={countries} disabled={disabled} />
                                    <SelectField name="timezone" label="Timezone" options={timezones} disabled={disabled} />
                                </div>
                                <TextareaField name="address" label="Address" disabled={disabled} />
                            </div>

                            <div className="space-y-4 border border-dashed rounded-xl p-4">
                                <FormField
                                    name="photo"
                                    render={({ field }) => (
                                        <ImageUpload value={field.value} onChange={field.onChange} label="Business Photo" />
                                    )}
                                />
                            </div>
                        </div>

                        {editing && (
                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending || isCreating}>
                                    {(isPending || isCreating) && <Spinner />}
                                    {isPending ? "Updating..." : profile ? "Update" : "Add"}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function Field({ name, label, disabled }: any) {
    return (
        <FormField
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input {...field} disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function TextareaField({ name, label, disabled }: any) {
    return (
        <FormField
            name={name}
            render={({ field }) => (
                <FormItem className="col-span-2">
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Textarea {...field} disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
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
