import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Coins } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageSizeComponent } from "../../Common/Pagination/page-number";
import Paginator from "../../Common/Pagination/paginator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { POINT_TYPE_LABELS } from "../../../dto/response/points/pointsResponse";
import type { PointsLedgerResponse } from "../../../dto/response/points/pointsResponse";
import type { AdvertisersResponse } from "../../../dto/response/advertisers/advertisersResponse";
import columns from "./column";

const ALL = "all";

/** Every wallet's points history, filterable by advertiser and type. */
export function PointsComponent({ ledger, advertisers }: { ledger: PointsLedgerResponse; advertisers: AdvertisersResponse[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

    const table = useReactTable({
        data: ledger.entries,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: setPagination,
        state: { sorting, columnFilters, pagination },
    });
    const totalRows = table.getFilteredRowModel().rows.length;

    // Only standalone advertisers and agencies have wallets; agency clients spend their agency's points.
    const walletOwners = advertisers
        .filter((a) => a.type === "agency" || !a.agencyId)
        .sort((a, b) => a.name.localeCompare(b.name));
    const advertiserId = table.getColumn("advertiser")?.getFilterValue() as string | undefined;
    const selected = walletOwners.find((a) => a.id === advertiserId);
    // Every balance change goes through the ledger, so the newest entry holds the current balance.
    const selectedBalance = advertiserId
        ? ledger.entries.find((e) => e.advertiserId === advertiserId)?.balanceAfter ?? 0
        : ledger.totalBalance;
    const activeFilters = columnFilters.length;

    return (
        <div className="w-full mx-auto">
            <div className="flex flex-col gap-4 py-4">
                {/* Balance */}
                <div className="rounded-xl border-2 p-5 bg-card shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-primary/10 text-primary"><Coins className="h-5 w-5" /></span>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {selected ? `${selected.name}'s balance` : "Points held by all customers"}
                            </p>
                            <p className="text-2xl font-bold tabular-nums">
                                {selectedBalance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">points</span>
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">1 point = 1 MMK</p>
                </div>

                {/* Filter Section */}
                <div className="rounded-xl border-2 p-5 bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold">Search Filters</h3>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                {activeFilters} {activeFilters === 1 ? "filter" : "filters"}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="absolute -top-2 left-3 px-1 bg-card text-xs font-medium text-muted-foreground z-10">
                                Advertiser
                            </label>
                            <Select
                                value={advertiserId ?? ALL}
                                onValueChange={(value) => {
                                    table.getColumn("advertiser")?.setFilterValue(value === ALL ? undefined : value);
                                    table.setPageIndex(0);
                                }}
                            >
                                <SelectTrigger className="w-full border-2 rounded-lg">
                                    <SelectValue placeholder="Select advertiser..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All advertisers</SelectItem>
                                    {walletOwners.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.name}{a.type === "agency" ? " (Agency)" : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2 left-3 px-1 bg-card text-xs font-medium text-muted-foreground z-10">
                                Type
                            </label>
                            <Select
                                value={(table.getColumn("type")?.getFilterValue() as string) ?? ALL}
                                onValueChange={(value) => {
                                    table.getColumn("type")?.setFilterValue(value === ALL ? undefined : value);
                                    table.setPageIndex(0);
                                }}
                            >
                                <SelectTrigger className="w-full border-2 rounded-lg">
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All</SelectItem>
                                    {Object.entries(POINT_TYPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No points activity{activeFilters ? " for these filters" : " yet"}.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {totalRows} record(s).
                </div>
                {totalRows > 0 && (
                    <div className="flex items-center gap-3">
                        <PageSizeComponent
                            pageSize={pagination.pageSize}
                            totalRows={totalRows}
                            onChange={(size) =>
                                setPagination(() => ({
                                    pageIndex: 0,
                                    pageSize: size === "all" ? totalRows : size,
                                }))
                            }
                        />
                        <Paginator
                            currentPage={table.getState().pagination.pageIndex + 1}
                            totalPages={table.getPageCount()}
                            onPageChange={(pageNumber) => table.setPageIndex(pageNumber - 1)}
                            showPreviousNext
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
