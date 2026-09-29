import { useEffect, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon, EditIcon, Lock, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Calendar } from "../../ui/calendar"
import { Spinner } from "../../ui/spinner"
import { cn } from "../../../lib/utils"
import { useUpdateCampaignBudgetCommand } from "../../../Composable/Command/content/campaign/useUpdateCampaignBudgetCommand"

const schema = z.object({
    budgetPlan: z.enum(["daily", "total"]),
    dailyBudget: z.number().min(0),
    totalBudget: z.number().min(1, { message: "Total budget is required." }),
    startDate: z.date({ message: "Start date is required." }),
    endDate: z.date({ message: "End date is required." }),
}).refine((data) => data.budgetPlan !== "daily" || data.dailyBudget >= 1, {
    message: "Daily budget is required.",
    path: ["dailyBudget"],
}).refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
})

type Values = z.infer<typeof schema>

interface BudgetFormProps {
    campaign: {
        id: string
        status: string
        budgetPlan: string
        dailyBudget: number
        totalBudget: number
        startDate: string | Date
        endDate: string | Date
    }
    /** Render just the form, already editing (e.g. inside a dialog). */
    embedded?: boolean
    /** Called after Save succeeds or Cancel is pressed. */
    onDone?: () => void
}

const toDateOnly = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Stored dates arrive as "YYYY-MM-DD"; read them as local calendar days (new Date("YYYY-MM-DD") is UTC midnight),
// matching the local-midnight dates the calendar picker produces.
const parseLocalDate = (value: string | Date) => {
    if (value instanceof Date) return value;
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
}

// Budget and schedule set the amount paid, so they can change only while the ad is a draft.
export default function BudgetForm({ campaign, embedded = false, onDone }: BudgetFormProps) {
    const [editing, setEditing] = useState(embedded);
    const isDraft = campaign.status === "draft";
    const { updateCampaignBudgetCommand, isPending } = useUpdateCampaignBudgetCommand();

    const toValues = (): Values => ({
        budgetPlan: campaign.budgetPlan === "total" ? "total" : "daily",
        dailyBudget: Number(campaign.dailyBudget),
        totalBudget: Number(campaign.totalBudget),
        startDate: parseLocalDate(campaign.startDate),
        endDate: parseLocalDate(campaign.endDate),
    });

    const form = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: toValues(),
    });

    useEffect(() => {
        form.reset(toValues());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaign]);

    const budgetPlan = form.watch("budgetPlan");
    const dailyBudget = form.watch("dailyBudget");
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");

    useEffect(() => {
        if (!editing) return;
        if (budgetPlan === "daily") {
            if (startDate && endDate && dailyBudget >= 1) {
                const msPerDay = 1000 * 60 * 60 * 24;
                const days = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;
                form.setValue("totalBudget", dailyBudget * Math.max(days, 1));
            }
        } else {
            form.setValue("dailyBudget", 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing, budgetPlan, dailyBudget, startDate, endDate]);

    const disabled = !editing;

    const onSubmit = async (values: Values) => {
        await updateCampaignBudgetCommand({
            id: campaign.id,
            data: {
                budgetPlan: values.budgetPlan,
                dailyBudget: values.dailyBudget,
                totalBudget: values.totalBudget,
                startDate: toDateOnly(values.startDate),
                endDate: toDateOnly(values.endDate),
            },
        });
        setEditing(embedded);
        onDone?.();
    };

    const handleCancel = () => {
        form.reset(toValues());
        setEditing(embedded);
        onDone?.();
    };

    const renderDateField = (name: "startDate" | "endDate", label: string) => (
        <FormField control={form.control} name={name} render={({ field }) => (
            <FormItem className="flex flex-col">
                <FormLabel>{label}</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                                variant="outline"
                                disabled={disabled}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            captionLayout="dropdown"
                        />
                    </PopoverContent>
                </Popover>
                <FormMessage />
            </FormItem>
        )} />
    );

    const formContent = (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <FormField control={form.control} name="budgetPlan" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget Plan</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                                            <SelectTrigger className="w-full"><SelectValue placeholder="Select budget plan" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily Budget</SelectItem>
                                                <SelectItem value="total">Total Budget</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="dailyBudget" render={({ field }) => (
                                <FormItem><FormLabel>Daily Budget</FormLabel><FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        disabled={disabled || budgetPlan === "total"}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="totalBudget" render={({ field }) => (
                                <FormItem><FormLabel>Total Budget</FormLabel><FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        disabled={disabled || budgetPlan === "daily"}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <div />
                            {renderDateField("startDate", "Start Date")}
                            {renderDateField("endDate", "End Date")}
                        </div>
                        {editing && (
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Spinner />}
                                    Save
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
    );

    if (embedded) return formContent;

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex justify-between items-center">
                <CardTitle className="flex flex-row gap-3 items-center">
                    <Wallet size={20} className="text-primary" /> Budget
                </CardTitle>
                {isDraft && !editing && (
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
                        <EditIcon size={16} /> Edit
                    </Button>
                )}
                {!isDraft && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock size={14} /> Budget is locked after payment.
                    </span>
                )}
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    )
}
