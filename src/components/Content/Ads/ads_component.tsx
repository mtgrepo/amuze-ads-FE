import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { adColumns, ctrText, ownerName, paidSplit, runDates } from "./column";
import { AdSidePanel } from "./ad_side_panel";
import { ExtendDialog } from "./campaign_extensions";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { EXTENDABLE_CAMPAIGN_STATUSES } from "../../../dto/response/campaignExtension/campaignExtensionResponse";
import { PageSizeComponent } from "../../Common/Pagination/page-number";
import Paginator from "../../Common/Pagination/paginator";
import { statusLabel } from "../../../lib/status";
import { daysUntil, placementLabel } from "../../Dashboard/admin/dashboard_utils";
import { useBulkReviewCommand } from "../../../Composable/Command/content/ads/useBulkReviewCommand";

type View = "all" | "pending" | "active" | "ending" | "draft" | "expired";

const endsWithinAWeek = (ad: AdResponse) => {
  const left = daysUntil(String(ad.adSet.campaign.endDate).slice(0, 10));
  return ad.status === "active" && left >= 0 && left <= 7;
};

const VIEWS: { key: View; label: string; test: (ad: AdResponse) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "pending", label: "Needs review", test: (ad) => ad.status === "pending" },
  { key: "active", label: "Live", test: (ad) => ad.status === "active" },
  { key: "ending", label: "Ending soon", test: endsWithinAWeek },
  { key: "draft", label: "Drafts", test: (ad) => ad.status === "draft" },
  { key: "expired", label: "Expired", test: (ad) => ad.status === "expired" || ad.status === "rejected" },
];

const isView = (value: string | null): value is View => VIEWS.some((v) => v.key === value);

const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 }).format(n);

type FilterKey = "advertiser" | "placement" | "package";
const FILTERS: { key: FilterKey; label: string; value: (ad: AdResponse) => string }[] = [
  { key: "advertiser", label: "Advertiser", value: (ad) => ownerName(ad) },
  { key: "placement", label: "Placement", value: (ad) => placementLabel(ad.placementKey) },
  { key: "package", label: "Package", value: (ad) => ad.adSet.campaign.packageName },
];

