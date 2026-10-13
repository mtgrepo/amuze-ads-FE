import { useQuery } from "@tanstack/react-query";
import { getAdminTrend } from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import type { AdminTrendItem } from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export const useAdminTrendQuery = (fromDate?: string, toDate?: string, advertiserId?: string, adId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: AdminTrendItem[] }>({
        queryKey: ["admin-trend", fromDate, toDate, advertiserId, adId],
        queryFn: () => getAdminTrend(fromDate, toDate, advertiserId, adId),
    });
    return { trendData: data?.data ?? [], isLoading, isError };
};
