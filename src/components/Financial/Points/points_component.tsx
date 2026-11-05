import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PointsLedgerResponse } from "../../../dto/response/points/pointsResponse";
import type { AdvertisersResponse } from "../../../dto/response/advertisers/advertisersResponse";
import { TablePagination } from "../../Common/Pagination/table_pagination";
import { AddPointsDialog } from "./add_points_dialog";

const DAY = 86_400_000;
const TOP_UPS = new Set(["purchase", "admin_paid", "admin_bonus"]);

const pts = (v: number) => `${v.toLocaleString("en-US")} pts`;
const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(n);
const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

function Total({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="flex flex-col gap-1 rounded-[14px] border bg-card px-4 py-3.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="font-mono text-[22px] font-medium tabular-nums">{value}</span>
            <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
    );
}

const runwayText = (days: number | null) =>
    days === null ? "Not spending" : days < 1 ? "Less than a day" : days > 365 ? "Over a year" : plural(days, "day", "days");

/** Who holds points, who is running low, and how long each balance lasts at the last 30 days' spend. */
export function PointsComponent({ ledger, advertisers }: { ledger: PointsLedgerResponse; advertisers: AdvertisersResponse[] }) {
    const [now] = React.useState(() => Date.now());
    const [topUp, setTopUp] = React.useState<{ id: string; name: string } | null>(null);
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

    const { wallets, totals } = React.useMemo(() => {
        const monthStart = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
        const since30 = now - 30 * DAY;

        // Entries are newest first, so the first one per wallet holds its current balance.
        const balance = new Map<string, number>();
        const spent30 = new Map<string, number>();
        let added = 0, addedCount = 0, spent = 0, refunded = 0, refundCount = 0;
        for (const e of ledger.entries) {
            if (!balance.has(e.advertiserId)) balance.set(e.advertiserId, Number(e.balanceAfter));
            const at = new Date(e.createdAt).getTime();
            const amount = Number(e.amount);
            if (e.type === "spend" && at >= since30) spent30.set(e.advertiserId, (spent30.get(e.advertiserId) ?? 0) - amount);
            if (at < monthStart) continue;
            if (TOP_UPS.has(e.type)) { added += amount; addedCount++; }
            else if (e.type === "spend") spent -= amount;
            else if (e.type === "refund") { refunded += amount; refundCount++; }
        }

        // Only standalone advertisers and agencies have wallets; agency clients spend their agency's points.
        const clients = new Map<string, number>();
        advertisers.forEach((a) => { if (a.agencyId) clients.set(a.agencyId, (clients.get(a.agencyId) ?? 0) + 1); });
        const owners = advertisers.filter((a) => a.type === "agency" || !a.agencyId);
        const max = Math.max(1, ...owners.map((a) => balance.get(a.id) ?? 0));

        const wallets = owners.map((a) => {
            const bal = balance.get(a.id) ?? 0;
            const used = spent30.get(a.id) ?? 0;
            const days = used > 0 ? Math.round(bal / (used / 30)) : null;
            const kind = a.type === "agency" ? `Agency · ${plural(clients.get(a.id) ?? 0, "client", "clients")}` : "Advertiser";
            return {
                id: a.id, name: a.name, bal, used, days,
                type: a.status === "active" ? kind : `${kind} · inactive`,
                low: days !== null && days < 14,
                width: Math.max(1, (bal / max) * 100),
            };
        }).sort((x, y) => y.bal - x.bal || x.name.localeCompare(y.name));

        return {
            wallets,
            totals: [
                { label: "Held in wallets", value: `${compact(ledger.totalBalance)} pts`, sub: `across ${plural(owners.length, "wallet", "wallets")}` },
                { label: "Added this month", value: pts(added), sub: plural(addedCount, "top-up", "top-ups") },
                { label: "Spent this month", value: pts(spent), sub: "ads, objectives, extensions" },
                { label: "Refunded this month", value: pts(refunded), sub: plural(refundCount, "refund", "refunds") },
            ],
        };
    }, [ledger, advertisers, now]);

    const pageIndex = Math.min(pagination.pageIndex, Math.max(0, Math.ceil(wallets.length / pagination.pageSize) - 1));
    const pageWallets = wallets.slice(pageIndex * pagination.pageSize, (pageIndex + 1) * pagination.pageSize);

    return (
        <div className="mx-auto flex w-full min-w-0 flex-col gap-[18px]">
            <header className="flex flex-col gap-1">
                <h1 className="text-[26px] font-semibold tracking-tight">Points</h1>
                <p className="text-muted-foreground">Who has points, who is running low, and how long their balance lasts at the current spend.</p>
            </header>

            <section aria-label="Totals" className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                {totals.map((t) => <Total key={t.label} {...t} />)}
            </section>

            <div className="rounded-[14px] border bg-card">
                <div className="overflow-x-auto rounded-t-[14px]">
                <Table className="min-w-[860px]">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="h-auto px-3 py-2.5 text-xs font-medium text-muted-foreground">Wallet owner</TableHead>
                            <TableHead className="h-auto w-[260px] px-3 py-2.5 text-xs font-medium text-muted-foreground">Balance</TableHead>
                            <TableHead className="h-auto px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Spent, last 30 days</TableHead>
                            <TableHead className="h-auto px-3 py-2.5 text-xs font-medium text-muted-foreground">Lasts about</TableHead>
                            <TableHead className="h-auto px-3 py-2.5"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageWallets.length ? pageWallets.map((w) => (
                            <TableRow key={w.id} className="hover:bg-transparent">
                                <TableCell className="p-3">
                                    <div className="flex flex-col gap-0.5">
                                        <Link to={`/advertisers/${w.id}`} className="font-medium text-foreground hover:text-primary hover:underline">{w.name}</Link>
                                        <span className="text-xs text-muted-foreground">{w.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="p-3">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="font-mono tabular-nums">{pts(w.bal)}</span>
                                        <div className="h-[5px] rounded-[3px] bg-muted">
                                            <div className={cn("h-[5px] rounded-[3px]", w.low ? "bg-warning" : "bg-primary")} style={{ width: `${w.width}%` }} />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="p-3 text-right font-mono tabular-nums">{w.used ? pts(w.used) : "—"}</TableCell>
                                <TableCell className="p-3">
                                    <span className={w.low ? "font-medium text-warning" : "text-foreground/80"}>{runwayText(w.days)}</span>
                                </TableCell>
                                <TableCell className="p-3 text-right">
                                    <Button variant="outline" size="sm" className="h-8 bg-card text-[13px]" onClick={() => setTopUp({ id: w.id, name: w.name })}>Add points</Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="font-medium">No wallets yet</span>
                                        <span className="text-sm text-muted-foreground">Advertisers and agencies get a wallet when their account is created.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
                <TablePagination total={wallets.length} pageIndex={pageIndex} pageSize={pagination.pageSize} onChange={setPagination} />
            </div>
            <span className="text-xs text-muted-foreground">Agency clients don't have wallets; their agency pays.</span>

            {topUp && <AddPointsDialog key={topUp.id} wallet={topUp} onClose={() => setTopUp(null)} />}
        </div>
    );
}
