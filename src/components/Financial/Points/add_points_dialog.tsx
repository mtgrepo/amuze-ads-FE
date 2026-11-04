import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { usePreventScriptTag } from "@/lib/scriptTag";
import { topUpSchema } from "../../Points/top_up_schema";
import { useTopUpPointsCommand } from "../../../Composable/Command/points/useTopUpPointsCommand";

const AMOUNTS = [50_000, 100_000, 250_000];

type Values = z.infer<typeof topUpSchema>;

/** Admin adds points to one wallet: pick an amount, say whether it was paid or a bonus, and why. */
export function AddPointsDialog({ wallet, onClose }: { wallet: { id: string; name: string }; onClose: () => void }) {
    const { topUpPointsCommand, isPending } = useTopUpPointsCommand();
    const form = useForm<Values>({
        resolver: zodResolver(topUpSchema),
        defaultValues: { amount: 100_000, type: "paid", note: "" },
    });
    usePreventScriptTag(form);
    const amount = useWatch({ control: form.control, name: "amount" });

    async function onSubmit(values: Values) {
        try {
            await topUpPointsCommand({ accountId: wallet.id, data: values });
            onClose();
        } catch {
            // The command already shows why.
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="gap-4 rounded-2xl p-[22px] sm:max-w-[420px]">
                <DialogTitle className="text-lg font-semibold">Add points to {wallet.name}</DialogTitle>
                <DialogDescription className="sr-only">Choose how many points to add. 1 point = 1 MMK.</DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div role="group" aria-label="Amount" className="grid grid-cols-3 gap-2">
                            {AMOUNTS.map((v) => {
                                const on = v === amount;
                                return (
                                    <button
                                        key={v}
                                        type="button"
                                        aria-pressed={on}
                                        onClick={() => form.setValue("amount", v, { shouldValidate: true })}
                                        className={cn(
                                            "h-11 rounded-[10px] border border-input bg-card font-mono text-sm font-medium",
                                            on && "border-primary bg-primary/5 ring-1 ring-primary"
                                        )}
                                    >
                                        {v / 1000}K
                                    </button>
                                );
                            })}
                        </div>
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[13px]">Or another amount (1 point = 1 MMK)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} className="h-10 font-mono tabular-nums" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[13px]">Type</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="paid">Paid (customer paid offline)</SelectItem>
                                                <SelectItem value="bonus">Bonus (promotional, free)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[13px]">Note</FormLabel>
                                    <FormControl>
                                        <Textarea rows={2} placeholder="e.g. Cash received at office, invoice #123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2.5">
                            <Button type="button" variant="outline" className="bg-card" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={isPending}>{isPending && <Spinner />}Add points</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
