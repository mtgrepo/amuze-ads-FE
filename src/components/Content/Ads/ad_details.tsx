import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { CalendarPlus, ChartLine, CreditCard, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { EXTENDABLE_CAMPAIGN_STATUSES } from "../../../dto/response/campaignExtension/campaignExtensionResponse";
import { useAdminOverviewQuery } from "../../../Composable/Query/dailyAdStats/useAdminOverviewQuery";
import { StatusBadge } from "../../Common/status_badge";
import { parseLocalDate, placementLabel, rate, toLocalDateString } from "../../Dashboard/admin/dashboard_utils";
import BudgetForm from "./budget_form";
import { ObjectiveProgressCard } from "./objective_progress";
import CampaignExtensions, { ExtendDialog } from "./campaign_extensions";
import PaymentDialog from "../Payment/payment_dialog";
import AdsActions from "./ads_actions";

const GENDER: Record<string, string> = { all: "Everyone", male: "Men", female: "Women" };
const dateOnly = (value: Date | string) => String(value).slice(0, 10);
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-medium break-words">{children}</dd>
        </div>
    );
}

export default function AdDetails({ data }: { data: AdResponse }) {
    const [payOpen, setPayOpen] = useState(false);
    const [extendOpen, setExtendOpen] = useState(false);
    // "Day X of Y" is worked out from when the page was opened.
    const [now] = useState(() => Date.now());
    const campaign = data?.adSet?.campaign;
    // Reach and completions for the whole run so far.
    const { overviewData } = useAdminOverviewQuery(campaign ? dateOnly(campaign.startDate) : undefined, toLocalDateString(new Date()), undefined, data?.id);

    if (!data || !campaign) return <p className="p-8 text-muted-foreground">No data available</p>;

    const { adSet, adCreative, status } = data;
    const advertiser = campaign.advertiser;
    const start = parseLocalDate(dateOnly(campaign.startDate));
    const end = parseLocalDate(dateOnly(campaign.endDate));
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    const dayOf = Math.min(totalDays, Math.floor((now - start.getTime()) / 86_400_000) + 1);
    const running = campaign.status === "active" && dayOf >= 1;
    const canExtend = EXTENDABLE_CAMPAIGN_STATUSES.includes(campaign.status);

    const impressions = data.totalImpressions ?? 0, clicks = data.totalClicks ?? 0, watches = data.totalWatches ?? 0;
    const tiles = [
        { label: "Impressions", value: impressions.toLocaleString(), sub: "since it started" },
        { label: "Reach", value: (overviewData?.totalReach ?? 0).toLocaleString(), sub: impressions && overviewData?.totalReach ? `${(impressions / overviewData.totalReach).toFixed(1)} views each` : "people" },
        { label: "Clicks", value: clicks.toLocaleString(), sub: `${rate(clicks, impressions)} CTR` },
        { label: "Watches", value: adCreative?.assetType === "video" ? watches.toLocaleString() : "—", sub: adCreative?.assetType === "video" ? `${rate(data.totalCompletions ?? 0, watches)} VCR` : "Image ad" },
        { label: "Engagements", value: (clicks + watches).toLocaleString(), sub: "clicks + watches" },
    ];

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-info-soft text-lg font-semibold text-info-soft-foreground">{initials(campaign.name)}</span>
                    <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
                            <StatusBadge status={status} />
                            {running && <span className="text-xs text-muted-foreground">day {dayOf} of {totalDays}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {advertiser?.name} · <span className="capitalize">{data.adType}</span> · {placementLabel(data.placementKey)}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/daily-ads-status?ad=${data.id}`}><ChartLine /> View performance</Link>
                    </Button>
                    {status === "draft" && <Button onClick={() => setPayOpen(true)}><CreditCard /> Pay</Button>}
                    {canExtend && <Button onClick={() => setExtendOpen(true)}><CalendarPlus /> Extend</Button>}
                    <AdsActions {...data} />
                </div>
            </header>

            {status === "draft" && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-info-soft px-4 py-3 text-sm text-info-soft-foreground">
                    <span><span className="font-semibold">This ad is a draft.</span> Nothing is charged until it's paid.</span>
                    <Button size="sm" onClick={() => setPayOpen(true)}><CreditCard /> Pay now</Button>
                </div>
            )}

            <section aria-label="Results" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {tiles.map((t) => (
                    <div key={t.label} className="flex flex-col gap-1 rounded-xl border bg-card px-4 py-3.5">
                        <span className="text-xs text-muted-foreground">{t.label}</span>
                        <span className="font-mono text-xl font-medium tabular-nums">{t.value}</span>
                        <span className="text-xs text-muted-foreground">{t.sub}</span>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                <div className="flex min-w-0 flex-col gap-5">
                    <Card>
                        <CardHeader><CardTitle>Creative</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {adCreative?.assetType === "video" ? (
                                <video src={adCreative.asset} controls className="max-h-96 w-full rounded-lg bg-black object-contain" />
                            ) : (
                                <img src={adCreative?.asset} alt={adCreative?.name} className="max-h-96 w-full rounded-lg border bg-muted object-contain" />
                            )}
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <Detail label="Creative name">{adCreative?.name ?? "—"}</Detail>
                                <Detail label="File"><span className="capitalize">{adCreative?.assetType ?? "—"}</span></Detail>
                                <Detail label="Tap goes to">
                                    {adCreative?.destinationLink ? (
                                        <a href={adCreative.destinationLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                                            <span className="truncate">{adCreative.destinationLink.replace(/^https?:\/\//, "")}</span> <ExternalLink className="size-3 shrink-0" />
                                        </a>
                                    ) : "—"}
                                </Detail>
                            </dl>
                        </CardContent>
                    </Card>

                    <BudgetForm campaign={campaign} assetType={adCreative?.assetType} />
                    <CampaignExtensions campaign={campaign} isAdmin />
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                    <ObjectiveProgressCard campaignId={campaign.id} />
                    <Card>
                        <CardHeader><CardTitle>Audience</CardTitle></CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-2 gap-4">
                                <Detail label="Age">{adSet.ageMin} – {adSet.ageMax}</Detail>
                                <Detail label="Gender">{GENDER[adSet.gender] ?? adSet.gender}</Detail>
                                <Detail label="Runs">{format(start, "d MMM")} – {format(end, "d MMM yyyy")}</Detail>
                                <Detail label="Placement">{placementLabel(data.placementKey)}</Detail>
                            </dl>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Advertiser</CardTitle></CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-full bg-info-soft text-xs font-semibold text-info-soft-foreground">{initials(advertiser?.name ?? "?")}</span>
                                <div className="min-w-0">
                                    <Link to={`/advertisers/${advertiser?.id}`} className="block truncate font-medium hover:text-primary hover:underline">{advertiser?.name}</Link>
                                    <span className="block truncate text-xs text-muted-foreground">{[advertiser?.email, advertiser?.phone].filter(Boolean).join(" · ")}</span>
                                </div>
                            </div>
                            {advertiser?.profiles?.[0] && (
                                <dl className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <Detail label="Business">{advertiser.profiles[0].business_name}</Detail>
                                    <Detail label="Type">{advertiser.profiles[0].business_type}</Detail>
                                    {advertiser.profiles[0].website && <Detail label="Website">{advertiser.profiles[0].website}</Detail>}
                                </dl>
                            )}
                        </CardContent>
                    </Card>
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
