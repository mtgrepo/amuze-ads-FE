import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import type { VisibilityState } from "@tanstack/react-table";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import columns from "./column";
import { PageSizeComponent } from "../../Common/Pagination/page-number";
import Paginator from "../../Common/Pagination/paginator";
import type { CampaignResponse } from "../../../dto/response/content/campaignResponse";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
type CampaignProps = {
    data: CampaignResponse[];
};

export function CampaignComponent
    ({ data }: CampaignProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });
    const totalRows = table.getFilteredRowModel().rows.length;
    const statusOptions = [
        { value: "draft", label: "Draft" },
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "paused", label: "Paused" },
        { value: "completed", label: "Completed" },
        { value: "rejected", label: "Rejected" },
    ];
        const objectiveOptions = [
        { value: "reach", label: "Reach" },
        { value: "traffic", label: "Traffic"},
        { value: "engagement", label: "Engagement"},
    ]
    return (
        <div className="w-full mx-auto">
            <div className="flex flex-col gap-4 py-4">
                {/* Filter Section */}
                <div className="rounded-xl border-2 p-5 bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold">Search Filters</h3>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                3 filters
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <div className="relative">
                            <label className="absolute -top-2 left-3 px-1 bg-card text-xs font-medium text-muted-foreground z-10">
                                Advertiser
                            </label>
                            <Select
                                value={
                                    (table.getColumn("name")?.getFilterValue() as string) ?? "all"
                                }
                                onValueChange={(value) =>
                                    table.getColumn("name")?.setFilterValue(
                                        value === "all" ? undefined : value
                                    )
                                }
                            >
                                <SelectTrigger className="w-full border-2 rounded-lg">
                                    <SelectValue placeholder="Select service..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {[...new Set(data.map((item) => item.advertiser.name))].map(
                                        (service) => (
                                            <SelectItem key={service} value={service}>
                                                {service}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2 left-3 px-1 bg-card text-xs font-medium text-muted-foreground z-10">
                                Objective
                            </label>
                            <Select
                                value={
                                    (table.getColumn("objective")?.getFilterValue() as string) ?? "all"
                                }
                                onValueChange={(value) =>
                                    table.getColumn("objective")?.setFilterValue(
                                        value === "all" ? undefined : value
                                    )
                                }
                            >
                                <SelectTrigger className="w-full border-2 rounded-lg">
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {objectiveOptions
                                        ?.map((ob: any) => (
                                            <SelectItem key={ob.value} value={String(ob.value)}>
                                               {ob.label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <label className="absolute -top-2 left-3 px-1 bg-card text-xs font-medium text-muted-foreground z-10">
                                Status
                            </label>
                            <Select
                                value={
                                    (table.getColumn("status")?.getFilterValue() as string) ?? "all"
                                }
                                onValueChange={(value) =>
                                    table.getColumn("status")?.setFilterValue(
                                        value === "all" ? undefined : value
                                    )
                                }
                            >
                                <SelectTrigger className="w-full border-2 rounded-lg">
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {statusOptions
                                        ?.map((st: any) => (
                                            <SelectItem key={st.value} value={String(st.value)}>
                                                {st.icon}  {st.label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row gap-3 justify-end">
                    {/* column filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size={"sm"}>
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
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
