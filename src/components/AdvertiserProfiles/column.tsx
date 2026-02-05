
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox"
import type { ProfileResponse } from "../../dto/response/advertiserProfile/profileResponse";
import ProfileActions from "./profile_action";

const columns: ColumnDef<ProfileResponse>[] = [
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
        accessorKey: "business_name",
        header: "Business Name",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("business_name")}</div>
        ),
    },
    {
        accessorKey: "business_no",
        header: "Business No",
        cell: ({ row }) => (
            <div>{row.getValue("business_no")}</div>
        ),
    },
    {
        accessorKey: "business_type",
        header: "Business Type",
        cell: ({ row }) => (
            <div>{row.getValue("business_type")}</div>
        ),
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
        accessorKey: "dica_number",
        header: "DICA Number",
        cell: ({ row }) => (
            <div>{row.getValue("dica_number")}</div>
        ),
    },
    // {
    //     accessorKey: "createdAt",
    //     header: "Created At",
    //     cell: ({ row }) => {
    //         const date = new Date(row.getValue("createdAt"));

    //         return (
    //             <div className="capitalize">
    //                 {date.toLocaleString()}
    //             </div>
    //         )
    //     },
    // },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const profile = row.original
            console.log("data in column", profile)
            return (
                <ProfileActions {...profile} />
            )
        },
    },
]

export default columns;