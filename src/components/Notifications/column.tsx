
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"
import { CircleCheck, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import type { NotificationsResponse } from "../../dto/response/notifications/notificationsResponse";

const columns: ColumnDef<NotificationsResponse>[] = [
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
        id: "name",
        accessorFn: (row) => row.advertiser.name,
        header: "Advertiser",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div>{row.getValue("title")}</div>
        ),
    },
    {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("message")}</div>
        ),
    },
    {
        accessorKey: "read",
        header: "Read",
        cell: ({ row }) => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-pointer relative inline-flex">
                            {row.getValue("read") === true ? (
                                <CircleCheck color="green" />
                            ) : (
                                <XCircle color="red" />
                            )}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                        {row.getValue("read") === true ? "Read" : "Unread"}
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
]

export default columns;