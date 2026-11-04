import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import columns from "./column";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { PageSizeComponent } from "../../Common/Pagination/page-number";
import Paginator from "../../Common/Pagination/paginator";
import { daysUntil } from "../../Dashboard/admin/dashboard_utils";
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
  };

  const [search, setSearch] = React.useState("");
  const [gender, setGender] = React.useState("all");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const { bulkReview, isReviewing } = useBulkReviewCommand();

  const viewTest = VIEWS.find((v) => v.key === view)!.test;
  const needle = search.trim().toLowerCase();
  const rows = React.useMemo(() => data.filter((ad) =>
    viewTest(ad)
    && (gender === "all" || ad.adSet.gender === gender)
    && (!needle || ad.adSet.campaign.name.toLowerCase().includes(needle) || (ad.adSet.campaign.advertiser?.name ?? "").toLowerCase().includes(needle))
  ), [data, viewTest, gender, needle]);

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { sorting, columnVisibility, rowSelection, pagination },
  });

  const totalRows = rows.length;
  const selected = data.filter((ad) => rowSelection[ad.id]);
  const reviewable = selected.filter((ad) => ad.status === "pending");
  const review = async (decision: "approve" | "reject") => {
    await bulkReview({ ids: reviewable.map((ad) => ad.id), decision });
    setRowSelection({});
  };
  const filtered = gender !== "all" || !!needle;

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-5 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Ads</h1>
          <p className="text-sm text-muted-foreground">Each ad is one campaign: its package, audience and creative together.</p>
        </div>
        <Button asChild>
          <Link to="/ads/create"><Plus /> Create ad</Link>
        </Button>
      </div>

      <div role="tablist" aria-label="Saved views" className="flex gap-6 overflow-x-auto overflow-y-hidden border-b">
        {VIEWS.map((v) => {
          const on = v.key === view;
          return (
            <button
              key={v.key}
              role="tab"
              aria-selected={on}
              onClick={() => setView(v.key)}
              className={cn(
                "-mb-px flex h-10 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 text-sm font-medium text-muted-foreground hover:text-foreground",
                on && "border-primary text-foreground"
              )}
            >
              {v.label}
              <span className={cn("rounded-full px-2 py-px font-mono text-xs", on ? "bg-info-soft text-info-soft-foreground" : "bg-muted text-muted-foreground")}>
                {data.filter(v.test).length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
            placeholder="Search campaign or advertiser"
            aria-label="Search ads"
            className="bg-card pl-9"
          />
        </div>
        <Select value={gender} onValueChange={(v) => { setGender(v); setPagination((p) => ({ ...p, pageIndex: 0 })); }}>
          <SelectTrigger className="w-40 bg-card" aria-label="Audience">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any audience</SelectItem>
            <SelectItem value="female">Women</SelectItem>
            <SelectItem value="male">Men</SelectItem>
          </SelectContent>
        </Select>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setGender("all"); }}>
            <X /> Clear
          </Button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">Showing {totalRows} of {data.length}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-card">Columns <ChevronDown /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter((c) => c.getCanHide()).map((c) => (
              <DropdownMenuCheckboxItem key={c.id} className="capitalize" checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(!!v)}>
                {c.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 text-xs font-medium text-muted-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="data-[state=selected]:bg-info-soft/60">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
        <div role="toolbar" aria-label="Selected ads" className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl bg-foreground py-2 pl-4 pr-2 text-background shadow-xl">
          <span className="mr-1 font-mono text-sm">{selected.length} selected</span>
          {reviewable.length > 0 ? (
            <>
              <Button size="sm" variant="secondary" disabled={isReviewing} onClick={() => review("approve")}>
                Approve {reviewable.length < selected.length ? reviewable.length : ""}
              </Button>
              <Button size="sm" variant="secondary" disabled={isReviewing} onClick={() => review("reject")}>
                Reject {reviewable.length < selected.length ? reviewable.length : ""}
              </Button>
            </>
          ) : (
            <span className="text-xs opacity-70">Only ads waiting for review can be approved or rejected</span>
          )}
          <Button size="icon" variant="ghost" className="size-8 text-background hover:bg-background/15 hover:text-background" aria-label="Clear selection" onClick={() => setRowSelection({})}>
            <X />
          </Button>
        </div>
      )}
    </div>
  );
}
