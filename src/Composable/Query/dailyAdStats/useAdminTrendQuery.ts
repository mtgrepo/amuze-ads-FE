import { useQuery } from "@tanstack/react-query";
import { getAdminTrend } from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import type { AdminTrendItem } from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export const useAdminTrendQuery = (fromDate?: string, toDate?: string, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: AdminTrendItem[] }>({
        queryKey: ["admin-trend", fromDate, toDate, advertiserId],
        queryFn: () => getAdminTrend(fromDate, toDate, advertiserId),
    });
    return { trendData: data?.data ?? [], isLoading, isError };
};
