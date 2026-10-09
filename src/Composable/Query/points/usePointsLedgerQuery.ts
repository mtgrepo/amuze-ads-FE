import { useQuery } from "@tanstack/react-query"
import { getPointsLedger } from "../../../http/apis/points/pointsApi"
import type { PointsLedgerResponse } from "../../../dto/response/points/pointsResponse"

export const usePointsLedgerQuery = () => {
    const ledger = useQuery({
        queryKey: ['points-ledger'],
        queryFn: async () => {
            const response = await getPointsLedger();
            return response?.data as PointsLedgerResponse;
        },
    })
    return {
        ledger: ledger.data,
        isLoading: ledger.isLoading,
    }
}
