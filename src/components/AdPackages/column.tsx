
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"
import { CircleCheck, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { daysLabel, type AdPackageResponse } from "../../dto/response/adPackage/adPackageResponse";
import PackageActions from "./package_actions";

const columns: ColumnDef<AdPackageResponse>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div>{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "durationDays",
        header: "Days Per Unit",
        cell: ({ row }) => (
            <div>{daysLabel(row.original.durationDays)}</div>
        ),
    },
    {
        accessorKey: "price",
        header: "Price Per Unit",
        cell: ({ row }) => (
            <div>{row.original.price.toLocaleString()} pts</div>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="max-w-xs truncate">{row.original.description ?? "—"}</div>
        ),
    },
    {
        accessorKey: "sortOrder",
        header: "Order",
    },
    {
        accessorKey: "isActive",
        header: "Active",
        // Filter values arrive as the strings "true" / "false" from the status select.
        filterFn: (row, id, value) => String(row.getValue(id)) === value,
        cell: ({ row }) => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-pointer relative inline-flex">
                            {row.getValue("isActive") ? (
                                <CircleCheck color="green" />
                            ) : (
                                <XCircle color="red" />
                            )}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                        {row.getValue("isActive") ? "Active" : "Inactive"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));

            return (
                <div className="capitalize">
                    {date.toLocaleString()}
                </div>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const adPackage = row.original

            return (
                <PackageActions {...adPackage} />
            )
        },
    },
]

export default columns;
