import { Link, useParams } from "react-router-dom";
import { TransactionDetailComponent } from "../../../components/Financial/Transactions/transaction_detail_component";
import { useLedgerEntryQuery } from "../../../Composable/Query/points/useLedgerEntryQuery";

function DetailLoading() {
    return (
        <div role="status" aria-label="Loading transaction" className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
            <div className="overflow-hidden rounded-[14px] border bg-card">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex gap-6 border-b px-[18px] py-4 last:border-b-0">
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-3 flex-1 animate-pulse rounded bg-muted" style={{ maxWidth: `${60 - i * 6}%` }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function TransactionDetailPage() {
    const { id } = useParams();
    const { detail, isLoading, error } = useLedgerEntryQuery(id);
    return (
        <div className="w-full px-4 py-6 lg:px-6">
            {isLoading ? <DetailLoading /> : detail ? <TransactionDetailComponent detail={detail} /> : (
                <div className="mx-auto flex max-w-[860px] flex-col items-center gap-2 rounded-[14px] border bg-card px-5 py-12 text-center">
                    <span className="font-medium">Transaction not found</span>
                    <span className="text-sm text-muted-foreground">{error?.message ?? "It may have been removed."}</span>
                    <Link to="/transactions" className="mt-2 text-sm font-medium text-primary hover:underline">Back to transactions</Link>
                </div>
            )}
        </div>
    );
}
