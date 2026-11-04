import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAdListQuery } from "../../../Composable/Query/content/useAdListQuery";
import { getCampaignObjectives } from "../../../http/apis/campaignObjective/campaignObjectiveApi";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import type { ObjectiveProgress } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";
import { runProgress } from "../../Content/Ads/column";
import { daysUntil, placementLabel } from "./dashboard_utils";

const dateOnly = (value: Date | string) => String(value).slice(0, 10);

/**
 * Live campaigns ending soonest, each with how much of its run has passed (the dark marker) and how much
 * of its bought results it has delivered (the bar). Behind pace when delivery trails time by over 10 points.
 */
export function LiveNow() {
    const { adListData } = useAdListQuery();
    const live = ((adListData ?? []) as AdResponse[])
        .filter((ad) => ad.status === "active")
        .sort((a, b) => dateOnly(a.adSet.campaign.endDate).localeCompare(dateOnly(b.adSet.campaign.endDate)))
        .slice(0, 5);

    const objectives = useQueries({
        queries: live.map((ad) => ({
            queryKey: ["campaign-objectives", ad.adSet.campaign.id],
            queryFn: async () => ((await getCampaignObjectives(ad.adSet.campaign.id))?.data ?? []) as ObjectiveProgress[],
        })),
    });

    return (
        <section aria-labelledby="live" className="flex min-w-0 flex-col gap-1 rounded-xl border bg-card px-5 py-[18px]">
            <div className="mb-2 flex items-center justify-between gap-3">
                <h2 id="live" className="text-[15px] font-semibold">Live now</h2>
                <Link to="/ads?status=active" className="text-[13px] text-primary hover:underline">All live ads →</Link>
            </div>
            {live.length === 0 && <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">No ads are live right now</div>}
            {live.map((ad, i) => {
                const c = ad.adSet.campaign;
                const time = runProgress(c.startDate, c.endDate);
                const picked = (objectives[i]?.data ?? []).filter((o) => o.selected && o.targetCount > 0);
                const delivered = picked.length
                    ? Math.round((picked.reduce((sum, o) => sum + Math.min(o.delivered / o.targetCount, 1), 0) / picked.length) * 100)
                    : null;
                const behind = delivered !== null && delivered + 10 < time;
                const left = daysUntil(dateOnly(c.endDate));
                return (
                    <div key={ad.id} className="flex flex-col gap-[7px] border-t py-[11px]">
                        <div className="flex items-baseline justify-between gap-2.5">
                            <Link to={`/ads/${ad.id}`} className="min-w-0 truncate font-medium hover:text-primary">{c.name}</Link>
                            <span className={cn("whitespace-nowrap text-xs font-medium", delivered === null ? "text-muted-foreground" : behind ? "text-warning-soft-foreground" : "text-success")}>
                                {delivered === null ? "No targets" : behind ? "Behind pace" : "On pace"}
                            </span>
                        </div>
                        <div className="relative h-1.5 rounded-full bg-muted">
                            {delivered !== null && <div className={cn("absolute inset-y-0 left-0 rounded-full", behind ? "bg-warning" : "bg-primary")} style={{ width: `${delivered}%` }} />}
                            <div className="absolute -inset-y-[3px] w-0.5 rounded-sm bg-foreground" style={{ left: `${time}%` }} title="Time used" />
                        </div>
                        <div className="flex justify-between gap-2.5 text-xs text-muted-foreground">
                            <span className="truncate">{c.advertiser?.name} · {placementLabel(ad.placementKey)}</span>
                            <span className="whitespace-nowrap font-mono">{left <= 0 ? "Last day" : `${left} ${left === 1 ? "day" : "days"} left`}</span>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
