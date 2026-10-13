import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import type { AdminOverviewResponse } from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export const useAdminOverviewQuery = (fromDate?: string, toDate?: string, advertiserId?: string, adId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: AdminOverviewResponse }>({
        queryKey: ["admin-overview", fromDate, toDate, advertiserId, adId],
        queryFn: () => getAdminOverview(fromDate, toDate, advertiserId, adId),
    });
    return { overviewData: data?.data, isLoading, isError };
};
