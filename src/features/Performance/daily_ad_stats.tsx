import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminOverviewQuery } from "../../Composable/Query/dailyAdStats/useAdminOverviewQuery";
import { useAdminTrendQuery } from "../../Composable/Query/dailyAdStats/useAdminTrendQuery";
import { useAdvertiserOptionsQuery } from "../../Composable/Query/dailyAdStats/useAdvertiserOptionsQuery";
import { eachDay, parseLocalDate, priorRange, type DateRange } from "../../components/Dashboard/admin/dashboard_utils";
import { MetricStrip } from "../../components/Performance/metric_strip";
import { ComparisonChart } from "../../components/Performance/comparison_chart";
import { AdsTable } from "../../components/Performance/ads_table";
import { DailyBreakdown } from "../../components/Performance/daily_breakdown";
import { AdChip, SelectedAdBar } from "../../components/Performance/selected_ad_bar";
import { useAdDetailQuery } from "../../Composable/Query/content/useAdDetailQuery";
import { RangeControl } from "../../components/Performance/range_control";
import { rangeForDays, toDayTotals, type Metric } from "../../components/Performance/performance_types";

const ALL = "all";

function periodLabel(range: DateRange): string {
    return `${format(parseLocalDate(range.from), "d MMM")} – ${format(parseLocalDate(range.to), "d MMM")}`;
}

export default function DailyAdStats() {
    const [range, setRange] = useState<DateRange>(() => rangeForDays(7));
    const [metric, setMetric] = useState<Metric>("clicks");
    // First step: a standalone advertiser or an agency. Second step (agency only): one of its clients.
    // An agency with no client chosen means all of that agency's clients combined.
    const [accountId, setAccountId] = useState<string>();
    const [clientId, setClientId] = useState<string>();

    const { advertisers } = useAdvertiserOptionsQuery();
    const accounts = advertisers.filter((a) => a.type === "agency" || !a.agencyId);
    const account = advertisers.find((a) => a.id === accountId);
    const agencyClients = account?.type === "agency" ? advertisers.filter((a) => a.agencyId === account.id) : [];
    const scopeId = clientId ?? accountId;

    // The selected ad lives in the URL (?ad=), so "View performance" links, back and bookmarks all work.
    const [searchParams, setSearchParams] = useSearchParams();
    const adId = searchParams.get("ad") ?? undefined;
    const setAdId = (id: string | undefined) => setSearchParams((params) => {
        if (id) params.set("ad", id); else params.delete("ad");
        return params;
    });
    const { adDetail } = useAdDetailQuery(adId ?? "");
    const adName: string | undefined = adId ? adDetail?.adSet?.campaign?.name : undefined;

    const prior = priorRange(range);
    const { overviewData, isLoading } = useAdminOverviewQuery(range.from, range.to, scopeId, adId);
    const { overviewData: priorOverview } = useAdminOverviewQuery(prior.from, prior.to, scopeId, adId);
    const { trendData } = useAdminTrendQuery(range.from, range.to, scopeId, adId);
    const { trendData: priorTrend } = useAdminTrendQuery(prior.from, prior.to, scopeId, adId);

    const current = toDayTotals(eachDay(range), trendData);
    const previous = toDayTotals(eachDay(prior), priorTrend);
    const days = current.length;

    return (
        <div className="flex w-full flex-col gap-3 px-4 py-6 lg:px-6">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-xl font-medium">Performance</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Select
                            value={accountId ?? ALL}
                            onValueChange={(v) => {
                                setAccountId(v === ALL ? undefined : v);
                                setClientId(undefined);
                                setAdId(undefined);
                            }}
                        >
                            <SelectTrigger size="sm" className="h-8 min-w-40 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All advertisers</SelectItem>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name}{a.type === "agency" && <span className="text-muted-foreground"> · agency</span>}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {account?.type === "agency" ? (
                            <>
                                <ChevronRight className="size-3.5 text-muted-foreground" />
                                <Select key={account.id} value={clientId ?? ALL} onValueChange={(v) => { setClientId(v === ALL ? undefined : v); setAdId(undefined); }}>
                                    <SelectTrigger size="sm" className="h-8 min-w-36 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All clients</SelectItem>
                                        {agencyClients.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        ) : !account ? (
                            <span className="ml-1 text-xs text-muted-foreground">Pick an agency to narrow to one of its clients</span>
                        ) : null}
                        {adId && <AdChip name={adName} onClear={() => setAdId(undefined)} />}
                    </div>
                </div>
                <RangeControl range={range} onChange={setRange} />
            </div>

            {adId && <SelectedAdBar adId={adId} onClear={() => setAdId(undefined)} />}

            <section className="overflow-hidden rounded-xl border bg-card">
                <MetricStrip
                    current={overviewData}
                    previous={priorOverview}
                    selected={metric}
                    onSelect={setMetric}
                    activeAdsNote="running now"
                    lastCell={adId && adDetail ? {
                        label: "Spent",
                        value: `${Number(adDetail.adSet?.campaign?.totalBudget ?? 0).toLocaleString()} pts`,
                        note: "on this campaign",
                    } : undefined}
                    isLoading={isLoading}
                />
                <ComparisonChart
                    metric={metric}
                    current={current}
                    previous={previous}
                    rangeLabel={adName ? `${adName}, ${periodLabel(range)}` : periodLabel(range)}
                    previousLabel={`Previous ${days} ${days === 1 ? "day" : "days"}`}
                />
            </section>

            <AdsTable range={range} scopeId={scopeId} owner="advertiser" title="Ads" selectedAdId={adId} onSelectAd={setAdId} />
            <DailyBreakdown days={current} subject={adName} />
        </div>
    );
}
