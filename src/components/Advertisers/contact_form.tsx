"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Card, CardHeader, CardTitle, CardContent
} from "../ui/card";
import {
    Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import {Select, SelectTrigger, SelectContent, SelectItem, SelectValue} from "../ui/select";
import { EditIcon, InfoIcon } from "lucide-react";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { useAdvertiserUpdateCommand } from "../../Composable/Command/advertiser/useAdvertiserUpdateCommand";
import { Spinner } from "../ui/spinner";

const schema = z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email(),
    phone: z.string().min(5),
    country: z.string(),
    timezone: z.string(),
    status: z.enum(["active", "inactive"]),
    verified: z.boolean(),
});

type Values = z.infer<typeof schema>;

const countries = ["United States", "United Kingdom", "Myanmar"];
const timezones = ["UTC", "Asia/Yangon"];

export default function ContactForm({ data }: { data: AdvertisersResponse }) {
    const [editing, setEditing] = useState(false);
    const { updateAdvertiserCommand, isPending } = useAdvertiserUpdateCommand();
    const form = useForm<Values>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        const profile = data.profiles?.[0];

        form.reset({
            name: data.name,
            email: data.email,
            phone: data.phone, country: profile?.country ?? "",
            timezone: profile?.timezone ?? "",
            status: data.status as any,
            verified: data.verified,
        });
    }, [data, form]);

    const onSubmit = async (values: Values) => {
        if (!data?.id) {
            toast.error("Advertiser ID is missing.")
            return
        }
        await updateAdvertiserCommand({ id: data.id, data: values })
        form.reset();
        setEditing(false);
    };

    const disabled = !editing;

    const joinedDate = data?.createdAt!
        ? new Date(data.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "-";

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex justify-between items-center">
                <CardTitle className="flex flex-row gap-3 items-center justify-center text-center text-xl"><InfoIcon size={24} className="text-primary font-bold" /> Contact & Account Status</CardTitle>
                {!editing && 
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditing(!editing)}>
                    <EditIcon size={16} /> Edit
                </Button>
                }
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>

                        <div className="grid md:grid-cols-[7fr_3fr] gap-6">

                            {/* LEFT → 70% Contact fields */}
                            <div className="grid grid-cols-2 gap-4 border border-dashed rounded-xl px-4 py-5">
                                <Field name="name" label="Name" disabled={disabled} />
                                <Field name="email" label="Email" disabled={disabled} />
                                <Field name="phone" label="Phone" disabled={disabled} />
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField name="country" label="Country" options={countries} disabled={disabled} />
                                    <SelectField name="timezone" label="Timezone" options={timezones} disabled={disabled} />
                                </div>
                            </div>

                            {/* RIGHT → 30% Status panel */}
                            <div className="space-y-4 border border-dashed rounded-xl p-4">
                                <SwitchField name="status" label="Active" disabled={disabled} type="status" />
                                <SwitchField name="verified" label="Verified" disabled={disabled} type="boolean"/>
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
                            </div>

                        </div>

                        {editing && (
                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Spinner />}
                                    {isPending ? "Updating..." : "Update"}
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

function SelectField({ name, label, options, disabled }: any) {
    return (
        <FormField name={name}
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
                            {options.map((o: string) => (
                                <SelectItem key={o} value={o}>{o}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    );
}

function SwitchField({ name, label, disabled, type }: any) {
  return (
    <FormField
      name={name}
      render={({ field }) => {
        let checked: boolean;
        let onChange: (val: boolean) => void;

        if (type === "status") {
          // Convert "active"/"inactive" string to boolean
          checked = field.value === "active";
          onChange = (val: boolean) => field.onChange(val ? "active" : "inactive");
        } else {
          // For boolean fields like verified
          checked = !!field.value;
          onChange = field.onChange;
        }

        return (
          <FormItem className="grid grid-cols-2 gap-4 justify-between">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Switch
                checked={checked}
                disabled={disabled}
                onCheckedChange={onChange}
              />
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}

