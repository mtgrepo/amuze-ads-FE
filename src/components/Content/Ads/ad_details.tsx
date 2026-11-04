import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "../../ui/button";
import { cn } from "@/lib/utils";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { EXTENDABLE_CAMPAIGN_STATUSES } from "../../../dto/response/campaignExtension/campaignExtensionResponse";
import { OBJECTIVE_LABELS } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";
import { useAdminOverviewQuery } from "../../../Composable/Query/dailyAdStats/useAdminOverviewQuery";
import { useCampaignObjectivesQuery } from "../../../Composable/Query/campaignObjective/useCampaignObjectivesQuery";
import { useCampaignExtensionsQuery } from "../../../Composable/Query/campaignExtension/useCampaignExtensionsQuery";
import { useWalletQuery } from "../../../Composable/Query/points/useWalletQuery";
import { useApproveExtensionCommand } from "../../../Composable/Command/campaignExtension/useApproveExtensionCommand";
import { useRejectExtensionCommand } from "../../../Composable/Command/campaignExtension/useRejectExtensionCommand";
import { StatusBadge } from "../../Common/status_badge";
import { parseLocalDate, placementLabel, rate, toLocalDateString } from "../../Dashboard/admin/dashboard_utils";
import BudgetForm from "./budget_form";
import { ExtendDialog } from "./campaign_extensions";
import PaymentDialog from "../Payment/payment_dialog";
import AdsActions from "./ads_actions";
import { pts, tileColor } from "./column";
import { adHistory, historyDate, HISTORY_DOT } from "./ad_history";

const GENDER: Record<string, string> = { all: "Everyone", male: "Men", female: "Women" };
const dateOnly = (value: Date | string) => String(value).slice(0, 10);
const day = (value: Date | string) => parseLocalDate(dateOnly(value));
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3.5 rounded-2xl border bg-card px-5 py-[18px]">
            <div className="flex items-center justify-between gap-2.5">
                <h2 className="text-[15px] font-semibold">{title}</h2>
                {aside}
            </div>
            {children}
        </section>
    );
}

function Detail({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className={cn("mt-[3px] font-medium break-words", className)}>{children}</dd>
        </div>
    );
}

