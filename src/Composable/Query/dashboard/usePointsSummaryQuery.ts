import { useQuery } from "@tanstack/react-query";
import { getPointsSummary } from "../../../http/apis/dashboard/dashboardApi";
import type { PointsSummaryResponse } from "../../../dto/response/dashboard/dashboardResponse";

export const usePointsSummaryQuery = (fromDate?: string, toDate?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: PointsSummaryResponse }>({
        queryKey: ["dashboard-points", fromDate, toDate],
        queryFn: () => getPointsSummary(fromDate, toDate),
    });
    return { pointsSummary: data?.data, isLoading, isError };
};
