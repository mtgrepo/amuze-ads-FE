import type { ColumnDef } from "@tanstack/react-table";
import type { TransactionResponse } from "../../../dto/response/transactions/transactionResponse";

const columns: ColumnDef<TransactionResponse>[] = [
    {
        id: "advertiser",
        accessorFn: (row) => row.advertiser.name,
        header: "Advertiser",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("advertiser")}</div>
        ),
    },
    {
        id: "campaign",
        accessorFn: (row) => row.campaign?.name ?? "-",
        header: "Campaign",
        cell: ({ row }) => (
            <div>{row.getValue("campaign")}</div>
        ),
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
            <div>{row.getValue("amount")}</div>
        ),
    },
    {
        id: "paymentMethod",
        accessorFn: (row) => row.paymentMethod,
        header: "Payment Method",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("paymentMethod")}</div>
        ),
    },
    {
        accessorKey: "referenceType",
        header: "Reference Type",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("referenceType")}</div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return (
                <div>{date.toLocaleString()}</div>
            )
        },
    },
]

export default columns;
