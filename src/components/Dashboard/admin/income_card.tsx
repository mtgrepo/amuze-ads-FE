import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIncomeQuery } from "../../../Composable/Query/dashboard/useIncomeQuery";
import { compactNumber, percentChange, type DateRange } from "./dashboard_utils";

function Stat({ label, value, change, note }: { label: string; value: number; change?: number | null; note: string }) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-mono text-[22px] font-medium tabular-nums" title={`${value.toLocaleString()} MMK`}>
                {compactNumber(value)} <span className="text-sm text-muted-foreground">MMK</span>
            </span>
            <span className="text-xs text-muted-foreground">
                {change !== undefined && change !== null && (
                    <span className={cn("mr-1 font-medium", change >= 0 ? "text-success" : "text-destructive")}>{change >= 0 ? "+" : ""}{change}%</span>
                )}
                {note}
            </span>
        </div>
    );
}

/** Income at a glance for the dashboard's range: money received, what ads earned, and points still held. */
export function IncomeCard({ range, previousLabel }: { range: DateRange; previousLabel: string }) {
    const { income, isLoading } = useIncomeQuery(range.from, range.to);

    return (
        <section aria-labelledby="income" className="flex min-w-0 flex-col gap-3.5 rounded-xl border bg-card px-5 py-[18px]">
            <div className="flex items-center justify-between gap-3">
                <h2 id="income" className="text-[15px] font-semibold">Income</h2>
                <Link to="/income" className="text-[13px] text-primary hover:underline">Full income report →</Link>
            </div>
            {isLoading || !income ? (
                <div className="h-16 animate-pulse rounded-lg bg-muted" />
            ) : (
                <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                    <Stat
                        label="Received"
                        value={income.current.received.total}
                        change={percentChange(income.current.received.total, income.previous.received.total)}
                        note={percentChange(income.current.received.total, income.previous.received.total) === null ? "KBZPay and paid offline" : previousLabel}
                    />
                    <Stat
                        label="Earned from ads"
                        value={income.current.earned.total}
                        change={percentChange(income.current.earned.total, income.previous.earned.total)}
                        note={percentChange(income.current.earned.total, income.previous.earned.total) === null ? "after refunds" : previousLabel}
                    />
                    <Stat
                        label="Unspent points"
                        value={income.unspent.points}
                        note={`paid, not yet earned · ${income.unspent.wallets} ${income.unspent.wallets === 1 ? "wallet" : "wallets"}`}
                    />
                </div>
            )}
        </section>
    );
}
