import { useQuery } from "@tanstack/react-query";
import {
    getAdminOverview,
    getAdminTrend,
    getPricingDistribution,
    getTopAds,
} from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import { getAdvertisers } from "../../../http/apis/advertisers/advertisersApi";
import type {
    AdminOverviewResponse,
    AdminTrendItem,
    PricingDistributionItem,
    TopAdItem,
} from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export interface AdvertiserOption {
    id: string;
    name: string;
}

export const useAdminOverviewQuery = (advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: AdminOverviewResponse }>({
        queryKey: ["admin-overview", advertiserId],
        queryFn: () => getAdminOverview(advertiserId),
    });
    return { overviewData: data?.data, isLoading, isError };
};

export const useAdminTrendQuery = (days: number, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: AdminTrendItem[] }>({
        queryKey: ["admin-trend", days, advertiserId],
        queryFn: () => getAdminTrend(days, advertiserId),
    });
    return { trendData: data?.data ?? [], isLoading, isError };
};

export const usePricingDistributionQuery = (advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: PricingDistributionItem[] }>({
        queryKey: ["pricing-distribution", advertiserId],
        queryFn: () => getPricingDistribution(advertiserId),
    });
    return { pricingData: data?.data ?? [], isLoading, isError };
};

export const useTopAdsQuery = (limit: number, metric: string, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: TopAdItem[] }>({
        queryKey: ["top-ads", limit, metric, advertiserId],
        queryFn: () => getTopAds(limit, metric, advertiserId),
    });
    return { topAdsData: data?.data ?? [], isLoading, isError };
};

export const useAdvertisersQuery = () => {
    const { data, isLoading } = useQuery<{ data: AdvertiserOption[] }>({
        queryKey: ["advertisers-list"],
        queryFn: getAdvertisers,
        staleTime: 5 * 60 * 1000,
    });
    return { advertisers: data?.data ?? [], isLoading };
};
