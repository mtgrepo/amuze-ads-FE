import { Link } from "react-router-dom";
import { ArrowRight, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAttentionQuery } from "../../../Composable/Query/dashboard/useAttentionQuery";
import { endsInLabel, waitingLabel } from "./dashboard_utils";

type Tone = "warning" | "info" | "neutral";

const TONE: Record<Tone, string> = {
    warning: "bg-warning-soft text-warning-soft-foreground",
    info: "bg-info-soft text-info-soft-foreground",
    neutral: "bg-muted text-foreground",
};

interface Card {
    key: string;
    count: number;
    title: string;
    lines: string[];
    to: string;
    action: string;
    tone: Tone;
}

/** The day's to-do list: one card per kind of thing waiting on an admin. */
export function NeedsYou() {
    const { attention, isLoading } = useAttentionQuery();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-xl border bg-card" />)}
            </div>
        );
    }

    const cards: Card[] = attention ? ([
        {
            key: "review", count: attention.pendingCount, tone: "warning", title: "Ads waiting for review", action: "Review",
            lines: attention.pending.slice(0, 2).map((p) => `${p.campaignName} · ${p.advertiserName} · ${waitingLabel(p.waitingSince)}`),
            to: attention.pendingCount === 1 ? `/ads/${attention.pending[0].adId}` : "/ads?status=pending",
        },
        {
            key: "extensions", count: attention.pendingExtensionCount, tone: "info", title: "Extension requests", action: "Approve or reject",
            lines: attention.pendingExtensions.slice(0, 2).map((e) => `${e.campaignName} · +${e.days} ${e.days === 1 ? "day" : "days"} · ${e.amount.toLocaleString()} pts`),
            to: attention.pendingExtensions[0] ? `/ads/${attention.pendingExtensions[0].adId}` : "/ads",
        },
        {
            key: "ending", count: attention.endingSoon.length, tone: "neutral", title: `Ending within ${attention.endingSoonDays} days`, action: "Suggest an extension",
            lines: attention.endingSoon.slice(0, 2).map((c) => `${c.campaignName} · ${endsInLabel(c.endDate).toLowerCase().replace(/^(\d)/, "in $1")}`),
            to: attention.endingSoon.length === 1 ? `/ads/${attention.endingSoon[0].adId}` : "/ads",
        },
    ] satisfies Card[]).filter((c) => c.count > 0) : [];

    if (cards.length === 0) {
        return (
            <section className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4">
                <CircleCheck className="size-5 text-success" />
                <div>
                    <div className="text-sm font-medium">You're all caught up</div>
                    <div className="text-xs text-muted-foreground">Ads to review, extension requests and campaigns about to end show up here.</div>
                </div>
            </section>
        );
    }

    return (
        <section aria-labelledby="needs-you" className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
                <h2 id="needs-you" className="text-sm font-semibold">Needs you</h2>
                <span className="text-xs text-muted-foreground">Clear these and the day is done</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {cards.map((c) => (
                    <div key={c.key} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <span className={cn("flex h-9 min-w-9 items-center justify-center rounded-lg px-2 font-mono text-base font-medium", TONE[c.tone])}>{c.count}</span>
                            <span className="font-medium leading-snug">{c.title}</span>
                        </div>
                        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {c.lines.map((l) => <li key={l} className="truncate">{l}</li>)}
                            {c.count > c.lines.length && <li>and {c.count - c.lines.length} more</li>}
                        </ul>
                        <Link to={c.to} className="group mt-auto inline-flex items-center gap-1 self-start rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                            {c.action} <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