/** "+ Advertiser" while unset; once picked it turns solid and shows the choice with ✕ to clear it. */
function FilterChip({ label, options, value, onChange }: { label: string; options: string[]; value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = React.useState(false);
  if (value) {
    return (
      <button type="button" onClick={() => onChange(null)} aria-label={`Clear ${label.toLowerCase()} filter`}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 text-[13px] font-medium text-primary">
        {value} ✕
      </button>
    );
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-input bg-card px-3 text-[13px] font-medium text-foreground/80 hover:border-solid hover:text-foreground">
          + {label}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder={`Find ${label.toLowerCase()}`} />
          <CommandList>
            <CommandEmpty>Nothing found</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o} value={o} onSelect={() => { onChange(o); setOpen(false); }}>{o}</CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SummaryCard({ label, value, note, warn }: { label: string; value: string; note: string; warn?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border bg-card px-4 py-3.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-[22px] font-medium tabular-nums", warn && "text-warning")}>{value}</span>
      <span className="text-xs text-muted-foreground">{note}</span>
    </div>
  );
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

function exportCsv(ads: AdResponse[], filename: string) {
  const header = ["Ad", "Advertiser", "Status", "Placement", "Audience", "Package", "Paid (pts)", "Paid for", "Runs", "Impressions", "Clicks", "CTR"];
  const lines = ads.map((ad) => {
    const c = ad.adSet.campaign;
    return [
      c.name, ownerName(ad), statusLabel(ad.status), placementLabel(ad.placementKey),
      `${ad.adSet.gender}, ${ad.adSet.ageMin}–${ad.adSet.ageMax}`, `${c.packageQuantity} × ${c.packageName}`,
      Number(c.planCost) + Number(c.objectiveCost ?? 0), paidSplit(ad), runDates(ad),
      ad.totalImpressions ?? 0, ad.totalClicks ?? 0, ctrText(ad),
    ].map(csvCell).join(",");
  });
  const blob = new Blob([[header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdComponent({ data }: { data: AdResponse[] }) {
  // ?status=pending (from the dashboard or the bell) opens that view.
  const [searchParams, setSearchParams] = useSearchParams();
  const view: View = isView(searchParams.get("status")) ? (searchParams.get("status") as View) : "all";
  const setView = (next: View) => {
    setSearchParams((params) => {
      if (next === "all") params.delete("status"); else params.set("status", next);
      return params;
    });
    setRowSelection({});
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const [now] = React.useState(() => Date.now());
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<FilterKey, string | null>>({ advertiser: null, placement: null, package: null });
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [extending, setExtending] = React.useState(false);
  const { bulkReview, isReviewing } = useBulkReviewCommand();

  const setFilter = (key: FilterKey, value: string | null) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const viewTest = VIEWS.find((v) => v.key === view)!.test;
  const needle = search.trim().toLowerCase();
  const rows = React.useMemo(() => data.filter((ad) =>
    viewTest(ad)
    && FILTERS.every((f) => !filters[f.key] || f.value(ad) === filters[f.key])
    && (!needle || ad.adSet.campaign.name.toLowerCase().includes(needle) || ownerName(ad).toLowerCase().includes(needle))
  ), [data, viewTest, filters, needle]);

  const columns = React.useMemo(() => adColumns((ad) => setOpenId(ad.id)), []);
  const openAd = openId ? data.find((ad) => ad.id === openId) ?? null : null;
  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { rowSelection, pagination },
  });

  // Summary across every ad, whatever view is open.
  const live = data.filter((ad) => ad.status === "active");
  const livePlan = live.reduce((s, ad) => s + Number(ad.adSet.campaign.planCost), 0);
  const liveObjectives = live.reduce((s, ad) => s + Number(ad.adSet.campaign.objectiveCost ?? 0), 0);
  const liveOwners = new Set(live.map((ad) => ad.adSet.campaign.advertiserId)).size;
  const drafts = data.filter((ad) => ad.status === "draft");
  const oldestDraft = drafts.reduce((min, ad) => (ad.createdAt && new Date(ad.createdAt).getTime() < min ? new Date(ad.createdAt).getTime() : min), now);
  const oldestDays = Math.floor((now - oldestDraft) / 86_400_000);

  const totalRows = rows.length;
  const selected = data.filter((ad) => rowSelection[ad.id]);
  const reviewable = selected.filter((ad) => ad.status === "pending");
  const extendable = selected.length === 1 && EXTENDABLE_CAMPAIGN_STATUSES.includes(selected[0].adSet.campaign.status) ? selected[0] : null;
  const review = async (decision: "approve" | "reject") => {
    await bulkReview({ ids: reviewable.map((ad) => ad.id), decision });
    setRowSelection({});
  };

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-[18px] pb-28">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-tight">Ads</h1>
          <p className="text-muted-foreground">Each ad is one campaign: its package, audience and creative together. Click an ad to see it without leaving the list.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" className="bg-card" onClick={() => exportCsv(rows, "ads.csv")}>Export CSV</Button>
          <Button asChild><Link to="/ads/create"><Plus /> Create ad</Link></Button>
        </div>
      </header>

      <section aria-label="Summary" className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <SummaryCard label="Running now" value={live.length.toLocaleString()} note={`across ${liveOwners} ${liveOwners === 1 ? "advertiser" : "advertisers"}`} />
        <SummaryCard label="Paid into live ads" value={`${compact(livePlan + liveObjectives)} pts`} note={`${compact(livePlan)} packages · ${compact(liveObjectives)} objectives`} />
        <SummaryCard label="Ending in 7 days" value={data.filter(endsWithinAWeek).length.toLocaleString()} note="worth suggesting an extension" warn />
        <SummaryCard label="Drafts not paid" value={drafts.length.toLocaleString()} note={drafts.length ? `oldest ${oldestDays} ${oldestDays === 1 ? "day" : "days"}` : "none waiting"} />
      </section>

      <div role="tablist" aria-label="Saved views" className="flex gap-[22px] overflow-x-auto overflow-y-hidden border-b">
        {VIEWS.map((v) => {
          const on = v.key === view;
          return (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setView(v.key)}
              className={cn(
                "-mb-px inline-flex h-9 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 text-sm font-medium text-foreground/70 hover:text-foreground",
                on && "border-primary text-foreground"
              )}
            >
              {v.label}
              <span className={cn("rounded-[10px] px-[7px] py-px font-mono text-xs", on ? "bg-primary/10 text-primary" : "bg-muted text-foreground/70")}>
                {data.filter(v.test).length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-[0_1_300px]">
          <Search className="pointer-events-none absolute left-[11px] top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
            placeholder="Search campaign or advertiser"
            aria-label="Search ads"
            className="h-[38px] w-full rounded-[9px] border border-input bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            value={filters[f.key]}
            onChange={(v) => setFilter(f.key, v)}
            options={[...new Set(data.map(f.value))].sort()}
          />
        ))}
        <span className="ml-auto text-[13px] text-muted-foreground">Showing {totalRows} of {data.length}</span>
      </div>

      <div className="overflow-x-auto rounded-[14px] border bg-card">
        <Table className="min-w-[1200px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={cn("h-auto px-3 py-2.5 text-xs font-medium text-muted-foreground", header.id === "select" && "w-9")}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-transparent data-[state=selected]:bg-primary/5">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-medium">{data.length === 0 ? "No ads yet" : "No ads match"}</span>
                    <span className="text-sm text-muted-foreground">
                      {data.length === 0 ? "Create the first one; it stays a draft until it's paid." : "Try another view or clear the filters."}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalRows > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <PageSizeComponent
            pageSize={pagination.pageSize}
            totalRows={totalRows}
            onChange={(size) => setPagination(() => ({ pageIndex: 0, pageSize: size === "all" ? totalRows : size }))}
          />
          <Paginator
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(pageNumber) => table.setPageIndex(pageNumber - 1)}
            showPreviousNext
          />
        </div>
      )}

      {selected.length > 0 && (
        <div role="toolbar" aria-label="Bulk actions" className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl bg-zinc-900 py-2 pl-4 pr-2 text-white shadow-[0_16px_40px_rgba(24,24,27,0.28)] ring-1 ring-white/10">
          <span className="mr-1.5 font-mono text-[13px]">{selected.length} selected</span>
          {[
            { label: "Approve", disabled: isReviewing || reviewable.length === 0, onClick: () => review("approve"), title: "Only ads waiting for review can be approved" },
            { label: "Reject", disabled: isReviewing || reviewable.length === 0, onClick: () => review("reject"), title: "Only ads waiting for review can be rejected" },
            { label: "Extend…", disabled: !extendable, onClick: () => setExtending(true), title: "Select one live or expired ad to extend" },
            { label: "Export", disabled: false, onClick: () => exportCsv(selected, "selected-ads.csv"), title: undefined },
          ].map((b) => (
            <button key={b.label} type="button" disabled={b.disabled} onClick={b.onClick} title={b.disabled ? b.title : undefined}
              className="h-[34px] rounded-lg bg-white/10 px-3 text-[13px] font-medium hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10">
              {b.label}
            </button>
          ))}
          <button type="button" aria-label="Clear selection" onClick={() => setRowSelection({})} className="h-[34px] rounded-lg px-3 text-[13px] hover:bg-white/20">✕</button>
        </div>
      )}

      {openAd && <AdSidePanel key={openAd.id} ad={openAd} onClose={() => setOpenId(null)} />}
      {extendable && extending && (
        <ExtendDialog campaign={extendable.adSet.campaign} isAdmin open={extending} onOpenChange={(o) => { setExtending(o); if (!o) setRowSelection({}); }} />
      )}
    </div>
  );
}
