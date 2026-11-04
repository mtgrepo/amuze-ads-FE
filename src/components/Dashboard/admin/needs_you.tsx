import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAttentionQuery } from "../../../Composable/Query/dashboard/useAttentionQuery";
import { useAdvertisersQuery } from "../../../Composable/Query/advertiser/useAdvertisersQuery";
import { useActivePackagesQuery } from "../../../Composable/Query/adPackage/useActivePackagesQuery";
import { useBalancesQuery } from "../../../Composable/Query/points/useBalancesQuery";
import type { AdvertisersResponse } from "../../../dto/response/advertisers/advertisersResponse";
import { waitingLabel } from "./dashboard_utils";

type Tone = "warning" | "info" | "neutral" | "danger";

const TONE: Record<Tone, string> = {
    warning: "bg-warning-soft text-warning-soft-foreground",
    info: "bg-info-soft text-info-soft-foreground",
    neutral: "bg-muted text-foreground",
    danger: "bg-destructive-soft text-destructive-soft-foreground",
};

interface Card {
    count: number;
    title: string;
    desc: string;
    action: string;
    to: string;
    tone: Tone;
}

/** The day's to-do list: what is waiting on an admin, one card per kind. */
export function NeedsYou() {
    const { attention } = useAttentionQuery();
    const { advertisersList } = useAdvertisersQuery();
    const { packages } = useActivePackagesQuery();
    // Only standalone advertisers and agencies have wallets.
    const owners = ((advertisersList ?? []) as AdvertisersResponse[]).filter((a) => !a.agencyId && a.status === "active");
    const { balances } = useBalancesQuery(owners.map((a) => a.id));

    const cheapest = [...packages].sort((a, b) => a.price - b.price)[0];
    const low = cheapest ? owners.filter((a) => balances.has(a.id) && balances.get(a.id)! < cheapest.price) : [];

    const pending = attention?.pendingCount ?? 0;
    const extensions = attention?.pendingExtensions ?? [];
    const ending = attention?.endingSoon ?? [];

    const cards: Card[] = [
        {
            count: pending, tone: "warning", title: pending === 1 ? "Ad waiting for review" : "Ads waiting for review", action: "Review",
            desc: pending ? `Paid and waiting. Oldest has waited ${waitingLabel(attention!.pending[0].waitingSince)}.` : "Nothing waiting for review.",
            to: pending === 1 ? `/ads/${attention!.pending[0].adId}` : "/ads?status=pending",
        },
        {
            count: extensions.length, tone: "info", title: extensions.length === 1 ? "Extension request" : "Extension requests", action: "Approve or reject",
            desc: extensions.length
                ? extensions.slice(0, 2).map((e) => `${e.campaignName} (+${e.days} ${e.days === 1 ? "day" : "days"})`).join(" and ") + (extensions.length > 2 ? ` and ${extensions.length - 2} more.` : ".")
                : "No extensions waiting.",
            to: extensions[0] ? `/ads/${extensions[0].adId}` : "/ads",
        },
        {
            count: ending.length, tone: "neutral", title: ending.length === 1 ? "Campaign ending this week" : "Campaigns ending this week", action: "See campaigns",
            desc: ending.length ? "Good moment to suggest an extension to the advertiser." : "Nothing ends this week.",
            to: ending.length === 1 ? `/ads/${ending[0].adId}` : "/ads?status=ending",
        },
        {
            count: low.length, tone: "danger", title: low.length === 1 ? "Advertiser low on points" : "Advertisers low on points", action: "Top up",
            desc: low.length === 1
                ? `${low[0].name} has ${balances.get(low[0].id)!.toLocaleString()} pts left, less than one ${cheapest.name} package.`
                : low.length ? `${low.length} advertisers have less than one ${cheapest.name} package.` : "Every advertiser can buy at least one package.",
            to: low.length === 1 ? `/advertisers/${low[0].id}` : "/points",
        },
    ];

    return (
        <section aria-labelledby="needs-you" className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2.5">
                <h2 id="needs-you" className="text-[15px] font-semibold">Needs you</h2>
                <span className="text-[13px] text-muted-foreground">Clear these and the day is done</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                {cards.map((c) => (
                    <div key={c.title} className="flex flex-col gap-2.5 rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-2.5">
                            <span className={cn("inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-[9px] px-1.5 font-mono text-base font-medium", c.count ? TONE[c.tone] : TONE.neutral)}>{c.count}</span>
                            <span className="font-medium leading-snug">{c.title}</span>
                        </div>
                        <p className="text-[13px] leading-relaxed text-muted-foreground">{c.desc}</p>
                        <Link to={c.to} className="mt-auto inline-flex h-8 items-center self-start rounded-[9px] border bg-card px-3.5 text-[13px] font-medium hover:bg-accent">
                            {c.action} →
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
