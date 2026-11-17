import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/status";
import type { LedgerEntryDetail, PointLedgerType } from "../../../dto/response/points/pointsResponse";

const num = (v: number) => Math.abs(v).toLocaleString("en-US");
const signed = (v: number) => `${v >= 0 ? "+" : "−"}${num(v)}`;
const dateTime = (at: string) =>
    new Date(at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
/** Date-only columns come as "2026-11-17"; read them as that calendar day, not UTC midnight. */
const day = (d: string) => {
    const [y, m, dd] = d.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, dd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const EXTENSION = "campaign_extension";

/** A plain name for what happened, e.g. "Extension refund". */
function entryTitle(type: PointLedgerType, referenceType: string | null): string {
    const ext = referenceType === EXTENSION;
    switch (type) {
        case "purchase": return "Points bought";
        case "admin_paid": return "Paid top-up";
        case "admin_bonus": return "Bonus points";
        case "spend": return ext ? "Extension payment" : "Ad payment";
        case "refund": return ext ? "Extension refund" : "Refund";
        default: return type;
    }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-b px-[18px] py-3 last:border-b-0">
            <dt className="w-[140px] flex-none text-muted-foreground">{label}</dt>
            <dd className="min-w-0 flex-[1_1_240px]">{children}</dd>
        </div>
    );
}

function CopyId({ id }: { id: string }) {
    const [copied, setCopied] = React.useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard can be blocked; the id is still on screen to select.
        }
    };
    return (
        <span className="inline-flex max-w-full items-center gap-2">
            <span className="truncate font-mono text-xs">{id}</span>
            <button type="button" onClick={copy} aria-label="Copy reference" className="flex-none cursor-pointer text-muted-foreground hover:text-foreground">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </button>
        </span>
    );
}

/** One transaction: what it was, the balance it moved, and the ad, extension or payment behind it. */
export function TransactionDetailComponent({ detail }: { detail: LedgerEntryDetail }) {
    const { entry, wallet, payment, campaign, extension, admin, related } = detail;
    const amount = Number(entry.amount);
    const plus = amount > 0;
    // The ad may have been deleted since; the note still names it.
    const noteIsAdName = !!campaign && entry.note === campaign.name;

    return (
        <div className="mx-auto flex w-full max-w-[860px] min-w-0 flex-col gap-[18px]">
            <Link to="/transactions" className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" /> Back to transactions
            </Link>

            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[26px] font-semibold tracking-tight">{entryTitle(entry.type, entry.referenceType)}</h1>
                    <p className="text-muted-foreground">{dateTime(entry.createdAt)}</p>
                </div>
                <span className={cn("font-mono text-[28px] font-medium tabular-nums", plus ? "text-success" : "text-destructive")}>
                    {signed(amount)} pts
                </span>
            </header>

            <dl className="overflow-hidden rounded-[14px] border bg-card text-sm">
                <Row label="Wallet">
                    <Link to={`/advertisers/${wallet.id}`} className="font-medium text-primary hover:underline">{wallet.name}</Link>
                    <span className="text-muted-foreground"> · {wallet.type === "agency" ? "Agency" : "Advertiser"}</span>
                    {wallet.email && <div className="text-xs text-muted-foreground">{wallet.email}</div>}
                </Row>
                <Row label="Balance">
                    <span className="font-mono tabular-nums">{num(entry.balanceBefore)} → {num(Number(entry.balanceAfter))} pts</span>
                </Row>

                {campaign ? (
                    <>
                        <Row label={extension ? "Extends ad" : "For ad"}>
                            {campaign.adId
                                ? <Link to={`/ads/${campaign.adId}`} className="font-medium text-primary hover:underline">{campaign.name}</Link>
                                : <span className="font-medium">{campaign.name}</span>}
                            <span className="text-muted-foreground"> · {statusLabel(campaign.status)}</span>
                            {campaign.advertiser.id !== wallet.id && (
                                <div className="text-xs text-muted-foreground">
                                    Client: <Link to={`/advertisers/${campaign.advertiser.id}`} className="hover:underline">{campaign.advertiser.name}</Link>
                                </div>
                            )}
                        </Row>
                        <Row label="Package">
                            {campaign.packageQuantity} × {campaign.packageName}
                            <div className="text-xs text-muted-foreground">Runs {day(campaign.startDate)} – {day(campaign.endDate)} · budget {num(campaign.totalBudget)} pts</div>
                        </Row>
                    </>
                ) : entry.referenceType === "campaign" || entry.referenceType === EXTENSION ? (
                    <Row label="For ad"><span className="text-muted-foreground">This ad was deleted.</span></Row>
                ) : null}

                {extension && (
                    <Row label="Extension">
                        +{extension.days} {extension.days === 1 ? "day" : "days"} · ends {day(extension.previousEndDate)} → {day(extension.newEndDate)}
                        <div className="text-xs text-muted-foreground">
                            {statusLabel(extension.status)}{extension.reviewedAt ? ` · reviewed ${dateTime(extension.reviewedAt)}` : ""}
                        </div>
                    </Row>
                )}

                {payment && (
                    <Row label="Payment">
                        {payment.paymentMethod}
                        <span className="text-muted-foreground"> · {num(payment.amount)} MMK</span>
                    </Row>
                )}
                {entry.type === "admin_bonus" && <Row label="Payment"><span className="text-muted-foreground">Free, no money received</span></Row>}

                {admin && <Row label="Added by">{admin.name}</Row>}
                {entry.note && !noteIsAdName && <Row label="Note"><span className="whitespace-pre-wrap">{entry.note}</span></Row>}
                <Row label="Reference"><CopyId id={entry.id} /></Row>
            </dl>

            {related.length > 0 && (
                <section aria-label="Related transactions" className="flex flex-col gap-2.5">
                    <h2 className="text-[15px] font-semibold">Related transactions</h2>
                    <div className="overflow-hidden rounded-[14px] border bg-card">
                        {related.map((r) => (
                            <Link key={r.id} to={`/transactions/${r.id}`} className="flex flex-wrap items-center gap-3.5 border-b px-[18px] py-3 last:border-b-0 hover:bg-muted/40">
                                <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
                                    <span className="font-medium">{entryTitle(r.type, entry.referenceType)}</span>
                                    <span className="text-xs text-muted-foreground">{dateTime(r.createdAt)}</span>
                                </div>
                                <span className={cn("font-mono font-medium tabular-nums", r.amount > 0 ? "text-success" : "text-destructive")}>{signed(r.amount)} pts</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
