
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"
import { CircleCheck, XCircle } from "lucide-react";
import type { AdminUserResponse } from "../../../dto/response/system/adminUserResponse";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

const columns: ColumnDef<AdminUserResponse>[] = [
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
            <div className="capitalize">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
            <div>{row.original.phone ?? "—"}</div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div>{row.original.email ?? "—"}</div>
        ),
    },
    {
        accessorKey: "isActive",
        header: "Active",
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
        accessorKey: "lastLogin",
        header: "Last Sign-in",
        cell: ({ row }) => {
            const lastLogin = row.original.lastLogin;
            return (
                <div>{lastLogin ? new Date(lastLogin).toLocaleString() : "—"}</div>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "First Sign-in",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));

            return (
                <div className="capitalize">
                    {date.toLocaleString()}
                </div>
            )
        },
    },
]

export default columns;