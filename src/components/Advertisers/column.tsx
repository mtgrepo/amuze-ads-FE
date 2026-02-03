
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"
import type { AdvertisersResponse } from "../../dto/response/Advertisers/advertisersResponse";
import AdvertiserActions from "./advertiser_actions";
import { CircleCheck, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const columns: ColumnDef<AdvertisersResponse>[] = [
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
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("email")}</div>
        ),
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("phone")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-pointer relative inline-flex">
                            {row.getValue("status") ? (
                                <CircleCheck color="green" />
                            ) : (
                                <XCircle color="red" />
                            )}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                        {row.getValue("status") ? "Active" : "Inactive"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
    },
    {
        accessorKey: "verified",
        header: "Verified",
        cell: ({ row }) => {
            const isVerified = row.getValue("verified");
            // const driver = row.original;

            return (
                <div className="flex items-center gap-2">
                    {isVerified ? (
                        <span className="text-green-600">Verified</span>
                    ) : (
                        <>
                            <span className="text-destructive">Not Verified</span>
                        </>
                    )}
                </div>
            );
        },
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
            const advertiser = row.original

            return (
                <AdvertiserActions {...advertiser} />
            )
        },
    },
]

export default columns;