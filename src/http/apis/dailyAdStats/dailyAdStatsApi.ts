import { AxiosError } from "axios";
import axiosInstance from "../../httpClient";

export const getAdminOverview = async (advertiserId?: string) => {
    try {
        const params = advertiserId ? `?advertiserId=${advertiserId}` : "";
        const response = await axiosInstance.get(`/daily-ad-stats/admin/overview${params}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch overview");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getAdminTrend = async (days: number, advertiserId?: string) => {
    try {
        const params = new URLSearchParams({ days: String(days) });
        if (advertiserId) params.set("advertiserId", advertiserId);
        const response = await axiosInstance.get(`/daily-ad-stats/admin/trend?${params}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch trend data");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getTopAds = async (limit: number, metric: string, advertiserId?: string) => {
    try {
        const params = new URLSearchParams({ limit: String(limit), metric });
        if (advertiserId) params.set("advertiserId", advertiserId);
        const response = await axiosInstance.get(`/daily-ad-stats/admin/top-ads?${params}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch top ads");
        }
        throw new Error("An unexpected error occurred");
    }
};
