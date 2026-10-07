import type { ColumnDef } from "@tanstack/react-table";
import { TRANSACTION_TYPE_LABELS, type TransactionResponse } from "../../../dto/response/transactions/transactionResponse";

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
        id: "type",
        accessorFn: (row) => TRANSACTION_TYPE_LABELS[row.referenceType] ?? row.referenceType,
        header: "Type",
        cell: ({ row }) => (
            <div>{row.getValue("type")}</div>
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
