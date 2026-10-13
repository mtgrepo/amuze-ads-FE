import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, X } from "lucide-react";
import { useAdDetailQuery } from "../../Composable/Query/content/useAdDetailQuery";
import { statusLabel } from "../../lib/status";
import { daysUntil, parseLocalDate, placementLabel } from "../Dashboard/admin/dashboard_utils";

const STATUS_TONE: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    paused: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

const dateOnly = (value: unknown) => String(value ?? "").slice(0, 10);

/** Which ad the Performance page is narrowed to: what it is, its schedule, and a way back to all ads. */
export function SelectedAdBar({ adId, onClear }: { adId: string; onClear: () => void }) {
    const { adDetail, isLoading } = useAdDetailQuery(adId);
    const campaign = adDetail?.adSet?.campaign;

    if (isLoading || !adDetail || !campaign) {
        return <div className="h-[68px] animate-pulse rounded-xl border bg-muted/40" />;
    }

    const start = dateOnly(campaign.startDate);
    const end = dateOnly(campaign.endDate);
    const totalDays = Math.max(1, Math.round((parseLocalDate(end).getTime() - parseLocalDate(start).getTime()) / 86_400_000) + 1);
    const left = daysUntil(end);
    const elapsed = Math.min(100, Math.max(0, ((totalDays - Math.max(left + 1, 0)) / totalDays) * 100));

    return (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{campaign.name}</span>
                    <span className={`rounded px-1.5 py-px text-[11px] ${STATUS_TONE[campaign.status] ?? "bg-muted text-muted-foreground"}`}>
                        {statusLabel(campaign.status)}
                    </span>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                    {campaign.advertiser?.name ? `${campaign.advertiser.name} · ` : ""}
                    <span className="capitalize">{String(adDetail.adType ?? "").replace(/_/g, " ")}</span> · {placementLabel(adDetail.placementKey ?? "")}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-xs">
                <div>
                    <div className="text-muted-foreground">Runs</div>
                    <div className="tabular-nums">{format(parseLocalDate(start), "d MMM")} – {format(parseLocalDate(end), "d MMM yyyy")}</div>
                </div>
                <div className="w-32">
                    <div className="text-muted-foreground">{left < 0 ? "Ended" : left === 0 ? "Last day" : `${left} ${left === 1 ? "day" : "days"} left`}</div>
                    <div className="mt-1.5 h-1 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${elapsed}%` }} />
                    </div>
                </div>
                <Link to={`/ads/${adId}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                    Ad details <ArrowRight className="size-3" />
                </Link>
                <button type="button" onClick={onClear} aria-label="Show all ads" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <X className="size-4" />
                </button>
            </div>
        </section>
    );
}

/** The ad step in the Performance filter path; × goes back to all ads. */
export function AdChip({ name, onClear }: { name?: string; onClear: () => void }) {
    return (
        <span className="inline-flex h-8 max-w-56 items-center gap-1 rounded-md border bg-primary/10 pl-2.5 pr-1 text-xs text-foreground">
            <span className="truncate">Ad: {name ?? "…"}</span>
            <button type="button" onClick={onClear} aria-label="Show all ads"
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-3.5" />
            </button>
        </span>
    );
}
