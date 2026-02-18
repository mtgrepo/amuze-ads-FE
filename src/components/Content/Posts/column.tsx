
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"
import { CircleCheck, CircleCheckBig, ClockFadingIcon, MinusCircle, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import type { PostResponse } from "../../../dto/response/content/postResponse";
import PostActions from "./post_action";

const columns: ColumnDef<PostResponse>[] = [
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
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("title")}</div>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
            const description = row.getValue("description") as string;

            if (!description) return "—";

            return (
                <div className="max-w-105 truncate">
                    {description.length > 50
                        ? `${description.slice(0, 50)}...`
                        : description}
                </div>
            );
        },
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status");
            let icon;

            switch (status) {
                case 'active' : icon = <CircleCheck color='green' />
                break;
                case 'approved' : icon = <CircleCheckBig color='green' />
                break;
                case 'pending' : icon = <ClockFadingIcon color='yellow' />
                break;
                case 'disabled' : icon = <MinusCircle color="gray" />
                break;
                case 'rejected' : icon = <XCircle color='red' />
                break;
                default : <XCircle color='red'/>
                break;
            }
        
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-pointer relative inline-flex">{icon}</span>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                            {status as string}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
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
            const post = row.original
            return (
                <PostActions {...post} />
            )
        },
    },
]

export default columns;