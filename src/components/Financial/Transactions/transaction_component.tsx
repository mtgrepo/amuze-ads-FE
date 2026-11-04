import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { POINT_TYPE_LABELS, type AdminLedgerEntry } from "../../../dto/response/points/pointsResponse";
import type { TransactionResponse } from "../../../dto/response/transactions/transactionResponse";

const DAY = 86_400_000;
const PAGE = 100;

type Kind = "topup" | "payment" | "extension" | "refund";
type Filter = "all" | Kind;

const TYPES: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "topup", label: "Top-ups" },
    { key: "payment", label: "Ad payments" },
    { key: "extension", label: "Extensions" },
    { key: "refund", label: "Refunds" },
];

const kindOf = (e: AdminLedgerEntry): Kind =>
    e.type === "refund" ? "refund"
        : e.type === "spend" ? (e.referenceType === "campaign_extension" ? "extension" : "payment")
            : "topup";

const num = (v: number) => Math.abs(v).toLocaleString("en-US");
const signed = (v: number) => `${v >= 0 ? "+" : "−"}${num(v)}`;
const time = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** What the entry was, e.g. "Payment · Ruby Mart weekend deals". */
function describe(e: AdminLedgerEntry, method?: string): string {
    const note = e.note?.trim();
    switch (e.type) {
        case "purchase": return `Points bought${method ? ` · ${method}` : ""}`;
        case "admin_paid": return `Top-up by Amuze admin${note ? ` · ${note}` : ""}`;
        case "admin_bonus": return `Bonus points by Amuze admin${note ? ` · ${note}` : ""}`;
        case "refund": return `Refund${note ? ` · ${note}` : ""}`;
        case "spend":
            return e.referenceType === "campaign_extension"
                ? `Extension${note ? ` · ${note.replace(/^Extension:\s*/, "")}` : ""}`
                : `Payment${note ? ` · ${note}` : ""}`;
        default: return POINT_TYPE_LABELS[e.type] ?? e.type;
    }
}

