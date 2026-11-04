import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { StatusBadge } from "../../Common/status_badge";
import { parseLocalDate, placementLabel } from "../../Dashboard/admin/dashboard_utils";

const GENDER: Record<string, string> = { all: "Everyone", male: "Men", female: "Women" };
// Age bars are drawn on a 13–65 scale; older limits fill to the end.
const AGE_MIN = 13, AGE_MAX = 65;
const agePct = (age: number) => (Math.min(Math.max(age, AGE_MIN), AGE_MAX) - AGE_MIN) / (AGE_MAX - AGE_MIN) * 100;

const day = (value: Date | string) => parseLocalDate(String(value).slice(0, 10));
export const pts = (n: number) => `${n.toLocaleString()} pts`;

/** How much of the run has passed, 0–100. */
export function runProgress(start: Date | string, end: Date | string): number {
    const s = day(start).getTime(), e = day(end).getTime(), now = Date.now();
    if (now <= s) return 0;
    if (now >= e + 86_400_000) return 100;
    return Math.round(((now - s) / (e + 86_400_000 - s)) * 100);
}

// Each ad gets a steady tile colour; white text reads on all of them in both themes.
const TILE_COLORS = ["#3B3FD6", "#0F766E", "#B45309", "#7C3AED", "#BE185D", "#1D4ED8", "#4D7C0F", "#9F1239"];
export function tileColor(id: string): string {
    let hash = 0;
    for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return TILE_COLORS[hash % TILE_COLORS.length];
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/** "Agency › Client" for agency clients, otherwise the advertiser's name. */
export function ownerName(ad: AdResponse): string {
    const advertiser = ad.adSet.campaign.advertiser;
    if (!advertiser) return "—";
    return advertiser.agency?.name ? `${advertiser.agency.name} › ${advertiser.name}` : advertiser.name;
}

export function runDates(ad: AdResponse): string {
    const c = ad.adSet.campaign;
    if (ad.status === "rejected") return "—";
    if (ad.status === "draft") return `Starts ${format(day(c.startDate), "d MMM")}`;
    return `${format(day(c.startDate), "d MMM")} – ${format(day(c.endDate), "d MMM")}`;
}

/** What the paid total is made of, e.g. "50,000 pts package + 4,000 pts objectives". */
export function paidSplit(ad: AdResponse): string {
    const c = ad.adSet.campaign;
    const plan = Number(c.planCost), objectives = Number(c.objectiveCost ?? 0);
    return objectives ? `${pts(plan)} package + ${pts(objectives)} objectives` : "Package only";
}

/** The one thing to do next with this ad, shown as the row's button. */
export function nextStep(ad: AdResponse): string {
    const c = ad.adSet.campaign;
    const fixed: Record<string, string> = { draft: "Pay", pending: "Review", expired: "Restart", rejected: "View" };
    return fixed[ad.status] ?? (runProgress(c.startDate, c.endDate) >= 80 ? "Extend" : "Open");
}

export const ctrText = (ad: AdResponse) =>
    ad.totalImpressions ? `${(((ad.totalClicks ?? 0) / ad.totalImpressions) * 100).toFixed(1)}%` : "—";

export function adColumns(onOpen: (ad: AdResponse) => void): ColumnDef<AdResponse>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all shown ads"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={`Select ${row.original.adSet.campaign.name}`}
                />
            ),
            enableSorting: false,
        },
        {
            id: "ad",
            header: "Ad",
            cell: ({ row }) => {
                const name = row.original.adSet.campaign.name;
                return (
                    <div className="flex items-center gap-3">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[9px] text-[13px] font-semibold text-white" style={{ background: tileColor(row.original.id) }} aria-hidden="true">
                            {initials(name)}
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <button type="button" onClick={() => onOpen(row.original)} className="text-left font-medium hover:text-primary hover:underline">{name}</button>
                            <span className="text-xs text-muted-foreground">{ownerName(row.original)}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: "placement",
            header: "Placement",
            cell: ({ row }) => <span className="whitespace-nowrap text-foreground/80">{placementLabel(row.original.placementKey)}</span>,
        },
        {
            id: "audience",
            header: "Audience",
            cell: ({ row }) => {
                const { gender, ageMin, ageMax } = row.original.adSet;
                const left = agePct(ageMin);
                return (
                    <div className="flex w-[150px] flex-col gap-1.5">
                        <span className="text-[13px] text-foreground/80">{GENDER[gender] ?? gender}, {ageMin}–{ageMax}</span>
                        <div className="relative h-1 rounded-sm bg-muted" title="Age range on a 13–65 scale">
                            <div className="absolute inset-y-0 rounded-sm bg-primary" style={{ left: `${left}%`, width: `${Math.max(agePct(ageMax) - left, 2)}%` }} />
                        </div>
                    </div>
                );
            },
        },
        {
            id: "package",
            header: "Package and paid",
            cell: ({ row }) => {
                const c = row.original.adSet.campaign;
                const plan = Number(c.planCost), objectives = Number(c.objectiveCost ?? 0), total = plan + objectives || 1;
                return (
                    <div className="flex w-[170px] flex-col gap-1.5">
                        <span className="text-[13px] text-foreground/80">{c.packageQuantity} × {c.packageName} · <span className="font-mono">{pts(plan + objectives)}</span></span>
                        <div className="flex h-1 overflow-hidden rounded-sm bg-muted">
                            <div className="bg-primary" style={{ width: `${(plan / total) * 100}%` }} />
                            <div className="bg-primary/40" style={{ width: `${(objectives / total) * 100}%` }} />
                        </div>
                        <span className="whitespace-normal text-xs text-muted-foreground">{paidSplit(row.original)}</span>
                    </div>
                );
            },
        },
        {
            id: "schedule",
            header: "Schedule",
            cell: ({ row }) => {
                const c = row.original.adSet.campaign;
                const progress = row.original.status === "draft" || row.original.status === "rejected" ? 0 : runProgress(c.startDate, c.endDate);
                return (
                    <div className="flex w-[160px] flex-col gap-1.5">
                        <span className="text-[13px] text-foreground/80">{runDates(row.original)}</span>
                        <div className="h-1 rounded-sm bg-muted">
                            <div className={cn("h-1 rounded-sm", progress >= 80 && row.original.status === "active" ? "bg-warning" : "bg-primary")} style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                );
            },
        },
        {
            id: "impressions",
            header: () => <div className="text-right">Impressions</div>,
            cell: ({ row }) => <div className="text-right font-mono tabular-nums">{row.original.totalImpressions ? row.original.totalImpressions.toLocaleString() : "—"}</div>,
        },
        {
            id: "ctr",
            header: () => <div className="text-right">CTR</div>,
            cell: ({ row }) => <div className="text-right font-mono tabular-nums">{ctrText(row.original)}</div>,
        },
        {
            id: "next",
            header: () => <span className="sr-only">Next step</span>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button variant="outline" size="sm" className="h-8 text-[13px]" onClick={() => onOpen(row.original)}>{nextStep(row.original)}</Button>
                </div>
            ),
        },
    ];
}
