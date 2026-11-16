import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { safeString, usePreventScriptTag } from "@/lib/scriptTag";

const MAX = 500;

const formSchema = z.object({
    reason: safeString(z.string().trim().min(1, { message: "Give a reason for rejecting." }).max(MAX, { message: `Keep it to ${MAX} characters.` })),
});

interface RejectReasonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: React.ReactNode;
    pending?: boolean;
    /** Label for the confirm button; "Reject" by default. */
    confirmLabel?: string;
    /** Called with the trimmed reason. Throw to keep the dialog open (the command already shows why). */
    onConfirm: (reason: string) => Promise<unknown>;
}

/** Every reject asks why. The reason goes to the advertiser and into the ad's history. */
export function RejectReasonDialog({ open, onOpenChange, title, description, pending, confirmLabel = "Reject", onConfirm }: RejectReasonDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { reason: "" },
    });
    usePreventScriptTag(form);

    // Start empty each time it opens.
    useEffect(() => {
        if (open) form.reset({ reason: "" });
    }, [open, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await onConfirm(values.reason.trim());
            onOpenChange(false);
        } catch {
            // The command already shows why; keep the dialog open so it can be retried.
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form id="reject-reason-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[13px] font-medium">Reason</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} maxLength={MAX} autoFocus {...field} />
                                    </FormControl>
                                    <div className="flex justify-between gap-3">
                                        <FormDescription className="text-xs">Sent to the advertiser and kept in the ad's history.</FormDescription>
                                        <span className="font-mono text-xs tabular-nums text-muted-foreground">{field.value.length}/{MAX}</span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" variant="destructive" disabled={pending}>{pending ? "Rejecting..." : confirmLabel}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
