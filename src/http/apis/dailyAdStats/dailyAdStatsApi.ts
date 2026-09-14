import { AxiosError } from "axios";
import axiosInstance from "../../httpClient";

export const getAdminOverview = async (fromDate?: string, toDate?: string, advertiserId?: string) => {
    try {
        const params = new URLSearchParams();
        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);
        if (advertiserId) params.set("advertiserId", advertiserId);
        const response = await axiosInstance.get(`/daily-ad-stats/admin/overview?${params}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch overview");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getAdminTrend = async (fromDate?: string, toDate?: string, advertiserId?: string) => {
    try {
        const params = new URLSearchParams();
        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);
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

export const getTopAds = async (limit: number, metric: string, fromDate?: string, toDate?: string, advertiserId?: string) => {
    try {
        const params = new URLSearchParams({ limit: String(limit), metric });
        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);
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
