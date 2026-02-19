import { useQuery } from "@tanstack/react-query";
import {
    getAdminOverview,
    getAdminTrend,
    getPricingDistribution,
    getTopAds,
} from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import type {
    AdminOverviewResponse,
    AdminTrendItem,
    PricingDistributionItem,
    TopAdItem,
} from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export const useAdminOverviewQuery = () => {
    const { data, isLoading, isError } = useQuery<{ data: AdminOverviewResponse }>({
        queryKey: ["admin-overview"],
        queryFn: getAdminOverview,
    });
    return { overviewData: data?.data, isLoading, isError };
};

export const useAdminTrendQuery = (days: number) => {
    const { data, isLoading, isError } = useQuery<{ data: AdminTrendItem[] }>({
        queryKey: ["admin-trend", days],
        queryFn: () => getAdminTrend(days),
    });
    return { trendData: data?.data ?? [], isLoading, isError };
};

export const usePricingDistributionQuery = () => {
    const { data, isLoading, isError } = useQuery<{ data: PricingDistributionItem[] }>({
        queryKey: ["pricing-distribution"],
        queryFn: getPricingDistribution,
    });
    return { pricingData: data?.data ?? [], isLoading, isError };
};

export const useTopAdsQuery = (limit: number, metric: string) => {
    const { data, isLoading, isError } = useQuery<{ data: TopAdItem[] }>({
        queryKey: ["top-ads", limit, metric],
        queryFn: () => getTopAds(limit, metric),
    });
    return { topAdsData: data?.data ?? [], isLoading, isError };
};
