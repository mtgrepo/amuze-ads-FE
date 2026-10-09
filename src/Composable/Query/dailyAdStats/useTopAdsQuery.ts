import { useQuery } from "@tanstack/react-query";
import { getTopAds } from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import type { TopAdItem } from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export const useTopAdsQuery = (limit: number, metric: string, fromDate?: string, toDate?: string, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: TopAdItem[] }>({
        queryKey: ["top-ads", limit, metric, fromDate, toDate, advertiserId],
        queryFn: () => getTopAds(limit, metric, fromDate, toDate, advertiserId),
    });
    return { topAdsData: data?.data ?? [], isLoading, isError };
};
