import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminOverviewQuery } from "../../Composable/Query/dailyAdStats/useAdminOverviewQuery";
import { useAdminTrendQuery } from "../../Composable/Query/dailyAdStats/useAdminTrendQuery";
import { useAdvertiserOptionsQuery } from "../../Composable/Query/dailyAdStats/useAdvertiserOptionsQuery";
import { usePlacementBreakdownQuery } from "../../Composable/Query/dailyAdStats/usePlacementBreakdownQuery";
import { useAdDetailQuery } from "../../Composable/Query/content/useAdDetailQuery";
import type { PlacementBreakdownItem } from "../../dto/response/dailyAdStats/dailyAdStatsResponse";
import { eachDay, parseLocalDate, priorRange, rate, type DateRange } from "../../components/Dashboard/admin/dashboard_utils";
import { AdFilter } from "../../components/Performance/ad_filter";
import { RangeControl, type RangeKey } from "../../components/Performance/range_control";
import { TotalsTrend } from "../../components/Performance/totals_trend";
import { FunnelCard } from "../../components/Performance/funnel_card";
import { PlacementTable } from "../../components/Performance/placement_table";
import { DayTable } from "../../components/Performance/day_table";
import { CRUMB_TRIGGER, rangeForDays, toDayTotals, type DayTotals, type Metric } from "../../components/Performance/performance_types";

const ALL = "all";

function periodLabel(range: DateRange): string {
    return `${format(parseLocalDate(range.from), "d MMM")} – ${format(parseLocalDate(range.to), "d MMM")}`;
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

function downloadReport(days: DayTotals[], range: DateRange) {
    const header = ["Date", "Impressions", "Reach", "Clicks", "CTR", "Watches", "Completions", "VCR", "Engagements"];
    const lines = [...days].reverse().map((d) => [
        d.date, d.impressions, d.reach, d.clicks, rate(d.clicks, d.impressions),
        d.watches, d.completions, rate(d.completions, d.watches), d.engagements,
    ].map(csvCell).join(","));
    const blob = new Blob([[header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-${range.from}-to-${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded", { description: `${days.length} ${days.length === 1 ? "day" : "days"}, ${periodLabel(range)}` });
}

export default function DailyAdStats() {
    const [rangeKey, setRangeKey] = useState<RangeKey>("7d");
    const [range, setRange] = useState<DateRange>(() => rangeForDays(7));
    const [metric, setMetric] = useState<Metric>("clicks");
    const [compare, setCompare] = useState(true);
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
    const { placementData, isLoading: placementsLoading } = usePlacementBreakdownQuery(range.from, range.to, scopeId);

    const current = toDayTotals(eachDay(range), trendData);
    const previous = toDayTotals(eachDay(prior), priorTrend);

    // The placement endpoint can't narrow to one ad; a single ad runs in one placement, so its totals are that row.
    const placements: PlacementBreakdownItem[] = adId
        ? (overviewData && adDetail?.placementKey && overviewData.totalImpressions ? [{
            placementKey: adDetail.placementKey,
            impressions: overviewData.totalImpressions,
            reach: overviewData.totalReach,
            clicks: overviewData.totalClicks,
            watches: overviewData.totalWatches,
            completions: overviewData.totalCompletions,
            engagements: overviewData.totalEngagements,
        }] : [])
        : placementData;

    return (
        <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-6 lg:px-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-2.5">
                    <h1 className="text-[26px] font-semibold tracking-tight">Performance</h1>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Select
                            value={accountId ?? ALL}
                            onValueChange={(v) => {
                                setAccountId(v === ALL ? undefined : v);
                                setClientId(undefined);
                                setAdId(undefined);
                            }}
                        >
                            <SelectTrigger aria-label="Advertiser" className={CRUMB_TRIGGER}><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All advertisers</SelectItem>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name}{a.type === "agency" && <span className="text-muted-foreground"> · agency</span>}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {account?.type === "agency" && (
                            <>
                                <span aria-hidden="true" className="text-muted-foreground">›</span>
                                <Select key={account.id} value={clientId ?? ALL} onValueChange={(v) => { setClientId(v === ALL ? undefined : v); setAdId(undefined); }}>
                                    <SelectTrigger aria-label="Client" className={CRUMB_TRIGGER}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All clients</SelectItem>
                                        {agencyClients.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}
                        <span aria-hidden="true" className="text-muted-foreground">›</span>
                        <AdFilter scopeId={scopeId} value={adId} selectedName={adName} onChange={setAdId} />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <RangeControl value={rangeKey} range={range} onChange={(key, r) => { setRangeKey(key); setRange(r); }} />
                    <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-foreground/80">
                        <Checkbox checked={compare} onCheckedChange={(v) => setCompare(!!v)} /> Compare with previous period
                    </label>
                    <Button variant="outline" className="bg-card" onClick={() => downloadReport(current, range)}>Download report</Button>
                </div>
            </header>

            <TotalsTrend
                current={overviewData}
                previous={priorOverview}
                metric={metric}
                onMetric={setMetric}
                days={current}
                prevDays={previous}
                compare={compare}
                rangeLabel={periodLabel(range)}
                isLoading={isLoading}
            />

            <div className="flex flex-wrap items-stretch gap-4">
                <FunnelCard totals={overviewData} isLoading={isLoading} />
                <PlacementTable rows={placements} isLoading={adId ? isLoading : placementsLoading} />
            </div>

            <DayTable days={current} />
        </div>
    );
}
