import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../../../http/apis/dashboard/dashboardApi";
import type { DashboardSummaryResponse } from "../../../dto/response/dashboard/dashboardResponse";

export const useDashboardSummaryQuery = (fromDate?: string, toDate?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: DashboardSummaryResponse }>({
        queryKey: ["dashboard-summary", fromDate, toDate],
        queryFn: () => getDashboardSummary(fromDate, toDate),
    });
    return { summary: data?.data, isLoading, isError };
};
