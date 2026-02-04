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

const schema = z.object({
    businessName: z.string().min(2),
    businessNo: z.string().min(2),
    businessType: z.string().min(2),
    dicaNo: z.string().min(2),
    website: z.string().optional(),
    address: z.string().min(3),
    businessPhoto: z.any().optional(),
});

type Values = z.infer<typeof schema>;

export default function BusinessForm({ profile }: any) {
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const form = useForm<Values>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        form.reset({
            businessName: profile?.business_name ?? "",
            businessNo: profile?.business_no ?? "",
            businessType: profile?.business_type ?? "",
            dicaNo: profile?.Dica_number ?? "",
            website: profile?.website ?? "",
            address: profile?.address ?? "",
        });
    }, [profile, form]);

    const disabled = !editing;

    const onSubmit = (values: Values) => {
        setLoading(true);
        console.log("contact update", values);
        setEditing(false);
        setLoading(false)
    };

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex justify-between">
                <CardTitle className="flex flex-row gap-3 items-center justify-center text-center text-xl"><BriefcaseBusiness size={24} className="text-primary font-bold"/> Business Information</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing(!editing)}>
                    <EditIcon size={16} /> Edit
                </Button>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid md:grid-cols-[7fr_3fr] gap-6">
                            <div className="grid grid-cols-2 gap-4 border border-dashed rounded-xl px-4 py-5">
                                <Field name="businessName" label="Business Name" disabled={disabled} />
                                <Field name="businessNo" label="Business No" disabled={disabled} />
                                <Field name="businessType" label="Business Type" disabled={disabled} />
                                <Field name="dicaNo" label="Dica No" disabled={disabled} />
                                <TextareaField name="address" label="Address" disabled={disabled} />
                                <Field name="website" label="Website" disabled={disabled} />
                            </div>
                            <div className="space-y-4 border border-dashed rounded-xl p-4">
                                <FormField
                                    name="businessPhoto"
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
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Updating..." : "Update"}
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
        <FormField name={name}
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
        <FormField name={name}
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
