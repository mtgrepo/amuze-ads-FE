import { useQuery } from "@tanstack/react-query"
import { getObjectivePrices } from "../../../http/apis/campaignObjective/campaignObjectiveApi";
import type { ObjectivePrice } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";

/** Objective types that can be bought now, with today's prices. */
export const useObjectivePricesQuery = () => {
    const query = useQuery({
        queryKey: ["objective-prices"],
        queryFn: async () => {
            const response = await getObjectivePrices();
            return (response?.data ?? []) as ObjectivePrice[];
        },
    })
    return {
        prices: query.data ?? [],
        isLoading: query.isLoading,
    }
}
