import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import type { AdminOverviewResponse } from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export const useAdminOverviewQuery = (fromDate?: string, toDate?: string, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: AdminOverviewResponse }>({
        queryKey: ["admin-overview", fromDate, toDate, advertiserId],
        queryFn: () => getAdminOverview(fromDate, toDate, advertiserId),
    });
    return { overviewData: data?.data, isLoading, isError };
};
