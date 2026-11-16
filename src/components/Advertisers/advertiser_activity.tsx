import { useMemo, useState } from "react";
import type { AdResponse } from "../../dto/response/content/adResponse";
import { useActivityQuery } from "../../Composable/Query/activity/useActivityQuery";
import { TablePagination } from "../Common/Pagination/table_pagination";
import { ActivityList, ActivityListLoading } from "../Activity/activity_list";
import { ACTIVITY_EMPTY } from "../../lib/activity";

/** Everything recorded for one advertiser (an agency also sees its clients'), a page at a time. Rows about an ad link to it. */
export function AdvertiserActivity({ advertiserId, ads }: { advertiserId: string; ads: AdResponse[] }) {
    const [page, setPage] = useState({ pageIndex: 0, pageSize: 20 });
    const { activity, total, isLoading } = useActivityQuery({ advertiserId, page: page.pageIndex + 1, limit: page.pageSize });
    // The log names the campaign; an ad's page is under the ad's id.
    const adByCampaign = useMemo(() => new Map(ads.map((ad) => [ad.adSet.campaign.id, ad.id])), [ads]);

    if (isLoading) {
        return <div className="rounded-[14px] border bg-card p-5"><ActivityListLoading rows={5} /></div>;
    }
    if (!activity.length) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-[14px] border bg-card px-5 py-12 text-center">
                <span className="font-medium">No activity yet</span>
                <span className="text-sm text-muted-foreground">{ACTIVITY_EMPTY}</span>
            </div>
        );
    }
    return (
        <div className="rounded-[14px] border bg-card">
            <ActivityList
                items={activity}
                className="gap-0 [&>li]:border-b [&>li]:border-border/60 [&>li]:px-5 [&>li]:py-3"
                adHref={(log) => {
                    const adId = log.campaignId ? adByCampaign.get(log.campaignId) : undefined;
                    return adId ? `/ads/${adId}` : undefined;
                }}
            />
            <TablePagination total={total} pageIndex={page.pageIndex} pageSize={page.pageSize} onChange={setPage} />
        </div>
    );
}
