import { TransactionComponent } from "../../../components/Financial/Transactions/transaction_component";
import { useTransactionListQuery } from "../../../Composable/Query/transactions/useTransactionListQuery";

export default function TransactionsPage() {
    const { transactionList, isLoading } = useTransactionListQuery();
    return (
        <div className="w-full mx-auto px-5 ">
            {isLoading ? <p className="items-center justify-center text-center my-auto">Loading.....</p> : <TransactionComponent data={transactionList ?? []} />}
        </div>
    )
}
