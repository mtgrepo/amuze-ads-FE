import { useQueries } from "@tanstack/react-query";
import { getWallet } from "../../../http/apis/points/pointsApi";
import type { WalletResponse } from "../../../dto/response/points/pointsResponse";

/**
 * Points balance of each wallet owner (standalone advertisers and agencies), one request per account,
 * sharing the ["wallet", id] cache with useWalletQuery. Fine for tens of accounts; a list endpoint would
 * be needed for many more.
 */
export const useBalancesQuery = (accountIds: string[]) => {
    const results = useQueries({
        queries: accountIds.map((id) => ({
            queryKey: ["wallet", id],
            queryFn: async () => {
                const response = await getWallet(id);
                return response?.data as WalletResponse;
            },
        })),
    });
    const balances = new Map<string, number>();
    results.forEach((r, i) => { if (r.data) balances.set(accountIds[i], Number(r.data.balance)); });
    return { balances, isLoading: results.some((r) => r.isLoading) };
};
