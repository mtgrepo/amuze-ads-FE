import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CircleX } from "lucide-react";
import { safeString, usePreventScriptTag } from "@/lib/scriptTag";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";
import { Spinner } from "../ui/spinner";
import { useAdvertiserUpdateCommand } from "../../Composable/Command/advertiser/useAdvertiserUpdateCommand";
import { useAdvertisersQuery } from "../../Composable/Query/advertiser/useAdvertisersQuery";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";
import { kindOf } from "./advertiser_utils";

// Same rules as before: agency clients don't sign in, so their email and phone are optional.
const makeSchema = (isClient: boolean) => z.object({
    name: z.string().min(1, { message: "Name is required." }),
    email: z.union([z.email({ message: "Enter an email like name@business.com." }), z.literal("")]),
    phone: safeString(z.string()),
}).superRefine((v, ctx) => {
    if (!isClient && !v.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Email is required." });
    if (!isClient && !v.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Phone is required." });
});
type Values = z.infer<ReturnType<typeof makeSchema>>;

interface Props {
    advertiser: AdvertisersResponse;
    onClose: () => void;
}

/** Edit name, email and phone. Mount it only while open, so it starts from the saved values. */
export function EditAdvertiserSheet({ advertiser, onClose }: Props) {
    const isClient = kindOf(advertiser) === "client";
    const { updateAdvertiserCommand, isPending } = useAdvertiserUpdateCommand();
    const { advertisersList } = useAdvertisersQuery();
    const [confirmDiscard, setConfirmDiscard] = useState(false);
    const form = useForm<Values>({
        resolver: zodResolver(makeSchema(isClient)),
        defaultValues: { name: advertiser.name, email: advertiser.email ?? "", phone: advertiser.phone ?? "" },
    });
    usePreventScriptTag(form);

    const errorCount = Object.keys(form.formState.errors).length;
    const tryClose = () => (form.formState.isDirty ? setConfirmDiscard(true) : onClose());

    async function onSubmit(v: Values) {
        const email = v.email.trim().toLowerCase();
        const taken = email && (advertisersList as AdvertisersResponse[] | undefined)?.some((a) => a.id !== advertiser.id && a.email?.toLowerCase() === email);
        if (taken) {
            form.setError("email", { message: "Another advertiser already uses this email." });
            return;
        }
        try {
            await updateAdvertiserCommand({
                id: advertiser.id,
                data: { name: v.name, email: v.email || undefined, phone: v.phone, status: advertiser.status, verified: advertiser.verified },
            });
            toast.success("Changes saved", { description: `${v.name}'s details are updated.` });
            onClose();
        } catch (err) {
            toast.error("Couldn't save", { description: err instanceof Error ? err.message : undefined });
        }
    }

    return (
        <Sheet open onOpenChange={(o) => { if (!o) tryClose(); }}>
            <SheetContent side="right" showCloseButton={false} className="flex w-full flex-col gap-0 bg-card p-0 sm:max-w-[460px]">
                <div className="flex items-start gap-3 border-b px-[22px] py-5">
                    <div className="flex flex-1 flex-col gap-1">
                        <SheetTitle className="text-[19px] font-semibold">Edit {advertiser.name}</SheetTitle>
                        <SheetDescription className="text-xs">Changes take effect as soon as you save.</SheetDescription>
                    </div>
                    <Button variant="outline" size="icon" className="size-9 bg-card" aria-label="Close" onClick={tryClose}>✕</Button>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} onChange={() => setConfirmDiscard(false)} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto p-[22px]">
                            {errorCount > 0 && (
                                <div role="alert" className="flex gap-2.5 rounded-[10px] bg-destructive-soft px-3.5 py-3 leading-snug text-destructive-soft-foreground">
                                    <CircleX className="mt-px size-[18px] shrink-0" aria-hidden="true" />
                                    <span>{errorCount === 1 ? "Fix the highlighted field to save." : `Fix the ${errorCount} highlighted fields to save.`}</span>
                                </div>
                            )}
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem className="gap-1.5">
                                    <FormLabel className="text-[13px]">Name</FormLabel>
                                    <FormControl><Input className="h-10" {...field} /></FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem className="gap-1.5">
                                    <FormLabel className="text-[13px]">{isClient ? "Email (optional)" : "Email"}</FormLabel>
                                    <FormControl><Input className="h-10" type="email" {...field} /></FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem className="gap-1.5">
                                    <FormLabel className="text-[13px]">{isClient ? "Phone (optional)" : "Phone"}</FormLabel>
                                    <FormControl><Input className="h-10" type="tel" {...field} /></FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )} />
                        </div>
                        {confirmDiscard && (
                            <div role="alert" className="mx-[22px] mb-3 flex flex-wrap items-center gap-2.5 rounded-[10px] bg-warning-soft px-3.5 py-3 text-warning-soft-foreground">
                                <span className="flex-[1_1_200px]">You have unsaved changes. Discard them?</span>
                                <Button type="button" variant="outline" size="sm" className="h-8 bg-card text-[13px]" onClick={() => setConfirmDiscard(false)}>Keep editing</Button>
                                <Button type="button" variant="outline" size="sm" className="h-8 bg-card text-[13px] text-destructive" onClick={onClose}>Discard</Button>
                            </div>
                        )}
                        <div className="flex justify-end gap-2.5 border-t px-[22px] py-3.5">
                            <Button type="button" variant="outline" className="bg-card" onClick={tryClose}>Cancel</Button>
                            <Button type="submit" disabled={isPending} className="min-w-[130px]">
                                {isPending && <Spinner />}{isPending ? "Saving…" : "Save changes"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
