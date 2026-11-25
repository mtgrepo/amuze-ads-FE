import { useQuery } from "@tanstack/react-query";
import { getIncome } from "../../../http/apis/dashboard/dashboardApi";
import type { IncomeResponse } from "../../../dto/response/dashboard/dashboardResponse";

export const useIncomeQuery = (fromDate?: string, toDate?: string) => {
    const { data, isLoading, isError, refetch } = useQuery<{ data: IncomeResponse }>({
        queryKey: ["income", fromDate, toDate],
        queryFn: () => getIncome(fromDate, toDate),
    });
    return { income: data?.data, isLoading, isError, refetch };
};
