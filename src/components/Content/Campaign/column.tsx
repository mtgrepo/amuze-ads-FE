
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"
import type { CampaignResponse } from "../../../dto/response/content/campaignResponse";
import CampaignActions from "./campaign_action";

const columns: ColumnDef<CampaignResponse>[] = [
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
        accessorKey: "objective",
        header: "Objective",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("objective")}</div>
        ),
    },
    {
        accessorKey: "dailyBudget",
        header: "Daily Budget",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("dailyBudget")}</div>
        ),
    },
    {
        accessorKey: "totalBudget",
        header: "Total Budget",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("totalBudget")}</div>
        ),
    },
    {
        accessorKey: "spentAmount",
        header: "Spent Amount",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("spentAmount")}</div>
        ),
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("startDate"));

            return (
                <div className="capitalize">
                    {date.toLocaleString()}
                </div>
            )
        },
    },
    {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("endDate"));

            return (
                <div className="capitalize">
                    {date.toLocaleString()}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status");
            return (
                <div >
                    {status as string}
                </div>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const campaign = row.original
            return (
                <CampaignActions {...campaign} />
            )
        },
    },
]

export default columns;