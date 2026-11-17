import { useQuery } from "@tanstack/react-query"
import { getLedgerEntry } from "../../../http/apis/points/pointsApi"
import type { LedgerEntryDetail } from "../../../dto/response/points/pointsResponse"

export const useLedgerEntryQuery = (id: string | undefined) => {
    const query = useQuery({
        queryKey: ['ledger-entry', id],
        queryFn: async () => {
            const response = await getLedgerEntry(id!);
            return response?.data as LedgerEntryDetail;
        },
        enabled: !!id,
        retry: false,
    })
    return {
        detail: query.data,
        isLoading: query.isLoading,
        error: query.error,
    }
}
