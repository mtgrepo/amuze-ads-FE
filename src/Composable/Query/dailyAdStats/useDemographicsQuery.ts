import { useQuery } from "@tanstack/react-query";
import { getDemographics } from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import type { DemographicsResponse } from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export const useDemographicsQuery = (fromDate?: string, toDate?: string, advertiserId?: string, adId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: DemographicsResponse }>({
        queryKey: ["demographics", fromDate, toDate, advertiserId, adId],
        queryFn: () => getDemographics(fromDate, toDate, advertiserId, adId),
    });
    return { byAge: data?.data?.byAge ?? [], byGender: data?.data?.byGender ?? [], isLoading, isError };
};
