import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { IncomeCustomer, IncomePackage, IncomeResponse } from "../../../dto/response/dashboard/dashboardResponse";
import { compactNumber, parseLocalDate, percentChange } from "../../Dashboard/admin/dashboard_utils";
import { TD, TH } from "../../Performance/performance_types";
import { share } from "./income_export";

/** "1,234,500 MMK". 1 point = 1 MMK. */
const mmk = (n: number) => `${Math.round(n).toLocaleString("en-US")} MMK`;
const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
const pct = (s: number | null) => (s === null ? "—" : `${(s * 100).toFixed(s >= 0.1 ? 0 : 1)}%`);

/** Charts over 45 days group into weeks so the line stays readable. */
const WEEKLY_AFTER = 45;

// ---------------------------------------------------------------- tiles

interface TileProps {
    label: string;
    value: number;
    sub: string;
    /** Omit for figures that aren't range-based. */
    prev?: number;
    /** Up is good for income, bad for refunds and bonuses. */
    upIsGood?: boolean;
}

function Tile({ label, value, sub, prev, upIsGood = true }: TileProps) {
    const change = prev === undefined ? null : percentChange(value, prev);
    const good = change !== null && (change >= 0) === upIsGood;
    return (
        <div className="flex flex-col gap-1.5 rounded-xl border bg-card px-4 py-3.5">
            <span className="text-[13px] text-muted-foreground">{label}</span>
            <span className="font-mono text-2xl font-medium tracking-tight tabular-nums" title={mmk(value)}>
                {compactNumber(value)} <span className="text-sm text-muted-foreground">MMK</span>
            </span>
            <span className="text-xs text-muted-foreground">{sub}</span>
            {prev !== undefined && (
                <span className="text-xs text-muted-foreground">
                    {change === null
                        ? "no previous figure"
                        : <><span className={cn("font-mono", change === 0 ? "text-muted-foreground" : good ? "text-success" : "text-destructive")}>{change >= 0 ? "+" : "−"}{Math.abs(change)}%</span> vs previous period</>}
                </span>
            )}
        </div>
    );
}

function IncomeTiles({ current, previous, unspent }: Pick<IncomeResponse, "current" | "previous" | "unspent">) {
    const n = (v: number) => v.toLocaleString("en-US");
    return (
        <section aria-label="Totals" className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
            <Tile
                label="Received"
                value={current.received.total}
                prev={previous.received.total}
                sub={`KBZPay ${n(current.received.kbzpay)} · paid offline ${n(current.received.offline)}`}
            />
            <Tile
                label="Earned from ads"
                value={current.earned.total}
                prev={previous.earned.total}
                sub={`packages ${n(current.earned.packages)} · objectives ${n(current.earned.objectives)} · extensions ${n(current.earned.extensions)}`}
            />
            <Tile
                label="Refunded"
                value={current.earned.refunded}
                prev={previous.earned.refunded}
                upIsGood={false}
                sub="points returned for ads that never ran"
            />
            <Tile
                label="Bonus given"
                value={current.bonus}
                prev={previous.bonus}
                upIsGood={false}
                sub="free points, no income"
            />
            <Tile
                label="Unspent points"
                value={unspent.points}
                sub={`held in ${plural(unspent.wallets, "wallet", "wallets")} — paid, not yet earned`}
            />
        </section>
    );
}

// ---------------------------------------------------------------- chart

type Bucket = { start: string; end: string; received: number; earned: number };

function toBuckets(daily: IncomeResponse["daily"]): { buckets: Bucket[]; weekly: boolean } {
    const weekly = daily.length > WEEKLY_AFTER;
    if (!weekly) return { weekly, buckets: daily.map((d) => ({ start: d.date, end: d.date, received: d.received, earned: d.earned })) };
    const buckets: Bucket[] = [];
    for (let i = 0; i < daily.length; i += 7) {
        const week = daily.slice(i, i + 7);
        buckets.push({
            start: week[0].date,
            end: week[week.length - 1].date,
            received: week.reduce((a, d) => a + d.received, 0),
            earned: week.reduce((a, d) => a + d.earned, 0),
        });
    }
    return { weekly, buckets };
}

