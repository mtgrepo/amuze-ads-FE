import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { EXTENDABLE_CAMPAIGN_STATUSES } from "../../../dto/response/campaignExtension/campaignExtensionResponse";
import { useAdDetailQuery } from "../../../Composable/Query/content/useAdDetailQuery";
import { useCampaignObjectivesQuery } from "../../../Composable/Query/campaignObjective/useCampaignObjectivesQuery";
import { useCampaignExtensionsQuery } from "../../../Composable/Query/campaignExtension/useCampaignExtensionsQuery";
import { useAdApproveCommand } from "../../../Composable/Command/content/ads/useAdApproveCommand";
import { useAdRejectCommand } from "../../../Composable/Command/content/ads/useAdRejectCommand";
import { OBJECTIVE_LABELS } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";
import { StatusBadge } from "../../Common/status_badge";
import { placementLabel } from "../../Dashboard/admin/dashboard_utils";
import { ownerName, paidSplit, pts, runDates, runProgress, tileColor } from "./column";
import { ExtendDialog } from "./campaign_extensions";
import PaymentDialog from "../Payment/payment_dialog";
import AdsActions from "./ads_actions";
import { adHistory, historyDate, HISTORY_DOT } from "./ad_history";

const GENDER: Record<string, string> = { all: "Everyone", male: "Men", female: "Women" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 font-medium">{children}</dd>
        </div>
    );
}

/** A quick look at one ad without leaving the list: preview, package, objectives, history and next step. */
export function AdSidePanel({ ad, onClose }: { ad: AdResponse | null; onClose: () => void }) {
    const [payOpen, setPayOpen] = useState(false);
    const [extendOpen, setExtendOpen] = useState(false);
    const { adDetail } = useAdDetailQuery(ad?.id ?? "");
    const campaign = ad?.adSet.campaign;
    const { objectives } = useCampaignObjectivesQuery(campaign?.id);
    const { extensions } = useCampaignExtensionsQuery(campaign?.id);
    const { approveAdCommand, isPending: approving } = useAdApproveCommand();
    const { rejectAdCommand, isPending: rejecting } = useAdRejectCommand();

    if (!ad || !campaign) return null;

    const creative = adDetail?.id === ad.id ? adDetail.adCreative : undefined;
    const picked = objectives.filter((o) => o.selected);
        const canExtend = EXTENDABLE_CAMPAIGN_STATUSES.includes(campaign.status);
    const history = adHistory(ad, extensions);

    const approve = async () => { await approveAdCommand(ad.id); onClose(); };
    const reject = async () => { await rejectAdCommand(ad.id); onClose(); };

    return (
        <>
            <Sheet open onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="right" className="flex w-full flex-col gap-0 bg-card p-0 sm:max-w-[460px]">
                    <div className="flex items-start gap-3 border-b px-5 py-[18px] pr-12">
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <StatusBadge status={ad.status} className="self-start" />
                            <SheetTitle className="text-[19px] font-semibold">{campaign.name}</SheetTitle>
                            <SheetDescription className="text-[13px]">{ownerName(ad)} · {placementLabel(ad.placementKey)}</SheetDescription>
                        </div>
                        <AdsActions {...ad} />
                    </div>

                    <div className="flex flex-1 flex-col gap-[22px] overflow-y-auto p-5">
                        {creative?.asset ? (
                            <div className="h-[180px] overflow-hidden rounded-[14px] bg-muted">
                                {creative.assetType === "video"
                                    ? <video src={creative.asset} className="h-full w-full object-cover" muted />
                                    : <img src={creative.asset} alt={creative.name} className="h-full w-full object-cover" />}
                            </div>
                        ) : (
                            <div className="flex h-[180px] flex-col justify-end gap-2 rounded-[14px] p-[18px] text-white" style={{ background: tileColor(ad.id) }}>
                                <span className="text-xs opacity-80">{placementLabel(ad.placementKey)} preview</span>
                                <span className="text-lg font-semibold">{campaign.name}</span>
                                <span className="self-start rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-zinc-900">Learn more</span>
                            </div>
                        )}

                        <section className="flex flex-col gap-2.5">
                            <h3 className="text-[13px] font-semibold text-muted-foreground">Package and schedule</h3>
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                <Field label="Package">{campaign.packageQuantity} × {campaign.packageName}</Field>
                                <Field label="Runs">{runDates(ad)}</Field>
                                <Field label="Total paid"><span className="font-mono">{pts(Number(campaign.planCost) + Number(campaign.objectiveCost ?? 0))}</span></Field>
                                <Field label="Time used"><span className="font-mono">{runProgress(campaign.startDate, campaign.endDate)}%</span></Field>
                                <Field label="Audience">{GENDER[ad.adSet.gender] ?? ad.adSet.gender}, {ad.adSet.ageMin}–{ad.adSet.ageMax}</Field>
                                <Field label="Paid for">{paidSplit(ad)}</Field>
                            </dl>
                        </section>

                        <section className="flex flex-col gap-3">
                            <h3 className="text-[13px] font-semibold text-muted-foreground">Objectives</h3>
                            {picked.length === 0 ? (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-[13px]"><span>No objectives bought</span><span className="text-muted-foreground">Package only</span></div>
                                    <div className="h-1.5 rounded-full bg-muted" />
                                </div>
                            ) : picked.map((o) => (
                                <div key={o.objectiveType} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-[13px]">
                                        <span>{OBJECTIVE_LABELS[o.objectiveType]}</span>
                                        <span className="font-mono text-muted-foreground">{o.delivered.toLocaleString()} / {o.targetCount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted">
                                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, (o.delivered / (o.targetCount || 1)) * 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </section>

                        <section className="flex flex-col gap-2.5">
                            <h3 className="text-[13px] font-semibold text-muted-foreground">History</h3>
                            <ol className="flex flex-col gap-2.5">
                                {history.map((h, i) => (
                                    <li key={i} className="flex gap-2.5 text-[13px]">
                                        <span className={cn("mt-1.5 size-[7px] shrink-0 rounded-full", HISTORY_DOT[h.tone])} aria-hidden="true" />
                                        <span className="flex-1">{h.text}</span>
                                        <span className="whitespace-nowrap text-muted-foreground">{historyDate(h.when)}</span>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </div>

                    <div className="flex flex-wrap gap-2.5 border-t px-5 py-3.5">
                        <Button variant="outline" asChild><Link to={`/daily-ads-status?ad=${ad.id}`}>View performance</Link></Button>
                        {canExtend && <Button variant="outline" onClick={() => setExtendOpen(true)}>Extend</Button>}
                        <div className="ml-auto flex gap-2">
                            {ad.status === "pending" && <Button variant="outline" disabled={rejecting} onClick={reject}>Reject</Button>}
                            {ad.status === "pending" && <Button disabled={approving} onClick={approve}>Approve</Button>}
                            {ad.status === "draft" && <Button onClick={() => setPayOpen(true)}>Pay now</Button>}
                            {ad.status === "expired" && <Button onClick={() => setExtendOpen(true)}>Extend to restart</Button>}
                            {(ad.status === "active" || ad.status === "rejected" || ad.status === "paused") && (
                                <Button asChild><Link to={`/ads/${ad.id}`}>Open ad page</Link></Button>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            {ad.status === "draft" && (
                <PaymentDialog open={payOpen} onOpenChange={setPayOpen} campaignId={campaign.id} campaignName={campaign.name} amount={campaign.totalBudget} />
            )}
            {canExtend && extendOpen && <ExtendDialog campaign={campaign} isAdmin open={extendOpen} onOpenChange={setExtendOpen} />}
        </>
    );
}
