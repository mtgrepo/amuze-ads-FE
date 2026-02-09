
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"
import type { AdSetResponse } from "../../../dto/response/content/adSetResponse";
import AdSetAction from "./ad_set_action";

const columns: ColumnDef<AdSetResponse>[] = [
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
        accessorFn: (row) => row.campaign.name,
        header: "Camapaign",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "ageMin",
        header: "Age(Min)",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("ageMin")}</div>
        ),
    },
    {
        accessorKey: "ageMax",
        header: "Age(Max)",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("ageMax")}</div>
        ),
    },
    {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("gender")}</div>
        ),
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("location")}</div>
        ),
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("category")}</div>
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
            const adSet = row.original
            return (
                <AdSetAction {...adSet} />
            )
        },
    },
]

export default columns;