function dayLabel(d: Date, now: number): string {
    const today = new Date(now);
    if (dayKey(d) === dayKey(today)) return "Today";
    if (dayKey(d) === dayKey(new Date(now - DAY))) return "Yesterday";
    const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
    const month = d.toLocaleDateString("en-GB", { month: "short" });
    return `${weekday}, ${d.getDate()} ${month}${d.getFullYear() === today.getFullYear() ? "" : ` ${d.getFullYear()}`}`;
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

function exportCsv(rows: { e: AdminLedgerEntry; what: string; method?: string }[]) {
    const header = ["Date", "Wallet", "Type", "What", "Points", "Balance after", "Payment method", "Note"];
    const lines = rows.map(({ e, what, method }) => [
        new Date(e.createdAt).toISOString(), e.advertiser?.name ?? "", POINT_TYPE_LABELS[e.type] ?? e.type, what,
        Number(e.amount), Number(e.balanceAfter), method ?? "", e.note ?? "",
    ].map(csvCell).join(","));
    const blob = new Blob([[header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
}

function Total({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "in" | "out" }) {
    return (
        <div className="flex flex-[1_1_200px] flex-col gap-1 rounded-[14px] border bg-card px-4 py-3.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={cn("font-mono text-[22px] font-medium tabular-nums", tone === "in" && "text-success", tone === "out" && "text-destructive")}>{value}</span>
            <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
    );
}

/** Every point in and out of every wallet, newest first, grouped by day. */
export function TransactionComponent({ entries, payments }: { entries: AdminLedgerEntry[]; payments: TransactionResponse[] }) {
    const [now] = React.useState(() => Date.now());
    const [type, setType] = React.useState<Filter>("all");
    const [limit, setLimit] = React.useState(PAGE);

    // Paid credits link to the money transaction behind them, which knows how it was paid.
    const methods = React.useMemo(() => new Map(payments.map((t) => [t.id, t.paymentMethod])), [payments]);
    const rows = React.useMemo(() => entries.map((e) => {
        const method = e.referenceType === "transaction" && e.referenceId ? methods.get(e.referenceId) : undefined;
        return { e, kind: kindOf(e), method, what: describe(e, method) };
    }), [entries, methods]);

    const week = rows.filter((r) => new Date(r.e.createdAt).getTime() >= now - 7 * DAY);
    const inWeek = week.reduce((s, r) => s + Math.max(0, Number(r.e.amount)), 0);
    const outWeek = week.reduce((s, r) => s + Math.min(0, Number(r.e.amount)), 0);
    const net = inWeek + outWeek;

    const shown = rows.filter((r) => type === "all" || r.kind === type);
    const days: { key: string; label: string; sum: number; items: typeof rows }[] = [];
    for (const r of shown.slice(0, limit)) {
        const d = new Date(r.e.createdAt);
        const key = dayKey(d);
        let day = days[days.length - 1];
        if (!day || day.key !== key) { day = { key, label: dayLabel(d, now), sum: 0, items: [] }; days.push(day); }
        day.sum += Number(r.e.amount);
        day.items.push(r);
    }

    return (
        <div className="mx-auto flex w-full min-w-0 flex-col gap-[18px]">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[26px] font-semibold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">Every point in and out, newest first.</p>
                </div>
                <Button variant="outline" className="bg-card" onClick={() => exportCsv(shown)} disabled={shown.length === 0}>Export CSV</Button>
            </header>

            <section aria-label="This period" className="flex flex-wrap gap-3">
                <Total label="In · last 7 days" value={signed(inWeek)} sub="top-ups and refunds" tone="in" />
                <Total label="Out · last 7 days" value={signed(outWeek)} sub="ad payments and extensions" tone="out" />
                <Total label="Net" value={signed(net)} sub={`${net >= 0 ? "more" : "fewer"} points held than a week ago`} />
            </section>

            <div role="group" aria-label="Type" className="flex flex-wrap gap-2">
                {TYPES.map((t) => {
                    const on = t.key === type;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            aria-pressed={on}
                            onClick={() => { setType(t.key); setLimit(PAGE); }}
                            className={cn(
                                "inline-flex h-8 items-center gap-1.5 rounded-full border border-input bg-card px-3 text-[13px] font-medium text-foreground/80 hover:text-foreground",
                                on && "border-foreground bg-foreground text-background hover:text-background"
                            )}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            <div className="overflow-hidden rounded-[14px] border bg-card">
                {days.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                        <span className="font-medium">{rows.length === 0 ? "No points activity yet" : "Nothing of this type"}</span>
                        <span className="text-sm text-muted-foreground">
                            {rows.length === 0 ? "Top-ups, ad payments and refunds show up here." : "Try another type."}
                        </span>
                    </div>
                ) : days.map((d) => (
                    <div key={d.key}>
                        <div className="flex justify-between border-b bg-muted/40 px-[18px] py-2.5 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">{d.label}</span>
                            <span className="font-mono tabular-nums">net {signed(d.sum)}</span>
                        </div>
                        {d.items.map(({ e, what, method }) => {
                            const amount = Number(e.amount);
                            const plus = amount > 0;
                            const at = new Date(e.createdAt);
                            return (
                                <div key={e.id} className="flex flex-wrap items-center gap-3.5 border-b px-[18px] py-3 last:border-b-0">
                                    <span aria-hidden="true" className={cn(
                                        "inline-flex size-8 flex-none items-center justify-center rounded-full font-semibold",
                                        plus ? "bg-success-soft text-success-soft-foreground" : "bg-destructive-soft text-destructive-soft-foreground"
                                    )}>
                                        {plus ? "+" : "−"}
                                    </span>
                                    <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-0.5">
                                        <span className="font-medium">{what}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {e.advertiser?.name ?? "—"} · {time(at)}{e.type === "admin_paid" && method ? ` · ${method}` : ""}
                                        </span>
                                    </div>
                                    <span className={cn("w-[130px] text-right font-mono font-medium tabular-nums", plus ? "text-success" : "text-destructive")}>
                                        {signed(amount)} pts
                                    </span>
                                    <span className="w-[130px] text-right font-mono text-xs tabular-nums text-muted-foreground">bal. {num(Number(e.balanceAfter))}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {shown.length > limit && (
                <div className="flex items-center justify-center gap-3">
                    <span className="text-[13px] text-muted-foreground">Showing {limit.toLocaleString("en-US")} of {shown.length.toLocaleString("en-US")}</span>
                    <Button variant="outline" className="bg-card" onClick={() => setLimit((l) => l + PAGE)}>Show more</Button>
                </div>
            )}
        </div>
    );
}
