"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { EditIcon, BadgeCheck, SettingsIcon, XCircle } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

import { IconBriefcaseFilled, IconInfoCircleFilled } from "@tabler/icons-react";

import type { AdvertisersResponse } from "../../dto/response/Advertisers/advertisersResponse";
import { Separator } from "../ui/separator";
import ImageUpload from "../Common/image_upload";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const schema = z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email(),
    phone: z.string().min(5),
    address: z.string().min(3),
    businessName: z.string().min(2),
    businessNo: z.string().min(2),
    businessType: z.string().min(2),
    dicaNo: z.string().min(2),
    website: z.string().optional(),
    country: z.string().min(1, "Country required"),
    timezone: z.string().min(1, "Timezone required"),
    status: z.enum(["active", "inactive"]),
    verified: z.boolean(),
    businessPhoto: z.any().optional(),
});

type FormValues = z.infer<typeof schema>;

const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Singapore",
    "India",
    "Germany",
    "France",
    "Japan",
    "Myanmar",
];

const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Asia/Kolkata",
    "Asia/Yangon",
];

interface Props {
    data: AdvertisersResponse;
}

export default function AdvertiserDetails({ data }: Props) {
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            businessName: "",
            businessNo: "",
            businessType: "",
            dicaNo: "",
            website: "",
            country: "",
            timezone: "",
            status: "active",
            verified: false,
            businessPhoto: undefined,
        },
    });
    // Convert createdAt to a readable date
    const joinedDate = data?.createdAt!
        ? new Date(data.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "-";

    /* RESET FORM FROM API DATA */
    useEffect(() => {
        if (!data) return;

        const profile = data.profiles?.[0];

        form.reset({
            name: data?.name ?? "",
            email: data?.email ?? "",
            phone: data?.phone ?? "",
            address: profile?.address ?? "",
            businessName: profile?.business_name ?? "",
            businessNo: profile?.business_no ?? "",
            businessType: profile?.business_type ?? "",
            dicaNo: profile?.Dica_number ?? "",
            website: profile?.website ?? "",
            country: profile?.country?.trim() ?? "",
            timezone: profile?.timezone?.trim() ?? "",
            status: (data?.status as "active" | "inactive") ?? "active",
            verified: data?.verified ?? false,
        });
    }, [data, form]);

    const disabled = !isEdit;

    /* SUBMIT */
    async function onSubmit(values: FormValues) {
        try {
            setLoading(true);
            console.log("submitted:", values);

            // API call goes here

            setIsEdit(false);
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        form.reset();
        setIsEdit(false);
    }

    if (!data) return <p>No data available</p>;

    /* RENDER */
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="max-w-7xl mx-auto p-8 space-y-6">

                    {/* HEADER */}
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-6">

                                {/* Profile Image */}
                                <Avatar className="w-32 h-32 border-4 border-slate-300 dark:border-slate-700 shadow-md">
                                    <AvatarImage src={data?.avatar!} alt={data?.name || "Driver"} />
                                    <AvatarFallback className="text-3xl font-bold">
                                        {data?.name?.slice(0, 2).toUpperCase() || "D"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-2">
                                    <div className="flex flex-row gap-3 items-center">
                                        <Tooltip>
                                            <TooltipTrigger asChild><p className="text-2xl font-bold flex items-center gap-1">
                                                {data.name}
                                                { data?.verified ? <BadgeCheck size={20} className="text-primary items-center justify-center font-semibold" /> : <XCircle size={20} className="text-destructive items-center justify-center font-semibold" /> }
                                            </p></TooltipTrigger>
                                            <TooltipContent align="center" side="right">
                                                <p>{data?.verified ? "Verified" : "Not Verified"}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>

                                    {/* <span className="font-semibold text-muted-foreground">ID: <span className="text-primary">{data?.id}</span></span> */}
                                    <span className="text-muted-foreground font-semibold">Joined Date: {joinedDate}</span>
                                </div>
                            </div>

                            {/* BUTTONS */}
                            {!isEdit ? (
                                <Button
                                    type="button"
                                    onClick={() => setIsEdit(true)}
                                >
                                    <EditIcon size={18} /> <span>Edit Profile</span>
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? "Updating..." : "Update"}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* LEFT COLUMN: Contact + Business (80%) */}
                        <div className="lg:w-8/12 flex flex-col gap-6">
                            {/* CONTACT */}
                            <InfoSection title="Contact Information" icon={<IconInfoCircleFilled size={24} className="text-primary font-bold" />}>
                                <Field name="name" label="Name" disabled={disabled} />
                                <Field name="email" label="Email" disabled={disabled} />
                                <Field name="phone" label="Phone" disabled={disabled} />
                                <SelectField name="country" label="Country" disabled={disabled} options={countries} />
                                <SelectField name="timezone" label="Timezone" disabled={disabled} options={timezones} />
                            </InfoSection>

                            {/* BUSINESS */}
                            <InfoSection title="Business Information" icon={<IconBriefcaseFilled size={24} className="text-primary font-bold" />}>
                                <Field name="businessName" label="Business Name" disabled={disabled} />
                                <Field name="businessNo" label="Business No" disabled={disabled} />
                                <Field name="businessType" label="Business Type" disabled={disabled} />
                                <Field name="dicaNo" label="Dica No" disabled={disabled} />
                                <Field name="address" label="Address" disabled={disabled} />
                                <Field name="website" label="Website" disabled={disabled} />
                            </InfoSection>

                        </div>

                        {/* RIGHT COLUMN: Account Settings (20%) */}
                        <div className="lg:w-4/12 flex flex-col gap-6">
                            <InfoSection
                                title="Account Status"
                                icon={<SettingsIcon size={24} className="text-primary font-bold" />}
                                singleColumn
                            >
                                {/* ACTIVE STATUS */}
                                <FormField
                                    name="status"
                                    render={({ field }) => {
                                        const active = field.value === "active";
                                        return (
                                            <FormItem className="flex items-center justify-between w-full">
                                                <FormLabel className="whitespace-nowrap">Active Status</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={active}
                                                        disabled={!isEdit || loading}
                                                        onCheckedChange={(v) =>
                                                            field.onChange(v ? "active" : "inactive")
                                                        }
                                                        className="data-[state=checked]:bg-green-600"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        );
                                    }}
                                />

                                {/* VERIFIED STATUS */}
                                <FormField
                                    name="verified"
                                    render={({ field }) => {
                                        const verified = field.value;
                                        return (
                                            <FormItem className="flex items-center justify-between w-full">
                                                <FormLabel className="whitespace-nowrap">Verified Status</FormLabel>
                                                <FormControl>
                                                    <Switch
                                                        checked={verified}
                                                        disabled={!isEdit || loading}
                                                        onCheckedChange={(v) => field.onChange(v)}
                                                        className="data-[state=checked]:bg-blue-600"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        );
                                    }}
                                />
                                <Separator />
                                <div className="flex flex-col gap-3 border-2 rounded-2xl px-4 py-2.5">
                                    <p className="text-sm text-muted-foreground font-bold">METADATA</p>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-sm text-muted-foreground">Created At: </span>
                                        <span className="text-muted-foreground">{joinedDate}</span>
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-sm text-muted-foreground">Last Login: </span>
                                        <span className="text-muted-foreground">{data?.last_login ?? "N/A"}</span>
                                    </div>
                                </div>
                            </InfoSection>

                            <InfoSection title="Business Docs" icon={<SettingsIcon size={24} className="text-primary font-bold" />} singleColumn>
                                <div className="grid grid-cols-1 gap-4 ">
                                    <FormField
                                        control={form.control}
                                        name="businessPhoto"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <ImageUpload
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        label=""
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </InfoSection>
                        </div>

                    </div>

                </div>
            </form>
        </Form>
    );
}


function InfoSection({ title, children, icon, singleColumn }: { title: string; children: React.ReactNode; icon?: React.ReactElement; singleColumn?: boolean }) {
    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
                <Button variant={'outline'}>Edit</Button>
            </CardHeader>
            <CardContent className={singleColumn ? "flex flex-col gap-5" : "grid md:grid-cols-2 gap-5"}>
                {children}
            </CardContent>
        </Card>
    );
}


function Field({ name, label, disabled }: { name: any; label: string; disabled: boolean }) {
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

function SelectField({ name, label, disabled, options }: { name: any; label: string; disabled: boolean; options: string[] }) {
    return (
        <FormField
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Select disabled={disabled} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={`Select ${label}`} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
