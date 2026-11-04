import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useTopAdsQuery } from "../../Composable/Query/dailyAdStats/useTopAdsQuery";
import type { TopAdItem } from "../../dto/response/dailyAdStats/dailyAdStatsResponse";
import { compactNumber, placementLabel, rate, type DateRange } from "../Dashboard/admin/dashboard_utils";

import { statusLabel } from "../../lib/status";
// The backend returns at most this many ads, ranked by the fetched metric.
const AD_LIMIT = 50;

type SortKey = "impressions" | "reach" | "clicks" | "ctr" | "watches" | "vcr" | "engagements";

const COLUMNS: { key: SortKey; label: string }[] = [
    { key: "impressions", label: "Impr." },
    { key: "reach", label: "Reach" },
    { key: "clicks", label: "Clicks" },
    { key: "ctr", label: "CTR" },
    { key: "watches", label: "Watches" },
    { key: "vcr", label: "VCR" },
    { key: "engagements", label: "Eng." },
];

const ratio = (part: number, base: number) => (base ? part / base : -1);

const SORT_VALUE: Record<SortKey, (ad: TopAdItem) => number> = {
    impressions: (ad) => ad.totalImpressions,
    reach: (ad) => ad.totalReach,
    clicks: (ad) => ad.totalClicks,
    ctr: (ad) => ratio(ad.totalClicks, ad.totalImpressions),
    watches: (ad) => ad.totalWatches,
    vcr: (ad) => ratio(ad.totalCompletions, ad.totalWatches),
    engagements: (ad) => ad.totalEngagements,
};

// Reach and CTR are sorted among the most-seen ads, VCR among the most-watched; the server ranks by counts only.
const FETCH_METRIC: Record<SortKey, string> = {
    impressions: "impressions",
    reach: "impressions",
    clicks: "clicks",
    ctr: "impressions",
    watches: "watches",
    vcr: "watches",
    engagements: "engagements",
};

const STATUS_TAG: Record<string, string> = {
    paused: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    expired: "bg-muted text-muted-foreground",
};

/**
 * Ads in the range, sortable by any column.
 * owner: "advertiser" shows who owns each ad (admin), "client" shows the agency's client, "none" for an advertiser's own ads.
 * selectedAdId highlights the ad the page is narrowed to; it's chosen in the filter path above.
 */
export function AdsTable({ range, scopeId, owner, title, selectedAdId }: {
    range: DateRange;
    scopeId?: string;
    owner: "advertiser" | "client" | "none";
    title: string;
    selectedAdId?: string;
}) {
    const [sortKey, setSortKey] = useState<SortKey>("clicks");
    const [descending, setDescending] = useState(true);
    const { topAdsData, isLoading } = useTopAdsQuery(AD_LIMIT, FETCH_METRIC[sortKey], range.from, range.to, scopeId);

    const rows = [...topAdsData].sort((a, b) => {
        const diff = SORT_VALUE[sortKey](a) - SORT_VALUE[sortKey](b);
        return descending ? -diff : diff;
    });

    const onSort = (key: SortKey) => {
        if (key === sortKey) {
            setDescending((d) => !d);
        } else {
            setSortKey(key);
            setDescending(true);
        }
    };

    const sortedLabel = COLUMNS.find((c) => c.key === sortKey)?.label.toLowerCase();

    return (
        <section className="rounded-xl border bg-card p-5">
            <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-medium">{title}</h2>
                <span className="text-xs text-muted-foreground">
                    Sorted by {sortedLabel}{rows.length >= AD_LIMIT ? ` · top ${AD_LIMIT}` : ""}
                </span>
            </div>
            {isLoading ? (
                <div className="mt-4 h-24 animate-pulse rounded bg-muted" />
            ) : rows.length === 0 ? (
                <div className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">
                    No ads delivered in this period
                </div>
            ) : (
                <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-muted-foreground">
                                <th className="w-8 pb-2 text-left font-normal">#</th>
                                <th className="pb-2 text-left font-normal">Campaign</th>
                                {COLUMNS.map((col) => (
                                    <th key={col.key} className="pb-2 pl-4 text-right font-normal">
                                        <button
                                            type="button"
                                            onClick={() => onSort(col.key)}
                                            className={`inline-flex items-center gap-1 whitespace-nowrap hover:text-foreground ${sortKey === col.key ? "text-foreground" : ""}`}
                                        >
                                            {col.label}
                                            {sortKey === col.key && (descending ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />)}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((ad, index) => (
                                <tr
                                    key={ad.adId}
                                    aria-current={ad.adId === selectedAdId ? "true" : undefined}
                                    className={cn("border-t", ad.adId === selectedAdId && "bg-primary/10")}
                                >
                                    <td className="py-2.5 text-xs text-muted-foreground tabular-nums">{index + 1}</td>
                                    <td className="py-2.5 pr-4">
                                        <Link to={`/ads/${ad.adId}`} className="hover:underline">{ad.campaignName}</Link>
                                        {STATUS_TAG[ad.status] && (
                                            <span className={`ml-2 rounded px-1.5 py-px text-[11px] ${STATUS_TAG[ad.status]}`}>{statusLabel(ad.status)}</span>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                            {owner !== "none" && <>{ad.advertiserName}{owner === "advertiser" && ad.agencyName && <> · via {ad.agencyName}</>} · </>}
                                            {placementLabel(ad.placementKey)}
                                        </div>
                                    </td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{compactNumber(ad.totalImpressions)}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{compactNumber(ad.totalReach)}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{ad.totalClicks.toLocaleString()}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{rate(ad.totalClicks, ad.totalImpressions)}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{ad.totalWatches.toLocaleString()}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{rate(ad.totalCompletions, ad.totalWatches)}</td>
                                    <td className="py-2.5 pl-4 text-right tabular-nums">{ad.totalEngagements.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
