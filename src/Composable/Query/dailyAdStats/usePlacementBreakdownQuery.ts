import { useQuery } from "@tanstack/react-query";
import { getPlacementBreakdown } from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import type { PlacementBreakdownItem } from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export const usePlacementBreakdownQuery = (fromDate?: string, toDate?: string, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: PlacementBreakdownItem[] }>({
        queryKey: ["placement-breakdown", fromDate, toDate, advertiserId],
        queryFn: () => getPlacementBreakdown(fromDate, toDate, advertiserId),
    });
    return { placementData: data?.data ?? [], isLoading, isError };
};
