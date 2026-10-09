import { useQuery } from "@tanstack/react-query";
import { getAttention } from "../../../http/apis/dashboard/dashboardApi";
import type { AttentionResponse } from "../../../dto/response/dashboard/dashboardResponse";

export const useAttentionQuery = () => {
    const { data, isLoading, isError } = useQuery<{ data: AttentionResponse }>({
        queryKey: ["dashboard-attention"],
        queryFn: getAttention,
    });
    return { attention: data?.data, isLoading, isError };
};
