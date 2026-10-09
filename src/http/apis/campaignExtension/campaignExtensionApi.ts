import { AxiosError } from "axios";
import axiosInstance from "../../httpClient";

function fail(error: unknown, fallback: string): never {
    if (error instanceof AxiosError) {
        const message = error.response?.data?.message;
        throw new Error((Array.isArray(message) ? message.join("; ") : message) || fallback);
    }
    throw new Error("An unexpected error occurred");
}

export const getCampaignExtensions = async (campaignId: string) => {
    try {
        const response = await axiosInstance.get(`/campaign-extensions?campaignId=${encodeURIComponent(campaignId)}`);
        return response.data;
    } catch (error) {
        fail(error, "Failed to load extensions");
    }
};

export const getPendingExtensions = async () => {
    try {
        const response = await axiosInstance.get(`/campaign-extensions?status=pending`);
        return response.data;
    } catch (error) {
        fail(error, "Failed to load pending extensions");
    }
};

export const getExtensionQuote = async (campaignId: string, newEndDate: string) => {
    try {
        const params = new URLSearchParams({ campaignId, newEndDate });
        const response = await axiosInstance.get(`/campaign-extensions/quote?${params}`);
        return response.data;
    } catch (error) {
        fail(error, "Couldn't price this extension");
    }
};

export const requestExtension = async (campaignId: string, newEndDate: string) => {
    try {
        const response = await axiosInstance.post(`/campaign-extensions`, { campaignId, newEndDate });
        return response.data;
    } catch (error) {
        fail(error, "Couldn't extend the campaign");
    }
};

export const approveExtension = async (id: string) => {
    try {
        const response = await axiosInstance.post(`/campaign-extensions/${id}/approve`);
        return response.data;
    } catch (error) {
        fail(error, "Couldn't approve the extension");
    }
};

export const rejectExtension = async (id: string) => {
    try {
        const response = await axiosInstance.post(`/campaign-extensions/${id}/reject`);
        return response.data;
    } catch (error) {
        fail(error, "Couldn't reject the extension");
    }
};
