import * as React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { downloadExcel, excelSheet, type ExcelColumn } from "@/lib/excel";
import type { ActivityLog, ActorType } from "../../dto/response/activity/activityResponse";
import type { ActivityFilters } from "../../dto/input/activity/activityFilters";
import type { AdResponse } from "../../dto/response/content/adResponse";
import { useActivityQuery } from "../../Composable/Query/activity/useActivityQuery";
import { useAdListQuery } from "../../Composable/Query/content/useAdListQuery";
import { useAdvertiserOptionsQuery } from "../../Composable/Query/dailyAdStats/useAdvertiserOptionsQuery";
import { getActivity } from "../../http/apis/activity/activityApi";
import { ACTIVITY_TYPES, activityDetailText, activityDot, activityReason, activityWhen, activityWho } from "../../lib/activity";
import { parseLocalDate, toLocalDateString, type DateRange } from "../Dashboard/admin/dashboard_utils";
import { TablePagination } from "../Common/Pagination/table_pagination";
import { ActivityDetail } from "./activity_list";

const ANY = "any";

const WHO: { value: ActorType | typeof ANY; label: string }[] = [
    { value: ANY, label: "Anyone" },
    { value: "admin", label: "Admins" },
    { value: "advertiser", label: "Advertisers" },
    { value: "system", label: "System" },
];

const ACTOR_LABEL: Record<ActorType, string> = { admin: "Admin", advertiser: "Advertiser", system: "Automatic" };

const CHIP = "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-medium";
const CHIP_OFF = "border-input bg-card text-foreground/80 hover:text-foreground";
const CHIP_ON = "border-primary/25 bg-primary/10 text-primary";

/** The ad (and its advertiser) a row is about, resolved from the lists already loaded. */
interface About {
    adId?: string;
    adName?: string;
    advertiserId?: string;
    advertiserName?: string;
}

