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
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Spinner } from "../ui/spinner"
import { useTopUpPointsCommand } from "../../Composable/Command/points/useTopUpPointsCommand"

const formSchema = z.object({
    amount: z.number().int().min(1, { message: "Amount must be at least 1." }),
    type: z.enum(["paid", "bonus"]),
    note: z.string().min(1, { message: "Note is required." }),
})

type Values = z.infer<typeof formSchema>

interface TopUpFormProps {
    accountId: string
    onSuccess?: () => void
}

// Admin adds points: "paid" = customer paid offline (revenue), "bonus" = promotional (not revenue).
export default function TopUpForm({ accountId, onSuccess }: TopUpFormProps) {
    const { topUpPointsCommand, isPending } = useTopUpPointsCommand();

    const form = useForm<Values>({
        resolver: zodResolver(formSchema),
        defaultValues: { amount: 1000, type: "paid", note: "" },
    })

    async function onSubmit(values: Values) {
        await topUpPointsCommand({ accountId, data: values });
        form.reset();
        onSuccess?.();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Points (1 point = 1 MMK)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                            <FormLabel>Type</FormLabel>
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
                            <FormLabel>Note</FormLabel>
                            <FormControl>
                                <Textarea placeholder="e.g. Cash received at office, invoice #123" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Spinner />}
                    Add Points
                </Button>
            </form>
        </Form>
    )
}
