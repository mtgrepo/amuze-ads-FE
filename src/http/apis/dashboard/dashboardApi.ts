import { AxiosError } from "axios";
import axiosInstance from "../../httpClient";

export const getAttention = async () => {
    try {
        const response = await axiosInstance.get(`/dashboard/admin/attention`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch attention items");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getPointsSummary = async (fromDate?: string, toDate?: string) => {
    try {
        const params = new URLSearchParams();
        if (fromDate) params.set("fromDate", fromDate);
        if (toDate) params.set("toDate", toDate);
        const response = await axiosInstance.get(`/dashboard/admin/points?${params}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch points summary");
        }
        throw new Error("An unexpected error occurred");
    }
};
