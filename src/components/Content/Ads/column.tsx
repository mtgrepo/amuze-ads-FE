import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { StatusBadge } from "../../Common/status_badge";
import { daysUntil, parseLocalDate, placementLabel, rate } from "../../Dashboard/admin/dashboard_utils";
import AdsActions from "./ads_actions";

const GENDER: Record<string, string> = { all: "Everyone", male: "Men", female: "Women" };
// Age bars are drawn on this scale; targeting allows up to 99.
const AGE_MIN = 13, AGE_MAX = 100;
const agePct = (age: number) => (Math.min(Math.max(age, AGE_MIN), AGE_MAX) - AGE_MIN) / (AGE_MAX - AGE_MIN) * 100;

const day = (value: Date | string) => parseLocalDate(String(value).slice(0, 10));

/** How much of the run has passed, 0–100. */
export function runProgress(start: Date | string, end: Date | string): number {
    const s = day(start).getTime(), e = day(end).getTime(), now = Date.now();
    if (now <= s) return 0;
    if (now >= e + 86_400_000) return 100;
    return Math.round(((now - s) / (e + 86_400_000 - s)) * 100);
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const columns: ColumnDef<AdResponse>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
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
        enableHiding: false,
    },
    {
        id: "ad",
        header: "Ad",
        accessorFn: (row) => row.adSet.campaign.name,
        enableHiding: false,
        cell: ({ row }) => {
            const campaign = row.original.adSet.campaign;
            return (
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info-soft text-xs font-semibold text-info-soft-foreground">{initials(campaign.name)}</span>
                    <div className="min-w-0">
                        <Link to={`/ads/${row.original.id}`} className="block truncate font-medium hover:text-primary hover:underline">{campaign.name}</Link>
                        <span className="block truncate text-xs text-muted-foreground">{campaign.advertiser?.name ?? "—"}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        id: "placement",
        header: "Placement",
        accessorFn: (row) => placementLabel(row.placementKey),
        cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{row.getValue("placement")}</span>,
    },
    {
        id: "audience",
        header: "Audience",
        accessorFn: (row) => row.adSet.gender,
        cell: ({ row }) => {
            const { gender, ageMin, ageMax } = row.original.adSet;
            const left = agePct(ageMin);
            const width = Math.max(agePct(ageMax) - left, 2);
            return (
                <div className="flex w-32 flex-col gap-1.5">
                    <span className="text-[13px] text-muted-foreground">{GENDER[gender] ?? gender}, {ageMin}–{ageMax}</span>
                    <div className="relative h-1 rounded-full bg-muted" title={`Age ${ageMin}–${ageMax}`}>
                        <div className="absolute inset-y-0 rounded-full bg-primary" style={{ left: `${left}%`, width: `${width}%` }} />
                    </div>
                </div>
            );
        },
    },
    {
        id: "package",
        header: "Package and paid",
        accessorFn: (row) => Number(row.adSet.campaign.totalBudget),
        cell: ({ row }) => {
            const c = row.original.adSet.campaign;
            const plan = Number(c.planCost), objectives = Number(c.objectiveCost ?? 0), total = plan + objectives || 1;
            return (
                <div className="flex w-44 flex-col gap-1.5">
                    <span className="whitespace-nowrap text-[13px]">{c.packageQuantity} × {c.packageName} · <span className="font-mono">{Number(c.totalBudget).toLocaleString()}</span> pts</span>
                    <div className="flex h-1 overflow-hidden rounded-full bg-muted">
                        <div className="bg-primary" style={{ width: `${(plan / total) * 100}%` }} />
                        <div className="bg-chart-2" style={{ width: `${(objectives / total) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{objectives ? `+ ${objectives.toLocaleString()} pts objectives` : "Package only"}</span>
                </div>
            );
        },
    },
    {
        id: "schedule",
        header: "Schedule",
        accessorFn: (row) => String(row.adSet.campaign.endDate),
        cell: ({ row }) => {
            const c = row.original.adSet.campaign;
            const progress = runProgress(c.startDate, c.endDate);
            const endingSoon = row.original.status === "active" && daysUntil(String(c.endDate).slice(0, 10)) <= 7;
            return (
                <div className="flex w-36 flex-col gap-1.5">
                    <span className="whitespace-nowrap text-[13px] text-muted-foreground">{format(day(c.startDate), "d MMM")} – {format(day(c.endDate), "d MMM")}</span>
                    <div className="h-1 rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", endingSoon ? "bg-warning" : "bg-primary")} style={{ width: `${progress}%` }} />
                    </div>
                </div>
            );
        },
    },
    {
        id: "impressions",
        header: () => <div className="text-right">Impressions</div>,
        accessorFn: (row) => row.totalImpressions ?? 0,
        cell: ({ row }) => <div className="text-right font-mono tabular-nums">{(row.original.totalImpressions ?? 0).toLocaleString()}</div>,
    },
    {
        id: "ctr",
        header: () => <div className="text-right">CTR</div>,
        accessorFn: (row) => (row.totalImpressions ? (row.totalClicks ?? 0) / row.totalImpressions : 0),
        cell: ({ row }) => <div className="text-right font-mono tabular-nums">{rate(row.original.totalClicks ?? 0, row.original.totalImpressions ?? 0)}</div>,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <AdsActions {...row.original} />,
    },
]

export default columns;
