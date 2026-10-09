import { Link } from "react-router-dom";
import { useTopAdsQuery } from "../../../Composable/Query/dailyAdStats/useTopAdsQuery";
import { Panel, PanelHeader, PanelLoading } from "./panel";
import { daysUntil, endsInLabel, rate, type DateRange } from "./dashboard_utils";

export function TopCampaigns({ range }: { range: DateRange }) {
    const { topAdsData, isLoading } = useTopAdsQuery(5, "clicks", range.from, range.to);

    return (
        <Panel>
            <PanelHeader title="Top campaigns" meta="by clicks" />
            {isLoading ? (
                <PanelLoading rows={3} />
            ) : topAdsData.length === 0 ? (
                <div className="flex min-h-20 items-center justify-center text-sm text-muted-foreground">
                    No campaign activity in this period
                </div>
            ) : (
                <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-muted-foreground">
                                <th className="pb-2 font-normal">Campaign</th>
                                <th className="pb-2 font-normal">Advertiser</th>
                                <th className="pb-2 text-right font-normal">Clicks</th>
                                <th className="pb-2 text-right font-normal">CTR</th>
                                <th className="pb-2 text-right font-normal">Watches</th>
                                <th className="pb-2 text-right font-normal">Eng.</th>
                                <th className="pb-2 text-right font-normal">Ends</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topAdsData.map((ad) => {
                                const daysLeft = daysUntil(ad.endDate);
                                return (
                                    <tr key={ad.adId} className="border-t">
                                        <td className="py-2.5 pr-4">
                                            <Link to={`/ads/${ad.adId}`} className="hover:underline">{ad.campaignName}</Link>
                                        </td>
                                        <td className="py-2.5 pr-4 text-muted-foreground">
                                            {ad.advertiserName}
                                            {ad.agencyName && <span className="text-xs"> · via {ad.agencyName}</span>}
                                        </td>
                                        <td className="py-2.5 text-right tabular-nums">{ad.totalClicks.toLocaleString()}</td>
                                        <td className="py-2.5 text-right tabular-nums">{rate(ad.totalClicks, ad.totalImpressions)}</td>
                                        <td className="py-2.5 text-right tabular-nums">{ad.totalWatches.toLocaleString()}</td>
                                        <td className="py-2.5 text-right tabular-nums">{ad.totalEngagements.toLocaleString()}</td>
                                        <td className={`py-2.5 text-right ${daysLeft >= 0 && daysLeft <= 1 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                                            {endsInLabel(ad.endDate)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Panel>
    );
}
