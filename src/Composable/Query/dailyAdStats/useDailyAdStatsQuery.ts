import { useQuery } from "@tanstack/react-query";
import {
    getAdminOverview,
    getAdminTrend,
    getTopAds,
    getPlacementBreakdown,
} from "../../../http/apis/dailyAdStats/dailyAdStatsApi";
import { getAdvertisers } from "../../../http/apis/advertisers/advertisersApi";
import type {
    AdminOverviewResponse,
    AdminTrendItem,
    TopAdItem,
    PlacementBreakdownItem,
} from "../../../dto/response/dailyAdStats/dailyAdStatsResponse";

export interface AdvertiserOption {
    id: string;
    name: string;
    type: "agency" | "advertiser";
    agencyId: string | null;
}

export const useAdminOverviewQuery = (fromDate?: string, toDate?: string, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: AdminOverviewResponse }>({
        queryKey: ["admin-overview", fromDate, toDate, advertiserId],
        queryFn: () => getAdminOverview(fromDate, toDate, advertiserId),
    });
    return { overviewData: data?.data, isLoading, isError };
};

export const useAdminTrendQuery = (fromDate?: string, toDate?: string, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: AdminTrendItem[] }>({
        queryKey: ["admin-trend", fromDate, toDate, advertiserId],
        queryFn: () => getAdminTrend(fromDate, toDate, advertiserId),
    });
    return { trendData: data?.data ?? [], isLoading, isError };
};

export const useTopAdsQuery = (limit: number, metric: string, fromDate?: string, toDate?: string, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: TopAdItem[] }>({
        queryKey: ["top-ads", limit, metric, fromDate, toDate, advertiserId],
        queryFn: () => getTopAds(limit, metric, fromDate, toDate, advertiserId),
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

export const usePlacementBreakdownQuery = (fromDate?: string, toDate?: string, advertiserId?: string) => {
    const { data, isLoading, isError } = useQuery<{ data: PlacementBreakdownItem[] }>({
        queryKey: ["placement-breakdown", fromDate, toDate, advertiserId],
        queryFn: () => getPlacementBreakdown(fromDate, toDate, advertiserId),
    });
    return { placementData: data?.data ?? [], isLoading, isError };
};
