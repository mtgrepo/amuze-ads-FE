import { TransactionComponent } from "../../../components/Financial/Transactions/transaction_component";
import { usePointsLedgerQuery } from "../../../Composable/Query/points/usePointsLedgerQuery";
import { useTransactionListQuery } from "../../../Composable/Query/transactions/useTransactionListQuery";
import type { TransactionResponse } from "../../../dto/response/transactions/transactionResponse";

function TransactionsLoading() {
    return (
        <div role="status" aria-label="Loading transactions" className="flex flex-col gap-5">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="flex flex-wrap gap-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[92px] flex-[1_1_200px] animate-pulse rounded-[14px] bg-muted" />)}
            </div>
            <div className="overflow-hidden rounded-[14px] border bg-card">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0">
                        <div className="size-8 animate-pulse rounded-full bg-muted" />
                        <div className="h-3 flex-1 animate-pulse rounded bg-muted" style={{ maxWidth: `${55 - i * 5}%` }} />
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// The ledger is every point in and out; the money transactions add how paid top-ups were paid.
export default function TransactionsPage() {
    const { ledger, isLoading } = usePointsLedgerQuery();
    const { transactionList, isLoading: paymentsLoading } = useTransactionListQuery();
    return (
        <div className="w-full px-4 py-6 lg:px-6">
            {isLoading || paymentsLoading
                ? <TransactionsLoading />
                : <TransactionComponent entries={ledger?.entries ?? []} payments={(transactionList ?? []) as TransactionResponse[]} />}
        </div>
    )
}