/** "+ Advertiser" until one is picked; then the name with ✕ to clear it. Searchable, as the list can be long. */
function AdvertiserChip({ options, value, onChange }: { options: { id: string; name: string }[]; value: string | null; onChange: (id: string | null) => void }) {
    const [open, setOpen] = React.useState(false);
    const picked = value ? options.find((o) => o.id === value) : undefined;
    if (value) {
        return (
            <button type="button" onClick={() => onChange(null)} aria-label="Clear advertiser filter" className={cn(CHIP, CHIP_ON)}>
                {picked?.name ?? "Advertiser"} ✕
            </button>
        );
    }
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button" className={cn(CHIP, "border-dashed border-input bg-card text-foreground/80 hover:border-solid hover:text-foreground")}>+ Advertiser</button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-0">
                <Command>
                    <CommandInput placeholder="Find advertiser" />
                    <CommandList>
                        <CommandEmpty>Nothing found</CommandEmpty>
                        <CommandGroup>
                            {options.map((o) => (
                                <CommandItem key={o.id} value={`${o.name} ${o.id}`} onSelect={() => { onChange(o.id); setOpen(false); }}>{o.name}</CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

/** "Any time" until a range is applied; From/To days, both inclusive. */
function DateRangeChip({ value, onChange }: { value: DateRange | null; onChange: (range: DateRange | null) => void }) {
    const [today] = React.useState(() => toLocalDateString(new Date()));
    const [open, setOpen] = React.useState(false);
    const [draft, setDraft] = React.useState<DateRange>(value ?? { from: today, to: today });
    const label = value
        ? value.from === value.to
            ? format(parseLocalDate(value.from), "d MMM yyyy")
            : `${format(parseLocalDate(value.from), "d MMM")} – ${format(parseLocalDate(value.to), "d MMM yyyy")}`
        : "Any time";

    return (
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(value ?? { from: today, to: today }); }}>
            <PopoverTrigger asChild>
                <button type="button" className={cn(CHIP, value ? CHIP_ON : CHIP_OFF)}>
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {label}
                </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="flex w-72 flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        From
                        <Input type="date" value={draft.from} max={draft.to} onChange={(e) => e.target.value && setDraft({ ...draft, from: e.target.value })} />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                        To
                        <Input type="date" value={draft.to} min={draft.from} max={today} onChange={(e) => e.target.value && setDraft({ ...draft, to: e.target.value })} />
                    </label>
                </div>
                <div className="flex gap-2">
                    {value && <Button size="sm" variant="outline" className="flex-1" onClick={() => { onChange(null); setOpen(false); }}>Any time</Button>}
                    <Button size="sm" className="flex-1" disabled={draft.from > draft.to} onClick={() => { onChange(draft); setOpen(false); }}>Apply</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

function AboutCell({ about }: { about: About }) {
    if (!about.adName && !about.advertiserName) return <span className="text-muted-foreground">—</span>;
    return (
        <div className="flex min-w-0 flex-col">
            {about.adName && (about.adId
                ? <Link to={`/ads/${about.adId}`} className="truncate font-medium text-primary hover:underline">{about.adName}</Link>
                : <span className="truncate font-medium">{about.adName}</span>)}
            {about.advertiserName && (about.adName
                ? <span className="truncate text-xs text-muted-foreground">{about.advertiserName}</span>
                : about.advertiserId
                    ? <Link to={`/advertisers/${about.advertiserId}`} className="truncate font-medium text-primary hover:underline">{about.advertiserName}</Link>
                    : <span className="truncate font-medium">{about.advertiserName}</span>)}
        </div>
    );
}

function LoadingRows({ rows }: { rows: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                    {[24, 20, 48, 28].map((w, j) => (
                        <TableCell key={j} className="p-3"><div className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w + ((i * 7) % 20)}%` }} /></TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

/** Settings → Activity log: who did what, and when, across the portal. Filtered and paged on the server. */
export function ActivityLogComponent() {
    const [type, setType] = React.useState("all");
    const [who, setWho] = React.useState<ActorType | typeof ANY>(ANY);
    const [advertiserId, setAdvertiserId] = React.useState<string | null>(null);
    const [range, setRange] = React.useState<DateRange | null>(null);
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 20 });
    const [exporting, setExporting] = React.useState(false);

    const filters: ActivityFilters = {
        entityType: ACTIVITY_TYPES.find((t) => t.key === type)?.value,
        actorType: who === ANY ? undefined : who,
        advertiserId: advertiserId ?? undefined,
        from: range?.from,
        to: range?.to,
    };
    const { activity, total, isLoading, isFetching } = useActivityQuery({ ...filters, page: pagination.pageIndex + 1, limit: pagination.pageSize });

    // Filters change what's on every page, so start again from the first.
    const refilter = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPagination((p) => ({ ...p, pageIndex: 0 })); };

    const { advertisers } = useAdvertiserOptionsQuery();
    const { adListData } = useAdListQuery();
    const advertiserName = React.useMemo(() => new Map(advertisers.map((a) => [a.id, a.name])), [advertisers]);
    const adByCampaign = React.useMemo(() => new Map(((adListData ?? []) as AdResponse[]).map((ad) => [ad.adSet.campaign.id, ad])), [adListData]);
    const advertiserOptions = React.useMemo(() => [...advertisers].sort((a, b) => a.name.localeCompare(b.name)), [advertisers]);

    const about = React.useCallback((log: ActivityLog): About => {
        const ad = log.campaignId ? adByCampaign.get(log.campaignId) : undefined;
        const ownerId = ad?.adSet.campaign.advertiser?.id ?? log.advertiserId ?? undefined;
        return {
            adId: ad?.id,
            adName: ad?.adSet.campaign.name ?? (log.campaignId ? "Deleted ad" : undefined),
            advertiserId: ownerId,
            advertiserName: ad?.adSet.campaign.advertiser?.name ?? (ownerId ? advertiserName.get(ownerId) : undefined),
        };
    }, [adByCampaign, advertiserName]);

    const exportLog = async () => {
        setExporting(true);
        try {
            const response = await getActivity({ ...filters, all: true });
            const items: ActivityLog[] = response?.data?.items ?? [];
            const columns: ExcelColumn<ActivityLog>[] = [
                { header: "When", value: (log) => log.createdAt, format: "datetime" },
                { header: "Who", value: (log) => activityWho(log) },
                { header: "Action", value: (log) => log.action },
                { header: "What", value: (log) => log.summary },
                { header: "Changes", value: (log) => activityDetailText(log) },
                { header: "Reason", value: (log) => activityReason(log) },
                { header: "Ad", value: (log) => about(log).adName },
                { header: "Advertiser", value: (log) => about(log).advertiserName },
            ];
            await downloadExcel("activity-log", [excelSheet("Activity log", columns, items)]);
        } catch (error) {
            toast.error("Couldn't export", { description: error instanceof Error ? error.message : undefined });
        } finally {
            setExporting(false);
        }
    };

    const filtered = type !== "all" || who !== ANY || !!advertiserId || !!range;

    return (
        <div className="mx-auto flex w-full min-w-0 flex-col gap-[18px]">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[26px] font-semibold tracking-tight">Activity log</h1>
                    <p className="text-muted-foreground">Who did what, and when, across the portal.</p>
                </div>
                <Button variant="outline" className="bg-card" onClick={() => void exportLog()} disabled={exporting || total === 0}>
                    {exporting ? "Exporting…" : "Export Excel"}
                </Button>
            </header>

            <div className="flex flex-wrap items-center gap-2.5">
                <div role="group" aria-label="Type" className="flex flex-wrap gap-1.5">
                    {ACTIVITY_TYPES.map((t) => (
                        <button key={t.key} type="button" aria-pressed={type === t.key} onClick={() => refilter(setType)(t.key)}
                            className={cn(CHIP, type === t.key ? CHIP_ON : CHIP_OFF)}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
                <Select value={who} onValueChange={(v) => refilter(setWho)(v as ActorType | typeof ANY)}>
                    <SelectTrigger size="sm" aria-label="Who" className="h-8 w-[136px] rounded-full bg-card text-[13px] font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {WHO.map((w) => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <AdvertiserChip options={advertiserOptions} value={advertiserId} onChange={refilter(setAdvertiserId)} />
                <DateRangeChip value={range} onChange={refilter(setRange)} />
            </div>

            <div className={cn("rounded-[14px] border bg-card transition-opacity", isFetching && !isLoading && "opacity-70")}>
                <div className="overflow-x-auto rounded-t-[14px]">
                    <Table className="min-w-[960px]">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                {["When", "Who", "What", "About"].map((h) => (
                                    <TableHead key={h} className={cn("h-auto px-3 py-2.5 text-xs font-medium text-muted-foreground", h === "What" && "w-[44%]")}>{h}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? <LoadingRows rows={8} /> : activity.length ? activity.map((log) => (
                                <TableRow key={log.id} className="hover:bg-transparent">
                                    <TableCell className="whitespace-nowrap p-3 align-top">{activityWhen(log.createdAt)}</TableCell>
                                    <TableCell className="p-3 align-top">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{activityWho(log)}</span>
                                            <span className="text-xs text-muted-foreground">{ACTOR_LABEL[log.actorType] ?? log.actorType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-normal p-3 align-top">
                                        <div className="flex gap-2.5">
                                            <span className={cn("mt-1.5 size-[7px] shrink-0 rounded-full", activityDot(log))} aria-hidden="true" />
                                            <div className="min-w-0">
                                                <span className="font-medium">{log.summary}</span>
                                                <ActivityDetail log={log} />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[260px] p-3 align-top"><AboutCell about={about(log)} /></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="font-medium">{filtered ? "Nothing matches" : "Nothing recorded yet"}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {filtered ? "Try another type, person or date range." : "Actions are recorded from now on."}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <TablePagination total={total} pageIndex={pagination.pageIndex} pageSize={pagination.pageSize} onChange={setPagination} />
            </div>
        </div>
    );
}
