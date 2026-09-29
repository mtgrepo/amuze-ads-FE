import { useQuery } from "@tanstack/react-query"
import { getWallet } from "../../../http/apis/points/pointsApi"
import type { WalletResponse } from "../../../dto/response/points/pointsResponse"

export const useWalletQuery = (accountId: string, enabled: boolean = true) => {
    const wallet = useQuery({
        queryKey: ['wallet', accountId],
        queryFn: async () => {
            const response = await getWallet(accountId);
            return response?.data as WalletResponse;
        },
        enabled: enabled && !!accountId,
    })
    return {
        wallet: wallet.data,
        isLoading: wallet.isLoading,
        isError: wallet.isError,
    }
}