const W = 640, H = 200;
const linePoints = (values: number[], min: number, max: number) =>
    values.map((v, i) => `${(values.length > 1 ? (i * W) / (values.length - 1) : W / 2).toFixed(1)},${(H - 6 - ((v - min) / (max - min)) * (H - 12)).toFixed(1)}`).join(" ");

function Legend({ className, label }: { className: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground/80">
            <span aria-hidden="true" className={cn("h-[3px] w-4 rounded-full", className)} />
            {label}
        </span>
    );
}

function ReceivedEarnedChart({ daily }: { daily: IncomeResponse["daily"] }) {
    const { buckets, weekly } = toBuckets(daily);
    const received = buckets.map((b) => b.received);
    const earned = buckets.map((b) => b.earned);
    const empty = buckets.every((b) => !b.received && !b.earned);
    // Earned can dip below zero on a day refunds outweigh spend.
    const min = Math.min(0, ...received, ...earned);
    const max = Math.max(...received, ...earned, 1) * 1.12;
    const zeroY = H - 6 - ((0 - min) / (max - min)) * (H - 12);
    const label = (d: string) => format(parseLocalDate(d), "d MMM");
    const axis = buckets.length
        ? [buckets[0], buckets[Math.floor(buckets.length / 2)], buckets[buckets.length - 1]].map((b) => (weekly ? `Week of ${label(b.start)}` : format(parseLocalDate(b.start), "EEE d MMM")))
        : [];
    const totalReceived = received.reduce((a, b) => a + b, 0);
    const totalEarned = earned.reduce((a, b) => a + b, 0);

    return (
        <section aria-labelledby="received-vs-earned" className="flex min-w-0 flex-col gap-3.5 rounded-xl border bg-card px-5 py-[18px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                    <h2 id="received-vs-earned" className="text-[15px] font-semibold">Received vs earned</h2>
                    <span className="text-[13px] text-muted-foreground">MMK per {weekly ? "week" : "day"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <Legend className="bg-chart-1" label="Received" />
                    <Legend className="bg-chart-3" label="Earned" />
                    <span className="text-xs text-muted-foreground">peak <span className="font-mono tabular-nums">{compactNumber(Math.max(...received, ...earned, 0))}</span></span>
                </div>
            </div>
            {empty ? (
                <div className="flex h-[220px] flex-col items-center justify-center gap-1 rounded-lg bg-muted/40 text-center">
                    <span className="font-medium">Nothing received or earned</span>
                    <span className="text-sm text-muted-foreground">No points were bought or spent on ads in this period.</span>
                </div>
            ) : (
                <>
                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        preserveAspectRatio="none"
                        role="img"
                        aria-label={`Received ${mmk(totalReceived)} and earned ${mmk(totalEarned)}, per ${weekly ? "week" : "day"}`}
                        className="block h-[220px] w-full"
                    >
                        {[50, 100, 150].map((y) => <line key={y} x1="0" y1={y} x2={W} y2={y} className="stroke-border" strokeWidth="1" />)}
                        {min < 0 && <line x1="0" y1={zeroY} x2={W} y2={zeroY} className="stroke-muted-foreground" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
                        <polygon points={`0,${zeroY} ${linePoints(received, min, max)} ${W},${zeroY}`} className="fill-chart-1" fillOpacity="0.08" />
                        <polyline points={linePoints(earned, min, max)} fill="none" className="stroke-chart-3" strokeWidth="2.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                        <polyline points={linePoints(received, min, max)} fill="none" className="stroke-chart-1" strokeWidth="2.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        {axis.map((a, i) => <span key={i}>{a}</span>)}
                    </div>
                </>
            )}
        </section>
    );
}

// ---------------------------------------------------------------- tables

function ShareBar({ value }: { value: number | null }) {
    return (
        <div className="flex items-center justify-end gap-2">
            <div className="h-[5px] w-16 rounded-[3px] bg-muted">
                <div className="h-[5px] rounded-[3px] bg-primary" style={{ width: `${(value ?? 0) * 100}%` }} />
            </div>
            <span className="w-10 text-right font-mono tabular-nums text-foreground/80">{pct(value)}</span>
        </div>
    );
}

function CardShell({ id, title, sub, children }: { id: string; title: string; sub: string; children: ReactNode }) {
    return (
        <section aria-labelledby={id} className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5 rounded-2xl border bg-card px-5 py-[18px]">
            <div className="flex flex-col gap-0.5">
                <h2 id={id} className="text-[15px] font-semibold">{title}</h2>
                <span className="text-[13px] text-muted-foreground">{sub}</span>
            </div>
            {children}
        </section>
    );
}

function Empty({ title, body }: { title: string; body: string }) {
    return (
        <div className="flex min-h-32 flex-col items-center justify-center gap-1 text-center">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-sm text-muted-foreground">{body}</span>
        </div>
    );
}

function TopCustomers({ rows, earnedTotal }: { rows: IncomeCustomer[]; earnedTotal: number }) {
    return (
        <CardShell id="top-customers" title="Top customers" sub="Who the ads earned the most from">
            {rows.length === 0 ? (
                <Empty title="No customers yet" body="Nobody spent points on ads in this period." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[440px] border-collapse text-[13px]">
                        <thead>
                            <tr>
                                <th className={`${TH} text-left`}>Customer</th>
                                <th className={TH}>Earned</th>
                                <th className={TH}>Received</th>
                                <th className={TH}>Share of earned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((c) => (
                                <tr key={c.advertiserId}>
                                    <td className={`${TD} text-left`}>
                                        <div className="flex flex-col gap-0.5">
                                            <Link to={`/advertisers/${c.advertiserId}`} className="font-medium text-foreground hover:text-primary hover:underline">{c.name}</Link>
                                            <span className="text-xs text-muted-foreground">{c.type === "agency" ? "Agency" : "Advertiser"}</span>
                                        </div>
                                    </td>
                                    <td className={`${TD} font-mono tabular-nums`}>{c.earned.toLocaleString("en-US")}</td>
                                    <td className={`${TD} font-mono tabular-nums text-foreground/80`}>{c.received ? c.received.toLocaleString("en-US") : "—"}</td>
                                    <td className={TD}><ShareBar value={share(c.earned, earnedTotal)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </CardShell>
    );
}

function ByPackage({ rows }: { rows: IncomePackage[] }) {
    const total = rows.reduce((a, p) => a + p.earned, 0);
    return (
        <CardShell id="by-package" title="By package" sub="What each package earned (MMK)">
            {rows.length === 0 ? (
                <Empty title="No packages sold" body="No ads were paid for with a package in this period." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[380px] border-collapse text-[13px]">
                        <thead>
                            <tr>
                                <th className={`${TH} text-left`}>Package</th>
                                <th className={TH}>Ads</th>
                                <th className={TH}>Earned</th>
                                <th className={TH}>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((p) => (
                                <tr key={p.packageName}>
                                    <td className={`${TD} text-left font-medium`}>{p.packageName}</td>
                                    <td className={`${TD} font-mono tabular-nums text-foreground/80`}>{p.ads.toLocaleString("en-US")}</td>
                                    <td className={`${TD} font-mono tabular-nums`}>{p.earned.toLocaleString("en-US")}</td>
                                    <td className={TD}><ShareBar value={share(p.earned, total)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </CardShell>
    );
}

// ---------------------------------------------------------------- page body

export function IncomeComponent({ income }: { income: IncomeResponse }) {
    return (
        <>
            <IncomeTiles current={income.current} previous={income.previous} unspent={income.unspent} />
            <ReceivedEarnedChart daily={income.daily} />
            <div className="flex flex-wrap items-stretch gap-4">
                <TopCustomers rows={income.topCustomers} earnedTotal={income.current.earned.total} />
                <ByPackage rows={income.byPackage} />
            </div>
            <span className="text-xs text-muted-foreground">
                Received is money paid for points. Earned is points spent on ads, less refunds for ads that never ran. Bonus points are free and earn nothing until spent.
            </span>
        </>
    );
}

/** Quiet placeholders shaped like the page. */
export function IncomeLoading() {
    return (
        <div role="status" aria-label="Loading income" className="flex flex-col gap-5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-[118px] animate-pulse rounded-xl bg-muted" />)}
            </div>
            <div className="h-[330px] animate-pulse rounded-xl bg-muted" />
            <div className="flex flex-wrap gap-4">
                <div className="h-56 flex-[1_1_420px] animate-pulse rounded-2xl bg-muted" />
                <div className="h-56 flex-[1_1_420px] animate-pulse rounded-2xl bg-muted" />
            </div>
        </div>
    );
}
