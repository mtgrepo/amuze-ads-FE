import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "../../../lib/utils";
import { POINT_TYPE_LABELS } from "../../../dto/response/points/pointsResponse";
import type { AdminLedgerEntry } from "../../../dto/response/points/pointsResponse";

const columns: ColumnDef<AdminLedgerEntry>[] = [
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
            <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>
        ),
    },
    {
        // Filtered by the wallet's id; shows its name.
        id: "advertiser",
        accessorFn: (row) => row.advertiser?.id ?? row.advertiserId,
        header: "Advertiser",
        filterFn: "equals",
        cell: ({ row }) => (
            <div>
                {row.original.advertiser?.name ?? "—"}
                {row.original.advertiser?.type === "agency" && <span className="ml-1.5 text-xs text-muted-foreground">Agency</span>}
            </div>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        filterFn: "equals",
        cell: ({ row }) => (
            <div>{POINT_TYPE_LABELS[row.original.type] ?? row.original.type}</div>
        ),
    },
    {
        accessorKey: "amount",
        header: "Points",
        cell: ({ row }) => {
            const amount = row.original.amount;
            return (
                <div className={cn("font-medium tabular-nums", amount >= 0 ? "text-green-600" : "text-destructive")}>
                    {amount >= 0 ? "+" : ""}{amount.toLocaleString()}
                </div>
            );
        },
    },
    {
        accessorKey: "balanceAfter",
        header: "Balance",
        cell: ({ row }) => (
            <div className="tabular-nums">{row.original.balanceAfter.toLocaleString()}</div>
        ),
    },
    {
        accessorKey: "note",
        header: "Note",
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.original.note ?? "—"}</div>
        ),
    },
]

export default columns;
