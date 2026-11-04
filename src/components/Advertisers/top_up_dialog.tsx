import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePreventScriptTag } from "@/lib/scriptTag";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { useTopUpPointsCommand } from "../../Composable/Command/points/useTopUpPointsCommand";
import { useWalletQuery } from "../../Composable/Query/points/useWalletQuery";
import { pts } from "./advertiser_utils";

// Same rules as the points top-up form.
const formSchema = z.object({
    amount: z.number().int().min(1, { message: "Amount must be at least 1." }),
    type: z.enum(["paid", "bonus"]),
    note: z.string().min(1, { message: "Note is required." }),
});
type Values = z.infer<typeof formSchema>;

const AMOUNTS = [50_000, 100_000, 250_000];
const TYPES: { value: Values["type"]; label: string; desc: string }[] = [
    { value: "paid", label: "Paid", desc: "Customer paid offline" },
    { value: "bonus", label: "Bonus", desc: "Promotional, free" },
];

const pick = (on: boolean) => cn(
    "h-11 rounded-[10px] border border-input bg-card font-mono text-sm font-medium",
    on && "border-primary bg-primary/5 ring-1 ring-primary",
);

interface Props {
    accountId: string;
    name: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** Admin adds points to a wallet: quick amounts, paid or bonus, and a note for the ledger. */
export function TopUpDialog({ accountId, name, open, onOpenChange }: Props) {
    const { wallet } = useWalletQuery(accountId, open);
    const { topUpPointsCommand, isPending } = useTopUpPointsCommand();
    const form = useForm<Values>({
        resolver: zodResolver(formSchema),
        defaultValues: { amount: 100_000, type: "paid", note: "" },
    });
    usePreventScriptTag(form);

    const amount = useWatch({ control: form.control, name: "amount" }) || 0;
    const type = useWatch({ control: form.control, name: "type" });
    const balance = Number(wallet?.balance ?? 0);

    const close = (next: boolean) => {
        if (!next) form.reset();
        onOpenChange(next);
    };

    async function onSubmit(values: Values) {
        try {
            await topUpPointsCommand({ accountId, data: values });
            toast.success(`${pts(values.amount)} added`, { description: `New balance ${pts(balance + values.amount)}. Recorded in Transactions.` });
            close(false);
        } catch {
            // The command already shows the reason.
        }
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="flex w-[min(440px,100%)] flex-col gap-4 rounded-2xl bg-card p-[22px] sm:max-w-[440px]">
                <div className="flex flex-col gap-1 pr-6">
                    <DialogTitle className="text-lg font-semibold">Add points to {name}</DialogTitle>
                    <DialogDescription className="text-[13px]">Recorded in their transactions as a top-up by you.</DialogDescription>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem className="gap-2">
                                    <div role="group" aria-label="Amount" className="grid grid-cols-3 gap-2">
                                        {AMOUNTS.map((v) => (
                                            <button key={v} type="button" aria-pressed={field.value === v} className={pick(field.value === v)} onClick={() => field.onChange(v)}>
                                                {v / 1000}K
                                            </button>
                                        ))}
                                    </div>
                                    <FormControl>
                                        <Input type="number" min={1} aria-label="Other amount" placeholder="Other amount"
                                            value={AMOUNTS.includes(field.value) ? "" : field.value || ""}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            className="h-10 font-mono" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div role="radiogroup" aria-label="Kind of top-up" className="grid grid-cols-2 gap-2">
                            {TYPES.map((t) => (
                                <button key={t.value} type="button" role="radio" aria-checked={type === t.value}
                                    onClick={() => form.setValue("type", t.value)}
                                    className={cn("flex flex-col items-start gap-0.5 rounded-[10px] border border-input bg-card p-3 text-left text-xs text-foreground/80", type === t.value && "border-primary bg-primary/5 ring-1 ring-primary")}>
                                    <span className="text-[13px] font-semibold text-foreground">{t.label}</span>{t.desc}
                                </button>
                            ))}
                        </div>
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem className="gap-1.5">
                                    <FormLabel className="text-[13px]">Note</FormLabel>
                                    <FormControl><Input placeholder="e.g. Bank transfer ref 4471" className="h-10" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-between rounded-[10px] bg-background px-3.5 py-3">
                            <span className="text-[13px] text-muted-foreground">New balance</span>
                            <span className="font-mono font-medium tabular-nums">{pts(balance + amount)}</span>
                        </div>
                        <div className="flex justify-end gap-2.5">
                            <Button type="button" variant="outline" className="bg-card" onClick={() => close(false)}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>{isPending && <Spinner />}Add {pts(amount)}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
