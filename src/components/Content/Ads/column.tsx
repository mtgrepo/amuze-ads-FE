
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"
import { CircleCheck, ClockFading, Mars, PauseCircle, Venus, VenusAndMars } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import AdsActions from "./ads_actions";

const columns: ColumnDef<AdResponse>[] = [
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
        id: "campaign",
        accessorFn: (row) => row.adSet.campaign.name,
        header: "Campaign",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("campaign")}</div>
        ),
    },
    {
        id: "objective",
        accessorFn: (row) => row.adSet.campaign.objective,
        header: "Objective",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("objective")}</div>
        ),
    },
    {
        id: "gender",
        accessorFn: (row) => row.adSet.gender,
        header: "Gender",
        filterFn: (row, id, filterValue) => {
            if (!filterValue) return true; // "all" or undefined
            return row.getValue(id) === filterValue; // exact match
        },
        cell: ({ row }) => {
            const gender = row.getValue("gender");

            let IconComponent;
            let tooltipText;

            switch (gender) {
                case "male":
                    IconComponent = <Mars color="blue" />;
                    tooltipText = "Male";
                    break;
                case "female":
                    IconComponent = <Venus color="#ff297e" />;
                    tooltipText = "Female";
                    break;
                case "all":
                default:
                    IconComponent = <VenusAndMars color="white" />;
                    tooltipText = "All";
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-pointer relative inline-flex">
                                {IconComponent}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                            {tooltipText}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        id: "category",
        accessorFn: (row) => row.adSet.category,
        header: "Category",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("category")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            let icon;

            switch (row.getValue("status")) {
                case "active":
                    icon = <CircleCheck color="green" />;
                    break;
                case "paused":
                    icon = <PauseCircle color="gray" />;
                    break;
                case "pending":
                    icon = <ClockFading color="yellow" />;
                    break;
                default:
                    icon = null;
            }

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-pointer relative inline-flex">
                                {icon}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                            {row.getValue("status")}
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
            const ad = row.original;
            return <AdsActions {...ad} />;
        },
    },
]

export default columns;