import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { safeString, usePreventScriptTag } from "@/lib/scriptTag";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";
import { Spinner } from "../ui/spinner";
import { useAdvertiserCreateCommand } from "../../Composable/Command/advertiser/useAdvertiserCreateCommand";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";

// Same rules as before; "client" is an advertiser that belongs to an agency.
const formSchema = z.object({
    kind: z.enum(["advertiser", "agency", "client"]),
    agencyId: z.string(),
    name: z.string().min(1, { message: "Name is required." }),
    email: z.union([z.email({ message: "Enter an email like name@business.com." }), z.literal("")]),
    phone: safeString(z.string()),
    password: safeString(z.string()).optional(),
    verified: z.boolean(),
}).superRefine((v, ctx) => {
    if (v.kind === "client") {
        if (!v.agencyId) ctx.addIssue({ code: "custom", path: ["agencyId"], message: "Pick the agency that pays for this client." });
        return;
    }
    if (!v.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Email is required." });
    if (!v.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Phone is required." });
    if (!v.password) ctx.addIssue({ code: "custom", path: ["password"], message: "Password is required" });
    else if (v.password.length < 6) ctx.addIssue({ code: "custom", path: ["password"], message: "Password must be at least 6 characters." });
});
type Values = z.infer<typeof formSchema>;

const TYPES: { value: Values["kind"]; label: string; desc: string }[] = [
    { value: "advertiser", label: "Advertiser", desc: "Buys their own ads" },
    { value: "agency", label: "Agency", desc: "Buys for clients" },
    { value: "client", label: "Client", desc: "Of an agency" },
];

const EMPTY: Values = { kind: "advertiser", agencyId: "", name: "", email: "", phone: "", password: "", verified: true };

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    advertisers: AdvertisersResponse[];
}

export function AddAdvertiserSheet({ open, onOpenChange, advertisers }: Props) {
    const agencies = advertisers.filter((a) => a.type === "agency");
    const { createAdvertiserCommand, isPending } = useAdvertiserCreateCommand();
    const form = useForm<Values>({ resolver: zodResolver(formSchema), defaultValues: EMPTY });
    usePreventScriptTag(form);
    const kind = useWatch({ control: form.control, name: "kind" });
    const isClient = kind === "client";

    const close = (next: boolean) => {
        if (!next) form.reset(EMPTY);
        onOpenChange(next);
    };

    async function onSubmit(v: Values) {
        try {
            await createAdvertiserCommand({
                name: v.name,
                type: v.kind === "agency" ? "agency" : "advertiser",
                ...(isClient && { agencyId: v.agencyId }),
                ...(!isClient && v.email && { email: v.email }),
                ...(!isClient && v.phone && { phone: v.phone }),
                status: "active",
                verified: v.verified,
                ...(!isClient && { password: v.password }),
            });
            toast.success(v.kind === "agency" ? "Agency added" : "Advertiser added", {
                description: isClient ? "You can create ads for them now. Their agency pays." : "They can sign in with the temporary password you set.",
            });
            close(false);
        } catch (err) {
            toast.error("Couldn't add advertiser", { description: err instanceof Error ? err.message : undefined });
        }
    }

    return (
        <Sheet open={open} onOpenChange={close}>
            <SheetContent side="right" showCloseButton={false} className="flex w-full flex-col gap-0 bg-card p-0 sm:max-w-[460px]">
                <div className="flex items-start gap-3 border-b px-[22px] py-5">
                    <div className="flex flex-1 flex-col gap-1">
                        <SheetTitle className="text-[19px] font-semibold">Add advertiser</SheetTitle>
                        <SheetDescription className="text-xs">They can sign in once added, unless they are an agency's client.</SheetDescription>
                    </div>
                    <Button variant="outline" size="icon" className="size-9 bg-card" aria-label="Close" onClick={() => close(false)}>✕</Button>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px]">
                            <div className="flex flex-col gap-1.5">
                                <span id="type-label" className="text-[13px] font-medium">Account type</span>
                                <div role="radiogroup" aria-labelledby="type-label" className="grid grid-cols-3 gap-2">
                                    {TYPES.map((t) => (
                                        <button key={t.value} type="button" role="radio" aria-checked={kind === t.value}
                                            onClick={() => { form.setValue("kind", t.value); form.clearErrors(); }}
                                            className={cn("flex flex-col items-start gap-0.5 rounded-[10px] border border-input bg-card p-3 text-left text-xs text-foreground/80", kind === t.value && "border-primary bg-primary/5 ring-1 ring-primary")}>
                                            <span className="text-[13px] font-semibold text-foreground">{t.label}</span>{t.desc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isClient && (
                                <FormField control={form.control} name="agencyId" render={({ field }) => (
                                    <FormItem className="gap-1.5">
                                        <FormLabel className="text-[13px]">Agency</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl><SelectTrigger className="h-10 w-full"><SelectValue placeholder={agencies.length ? "Pick an agency" : "No agencies yet"} /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {agencies.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <span className="text-xs text-muted-foreground">The agency pays for this client's ads. Clients don't sign in.</span>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )} />
                            )}

                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem className="gap-1.5">
                                    <FormLabel className="text-[13px]">Name</FormLabel>
                                    <FormControl><Input className="h-10" placeholder="Business or person name" {...field} /></FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )} />

                            {!isClient && (
                                <>
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem className="min-w-0 gap-1.5">
                                                <FormLabel className="text-[13px]">Email</FormLabel>
                                                <FormControl><Input className="h-10" type="email" placeholder="name@business.com" {...field} /></FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="phone" render={({ field }) => (
                                            <FormItem className="min-w-0 gap-1.5">
                                                <FormLabel className="text-[13px]">Phone</FormLabel>
                                                <FormControl><Input className="h-10" type="tel" placeholder="09 …" {...field} /></FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem className="gap-1.5">
                                            <FormLabel className="text-[13px]">Temporary password</FormLabel>
                                            <FormControl><Input className="h-10" type="text" autoComplete="new-password" placeholder="At least 6 characters" {...field} /></FormControl>
                                            <span className="text-xs text-muted-foreground">Share it with them; they can change it after signing in.</span>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )} />
                                </>
                            )}

                            <FormField control={form.control} name="verified" render={({ field }) => (
                                <label className="flex items-center gap-2.5 text-[13px]">
                                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} /> Mark as verified now
                                </label>
                            )} />
                        </div>
                        <div className="flex justify-end gap-2.5 border-t px-[22px] py-3.5">
                            <Button type="button" variant="outline" className="bg-card" onClick={() => close(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>{isPending && <Spinner />}Add advertiser</Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
