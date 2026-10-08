import { useQuery } from "@tanstack/react-query";
import { getAttention, getDashboardSummary, getPointsSummary } from "../../../http/apis/dashboard/dashboardApi";
import type { AttentionResponse, DashboardSummaryResponse, PointsSummaryResponse } from "../../../dto/response/dashboard/dashboardResponse";

export const useAttentionQuery = () => {
    const { data, isLoading, isError } = useQuery<{ data: AttentionResponse }>({
        queryKey: ["dashboard-attention"],
        queryFn: getAttention,
    });
    return { attention: data?.data, isLoading, isError };
};

export const usePointsSummaryQuery = (fromDate?: string, toDate?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: PointsSummaryResponse }>({
        queryKey: ["dashboard-points", fromDate, toDate],
        queryFn: () => getPointsSummary(fromDate, toDate),
    });
    return { pointsSummary: data?.data, isLoading, isError };
};

export const useDashboardSummaryQuery = (fromDate?: string, toDate?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: DashboardSummaryResponse }>({
        queryKey: ["dashboard-summary", fromDate, toDate],
        queryFn: () => getDashboardSummary(fromDate, toDate),
    });
    return { summary: data?.data, isLoading, isError };
};
