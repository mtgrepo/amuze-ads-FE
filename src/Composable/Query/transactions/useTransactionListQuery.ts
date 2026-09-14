import { useQuery } from "@tanstack/react-query"
import { getAllTransactions } from "../../../http/apis/transactions/transactionApi";

export const useTransactionListQuery = () => {
    const transactionList = useQuery({
        queryKey: ['transaction-list'],
        queryFn: async () => {
            const response = await getAllTransactions();
            return response?.data;
        }
    })
    return {
        transactionList: transactionList?.data,
        isLoading: transactionList?.isLoading,
        isError: transactionList?.isError
    }
}
