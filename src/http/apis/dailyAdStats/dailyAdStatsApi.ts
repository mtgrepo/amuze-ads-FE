import { AxiosError } from "axios";
import axiosInstance from "../../httpClient";

export const getAdminOverview = async () => {
    try {
        const response = await axiosInstance.get("/daily-ad-stats/admin/overview");
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch overview");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getAdminTrend = async (days: number) => {
    try {
        const response = await axiosInstance.get(`/daily-ad-stats/admin/trend?days=${days}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch trend data");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getPricingDistribution = async () => {
    try {
        const response = await axiosInstance.get("/daily-ad-stats/admin/pricing-distribution");
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch pricing distribution");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getTopAds = async (limit: number, metric: string) => {
    try {
        const response = await axiosInstance.get(`/daily-ad-stats/admin/top-ads?limit=${limit}&metric=${metric}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch top ads");
        }
        throw new Error("An unexpected error occurred");
    }
};