/** Extra periods bought after the first payment; requests waiting for review can be approved or rejected here. */
function ExtensionsSection({ campaignId, packageName }: { campaignId: string; packageName: string }) {
    const { extensions } = useCampaignExtensionsQuery(campaignId);
    const { approveExtension, isApproving } = useApproveExtensionCommand();
    const { rejectExtension, isRejecting } = useRejectExtensionCommand();
    const busy = isApproving || isRejecting;

    return (
        <Section title="Extensions">
            {extensions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No extensions yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-[13px]">
                        <thead>
                            <tr className="text-left text-xs text-muted-foreground">
                                <th className="border-b px-3 py-2.5 font-medium">Extra period</th>
                                <th className="border-b px-3 py-2.5 font-medium">Added</th>
                                <th className="border-b px-3 py-2.5 text-right font-medium">Cost</th>
                                <th className="border-b px-3 py-2.5 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {extensions.map((e) => (
                                <tr key={e.id}>
                                    <td className="whitespace-nowrap border-b px-3 py-3">{format(day(e.startDate), "d MMM")} – {format(day(e.newEndDate), "d MMM")}</td>
                                    <td className="whitespace-nowrap border-b px-3 py-3">{e.quantity} × {packageName}</td>
                                    <td className="whitespace-nowrap border-b px-3 py-3 text-right font-mono tabular-nums">{pts(e.amount)}</td>
                                    <td className="border-b px-3 py-3">
                                        {e.status === "approved" && <span className="text-success">Approved {historyDate(e.reviewedAt ?? e.createdAt)}</span>}
                                        {e.status === "rejected" && <span className="text-destructive">Rejected {historyDate(e.reviewedAt ?? e.createdAt)}</span>}
                                        {e.status === "pending" && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-warning">Waiting for review</span>
                                                <Button size="sm" variant="outline" className="h-7" disabled={busy} onClick={() => rejectExtension(e.id).catch(() => undefined)}>Reject</Button>
                                                <Button size="sm" className="h-7" disabled={busy} onClick={() => approveExtension(e.id).catch(() => undefined)}>Approve</Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Section>
    );
}

export default function AdDetails({ data }: { data: AdResponse }) {
    const [payOpen, setPayOpen] = useState(false);
    const [extendOpen, setExtendOpen] = useState(false);
    // "Day X of Y" is worked out from when the page was opened.
    const [now] = useState(() => Date.now());
    const campaign = data?.adSet?.campaign;
    const advertiser = campaign?.advertiser;
    // Reach for the whole run so far.
    const { overviewData } = useAdminOverviewQuery(campaign ? dateOnly(campaign.startDate) : undefined, toLocalDateString(new Date()), undefined, data?.id);
    const { objectives } = useCampaignObjectivesQuery(campaign?.id);
    const { extensions } = useCampaignExtensionsQuery(campaign?.id);
    // Agencies pay for their clients, so a client's ads draw on the agency's wallet.
    const walletOwner = advertiser?.agencyId ?? advertiser?.id ?? "";
    const { wallet } = useWalletQuery(walletOwner);

    if (!data || !campaign) return <p className="p-8 text-muted-foreground">No data available</p>;

    const { adSet, adCreative, status } = data;
    const start = day(campaign.startDate), end = day(campaign.endDate);
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    const daysUsed = Math.max(0, Math.min(totalDays, Math.floor((now - start.getTime()) / 86_400_000) + 1));
    const running = status === "active" && now >= start.getTime();
    const canExtend = EXTENDABLE_CAMPAIGN_STATUSES.includes(campaign.status);
    const plan = Number(campaign.planCost), objectiveCost = Number(campaign.objectiveCost ?? 0);
    const picked = objectives.filter((o) => o.selected);
    const history = adHistory(data, extensions);
    const isVideo = adCreative?.assetType === "video";

    const impressions = data.totalImpressions ?? 0, clicks = data.totalClicks ?? 0, watches = data.totalWatches ?? 0;
    const reach = overviewData?.totalReach ?? 0;
    const stats = [
        { label: "Impressions", value: impressions.toLocaleString(), sub: "since it started" },
        { label: "Reach", value: reach.toLocaleString(), sub: impressions && reach ? `${(impressions / reach).toFixed(1)} views each` : "people" },
        { label: "Clicks", value: clicks.toLocaleString(), sub: `${rate(clicks, impressions)} CTR` },
        { label: "Watches", value: isVideo ? watches.toLocaleString() : "—", sub: isVideo ? `${rate(data.totalCompletions ?? 0, watches)} VCR` : "Image ad" },
        { label: "Engagements", value: (clicks + watches).toLocaleString(), sub: "clicks + watches" },
    ];

    return (
        <div className="flex w-full flex-col gap-5">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-white" style={{ background: tileColor(data.id) }} aria-hidden="true">
                        {initials(campaign.name)}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl font-semibold">{campaign.name}</h1>
                            {running ? (
                                <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full bg-success-soft px-2.5 text-xs font-medium text-success-soft-foreground">
                                    Live · day {daysUsed} of {totalDays}
                                </span>
                            ) : <StatusBadge status={status} />}
                        </div>
                        <span className="text-muted-foreground">
                            {advertiser?.name} · <span className="capitalize">{data.adType}</span> · {placementLabel(data.placementKey)}
                            {data.createdAt && <> · created {format(new Date(data.createdAt), "d MMM")}</>}
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <Button variant="outline" className="bg-card" asChild>
                        <Link to={`/daily-ads-status?ad=${data.id}`}>View performance</Link>
                    </Button>
                    {status === "draft" && <Button onClick={() => setPayOpen(true)}>Pay now</Button>}
                    {canExtend && <Button onClick={() => setExtendOpen(true)}>Extend</Button>}
                    <AdsActions {...data} />
                </div>
            </header>

            <section aria-label="Key numbers" className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                {stats.map((s) => (
                    <div key={s.label} className="flex flex-col gap-1 rounded-[14px] border bg-card px-4 py-3.5">
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <span className="font-mono text-[22px] font-medium tabular-nums">{s.value}</span>
                        <span className="text-xs text-muted-foreground">{s.sub}</span>
                    </div>
                ))}
            </section>

            <div className="flex flex-wrap items-start gap-4">
                <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-4">
                    <Section title="Creative">
                        {adCreative?.asset ? (
                            isVideo
                                ? <video src={adCreative.asset} controls className="h-[220px] w-full rounded-xl bg-black object-contain" />
                                : <img src={adCreative.asset} alt={adCreative.name} className="h-[220px] w-full rounded-xl bg-muted object-cover" />
                        ) : (
                            <div className="flex h-[220px] flex-col justify-end gap-2 rounded-xl p-5 text-white" style={{ background: tileColor(data.id) }}>
                                <span className="text-xs opacity-85">Sponsored</span>
                                <span className="text-2xl font-semibold">{campaign.name}</span>
                            </div>
                        )}
                        <dl className="grid gap-x-5 gap-y-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                            <Detail label="Creative name">{adCreative?.name ?? "—"}</Detail>
                            <Detail label="File">{isVideo ? "Video" : "Image"}</Detail>
                            <Detail label="Tap goes to">
                                {adCreative?.destinationLink ? (
                                    <a href={adCreative.destinationLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                        {adCreative.destinationLink.replace(/^https?:\/\//, "")}
                                    </a>
                                ) : "—"}
                            </Detail>
                        </dl>
                    </Section>

                    {status === "draft" ? (
                        <BudgetForm campaign={campaign} assetType={adCreative?.assetType} />
                    ) : (
                        <Section title="Budget" aside={<span className="text-xs text-muted-foreground">Locked after payment. Extend to add time.</span>}>
                            <dl className="grid gap-x-5 gap-y-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                                <Detail label="Package">{campaign.packageQuantity} × {campaign.packageName}</Detail>
                                <Detail label="Runs">{format(start, "d MMM")} – {format(end, "d MMM yyyy")}</Detail>
                                <Detail label="Package cost" className="font-mono">{pts(plan)}</Detail>
                                <Detail label="Objectives" className="font-mono">{objectiveCost ? pts(objectiveCost) : "None"}</Detail>
                                <Detail label="Total paid" className="font-mono text-lg">{pts(plan + objectiveCost)}</Detail>
                            </dl>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Time used</span>
                                    <span className="font-mono">{daysUsed} of {totalDays} days</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted">
                                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(daysUsed / totalDays) * 100}%` }} />
                                </div>
                            </div>
                        </Section>
                    )}

                    {status !== "draft" && <ExtensionsSection campaignId={campaign.id} packageName={campaign.packageName} />}
                </div>

                <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
                    <Section title="Objectives">
                        {picked.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No objectives bought. Package only.</p>
                        ) : picked.map((o) => {
                            const met = o.delivered >= o.targetCount;
                            return (
                                <div key={o.objectiveType} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between gap-2.5">
                                        <span className="font-medium">{OBJECTIVE_LABELS[o.objectiveType]}</span>
                                        <span className="font-mono">{o.delivered.toLocaleString()} / {o.targetCount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted">
                                        <div className={cn("h-1.5 rounded-full", met ? "bg-success" : "bg-primary")} style={{ width: `${Math.min(100, (o.delivered / (o.targetCount || 1)) * 100)}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{met ? "Target met · " : ""}{pts(o.cost)} paid</span>
                                </div>
                            );
                        })}
                    </Section>

                    <Section title="Audience">
                        <dl className="grid grid-cols-2 gap-3">
                            <Detail label="Age">{adSet.ageMin} – {adSet.ageMax}</Detail>
                            <Detail label="Gender">{GENDER[adSet.gender] ?? adSet.gender}</Detail>
                        </dl>
                    </Section>

                    <Section title="History">
                        <ol className="flex flex-col gap-3">
                            {history.map((h, i) => (
                                <li key={i} className="flex gap-2.5 text-[13px]">
                                    <span className={cn("mt-1.5 size-[7px] shrink-0 rounded-full", HISTORY_DOT[h.tone])} aria-hidden="true" />
                                    <span className="flex-1 leading-snug">{h.text}</span>
                                    <span className="whitespace-nowrap text-xs text-muted-foreground">{historyDate(h.when)}</span>
                                </li>
                            ))}
                        </ol>
                    </Section>

                    <Section title="Advertiser">
                        <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary">{initials(advertiser?.name ?? "?")}</span>
                            <div className="flex min-w-0 flex-col">
                                <Link to={`/advertisers/${advertiser?.id}`} className="truncate font-medium text-primary hover:underline">{advertiser?.name}</Link>
                                <span className="truncate text-xs text-muted-foreground">{[advertiser?.email, advertiser?.phone].filter(Boolean).join(" · ")}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{advertiser?.agencyId ? `${advertiser.agency?.name ?? "Agency"} balance` : "Balance"}</span>
                            <span className="font-mono text-foreground">{wallet ? pts(Number(wallet.balance)) : "—"}</span>
                        </div>
                    </Section>
                </div>
            </div>

            {status === "draft" && (
                <PaymentDialog open={payOpen} onOpenChange={setPayOpen} campaignId={campaign.id} campaignName={campaign.name} amount={campaign.totalBudget} />
            )}
            {canExtend && extendOpen && (
                <ExtendDialog campaign={campaign} isAdmin open={extendOpen} onOpenChange={setExtendOpen} />
            )}
        </div>
    );
}
